import { Router } from "express";
import { db, usersTable, supervisorRequestsTable, thesesTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
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
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { role, search } = req.query as { role?: string; search?: string };
  let users = await db.select().from(usersTable);
  if (role) users = users.filter(u => u.role === role);
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

// Must be before /:id to avoid route conflict
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
      maxStudents: s.maxStudents ?? 40,
      acceptedStudents: acceptedCount,
      freeSlots: (s.maxStudents ?? 40) - acceptedCount,
    };
  }));

  res.json(result);
});

router.get("/reviewers/list", requireAuth, async (req: AuthRequest, res) => {
  const reviewers = await db.select().from(usersTable)
    .where(eq(usersTable.role, "reviewer"));
  
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
  const { email, password, firstName, lastName, role, faculty, department, phoneNumber, facultyNumber, subjectTaught, maxStudents } = req.body;
  if (!email || !password || !firstName || !lastName || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
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
  const { firstName, lastName, faculty, department, phoneNumber, avatarUrl, role, subjectTaught, maxStudents, facultyNumber } = req.body;
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
  const [deletedUser] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  await logAction((req as AuthRequest).userId!, "delete_user", "user", id, { name: `${deletedUser?.firstName} ${deletedUser?.lastName}`, email: deletedUser?.email });
  res.json({ message: "User deleted" });
});

export default router;
