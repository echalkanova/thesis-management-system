import { Router } from "express";
import { db, usersTable, supervisorRequestsTable, thesesTable, notificationsTable } from "@workspace/db";
import { eq, inArray, sql } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth";
import { logAction } from "./auditLog";
import { createHmac } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHmac("sha256", "thesis-pw-salt").update(password).digest("hex");
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    faculty: user.faculty ?? null,
    department: user.department ?? null,
    phoneNumber: user.phoneNumber ?? null,
    avatarUrl: user.avatarUrl ?? null,
    facultyNumber: user.facultyNumber ?? null,
    subjectTaught: user.subjectTaught ?? null,
    maxStudents: user.maxStudents ?? 40,
    specialty: (user as any).specialty ?? null,
    degree: (user as any).degree ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { role, search } = req.query as { role?: string; search?: string };
  let users = await db.select().from(usersTable);
  if (role === "reviewer") {
    // Показва всички преподаватели, назначени като рецензенти
    const theses = await db.select().from(thesesTable);
    const reviewerIds = [...new Set(theses.map(t => t.reviewerId).filter(Boolean))];
    users = users.filter(u => reviewerIds.includes(u.id));
  } else if (role) {
    users = users.filter(u => u.role === role);
  }
  if (search) {
    const s = search.toLowerCase();
    users = users.filter(u =>
      u.firstName.toLowerCase().includes(s) ||
      u.lastName.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s)
    );
  }
  res.json(users.map(formatUser));
});


router.get("/supervisors/list", requireAuth, async (req: AuthRequest, res) => {
  const supervisors = await db.select().from(usersTable)
    .where(inArray(usersTable.role, ["supervisor", "reviewer", "department_head"]));

  const result = await Promise.all(supervisors.map(async (s) => {
    const allRequests = await db.select().from(supervisorRequestsTable)
      .where(eq(supervisorRequestsTable.supervisorId, s.id));
    const acceptedCount = allRequests.filter(r => r.status === "accepted").length;
    return {
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      subjectTaught: s.subjectTaught ?? null,
      facultyNumber: s.facultyNumber ?? null,
      faculty: s.faculty ?? null,
      department: s.department ?? null,
      maxStudents: s.maxStudents ?? 10,
      acceptedStudents: acceptedCount,
      freeSlots: (s.maxStudents ?? 10) - acceptedCount,
    };
  }));

  res.json(result);
});

router.get("/reviewers/list", requireAuth, async (req: AuthRequest, res) => {
  const reviewers = await db.select().from(usersTable)
    .where(inArray(usersTable.role, ["reviewer", "supervisor", "department_head"]));
  
  const result = await Promise.all(reviewers.map(async (r) => {
    const assignedTheses = await db.select().from(thesesTable)
      .where(eq(thesesTable.reviewerId, r.id));
    const activeCount = assignedTheses.filter((t: any) => 
      !["defended", "draft"].includes(t.status)
    ).length;
    const maxSlots = r.maxStudents ?? 10;
    return {
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      subjectTaught: r.subjectTaught ?? null,
      facultyNumber: r.facultyNumber ?? null,
      maxStudents: maxSlots,
      activeReviews: activeCount,
      freeSlots: maxSlots - activeCount,
    };
  }));
  
  res.json(result);
});

router.post("/", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  const { email, password, firstName, lastName, role, faculty, department, phoneNumber, facultyNumber, subjectTaught, maxStudents, specialty, degree } = req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (role === "department_head" && department) {
    const existing = await db.select().from(usersTable)
      .where(eq(usersTable.role, "department_head"));
    const conflict = existing.find(u => u.department === department);
    if (conflict) {
      res.status(400).json({ error: `Катедра "${department}" вече има ръководител: ${conflict.firstName} ${conflict.lastName}` });
      return;
    }
  }

  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash: hashPassword(password),
    firstName,
    lastName,
    role,
    faculty: faculty ?? null,
    department: department ?? null,
    phoneNumber: phoneNumber ?? null,
    facultyNumber: facultyNumber ?? null,
    subjectTaught: subjectTaught ?? null,
    specialty: specialty ?? null,
    degree: degree ?? null,
    maxStudents: maxStudents ?? 40,
  }).returning();
  await logAction(req.userId!, "create_user", "user", user.id, { email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` });
  res.status(201).json(formatUser(user));
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (req.userRole !== "admin" && req.userId !== id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { firstName, lastName, faculty, department, phoneNumber, avatarUrl, role, subjectTaught, maxStudents, facultyNumber, specialty, degree, password } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (firstName !== undefined) updates.firstName = firstName;
  if (lastName !== undefined) updates.lastName = lastName;
  if (faculty !== undefined) updates.faculty = faculty;
  if (department !== undefined) updates.department = department;
  if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (role !== undefined && req.userRole === "admin") updates.role = role;
  if (subjectTaught !== undefined) updates.subjectTaught = subjectTaught;
  if (maxStudents !== undefined && req.userRole === "admin") updates.maxStudents = maxStudents;
  if (facultyNumber !== undefined) updates.facultyNumber = facultyNumber || null;
  if (specialty !== undefined) (updates as any).specialty = specialty || null;
  if (degree !== undefined) (updates as any).degree = degree || null;
  console.log("password received:", password);
  if (password) {
    const { createHmac } = await import("crypto");
    (updates as any).passwordHash = createHmac("sha256", "thesis-pw-salt").update(password).digest("hex");
    console.log("passwordHash updated");
  }
  if (specialty !== undefined) (updates as any).specialty = specialty || null;
  if (degree !== undefined) (updates as any).degree = degree || null;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  await logAction(req.userId!, "update_user", "user", user.id, { name: `${user.firstName} ${user.lastName}` });
  res.json(formatUser(user));
});

router.post("/:id/change-password", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (req.userId !== id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (user.passwordHash !== hashPassword(currentPassword)) {
    res.status(400).json({ error: "Incorrect current password" });
    return;
  }
  await db.update(usersTable).set({ passwordHash: hashPassword(newPassword) }).where(eq(usersTable.id, id));
  res.json({ message: "Password changed" });
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [deletedUser] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    // Изтрий всички свързани записи
    await db.delete(notificationsTable).where(eq(notificationsTable.userId, id));
    await db.execute(sql`DELETE FROM audit_log WHERE user_id = ${id}`);
    await db.execute(sql`DELETE FROM messages WHERE sender_id = ${id} OR receiver_id = ${id}`);
    await db.execute(sql`DELETE FROM supervisor_requests WHERE student_id = ${id} OR supervisor_id = ${id} OR reviewer_id = ${id}`);
    await db.execute(sql`DELETE FROM committee_members WHERE user_id = ${id}`);
    await db.execute(sql`DELETE FROM student_committees WHERE student_id = ${id}`);
    await db.execute(sql`DELETE FROM defense_students WHERE student_id = ${id}`);
    await db.execute(sql`DELETE FROM reviews WHERE reviewer_id = ${id}`);
    await db.execute(sql`DELETE FROM grades WHERE grader_id = ${id}`);
    await db.execute(sql`DELETE FROM thesis_files WHERE uploaded_by = ${id}`);
    await db.execute(sql`DELETE FROM theses WHERE student_id = ${id} OR supervisor_id = ${id} OR reviewer_id = ${id}`);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    await logAction((req as AuthRequest).userId!, "delete_user", "user", id, { name: `${deletedUser?.firstName} ${deletedUser?.lastName}`, email: deletedUser?.email });
    res.json({ message: "User deleted" });
  } catch (e: any) {
    console.error("Delete user error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
