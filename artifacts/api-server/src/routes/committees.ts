import { Router } from "express";
import { db, committeesTable, committeeMembersTable, studentCommitteesTable, usersTable, thesesTable, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { pushNotification } from "../sse";

const router = Router();

async function sendNotification(userId: number, title: string, message: string, type: string) {
  const [row] = await db.insert(notificationsTable)
    .values({ userId, title, message, type, relatedThesisId: null })
    .returning();
  pushNotification(userId, {
    id: row.id, title, message, type,
    isRead: false, relatedThesisId: null,
    createdAt: row.createdAt.toISOString()
  });
}

async function formatCommittee(committee: typeof committeesTable.$inferSelect) {
  const members = await db.select().from(committeeMembersTable)
    .where(eq(committeeMembersTable.committeeId, committee.id));
  const memberUsers = await Promise.all(members.map(async (m) => {
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.id, m.userId)).limit(1);
    return user ? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isChairman: m.isChairman ?? false,
    } : null;
  }));
  return {
    id: committee.id,
    romanNumeral: committee.romanNumeral,
    description: committee.description ?? null,
    members: memberUsers.filter(Boolean),
    chairman: memberUsers.find((m: any) => m?.isChairman) ?? null,
    createdAt: committee.createdAt.toISOString(),
  };
}

// GET all committees
router.get("/", requireAuth, async (_req, res) => {
  const committees = await db.select().from(committeesTable);
  const formatted = await Promise.all(committees.map(formatCommittee));
  res.json(formatted);
});

// POST create committee
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Only department head can manage committees" });
    return;
  }
  const { romanNumeral, description } = req.body;
  if (!romanNumeral) { res.status(400).json({ error: "Roman numeral is required" }); return; }
  const [committee] = await db.insert(committeesTable)
    .values({ romanNumeral, description: description ?? null })
    .returning();
  res.status(201).json(await formatCommittee(committee));
});

// PATCH update committee
router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const id = Number(req.params.id);
  const { romanNumeral, description } = req.body;
  const updates: any = {};
  if (romanNumeral !== undefined) updates.romanNumeral = romanNumeral;
  if (description !== undefined) updates.description = description;
  const [updated] = await db.update(committeesTable)
    .set(updates).where(eq(committeesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Committee not found" }); return; }
  res.json(await formatCommittee(updated));
});

// DELETE committee
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  await db.delete(committeesTable).where(eq(committeesTable.id, Number(req.params.id)));
  res.json({ message: "Committee deleted" });
});

// POST add member to committee
router.post("/:id/members", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const committeeId = Number(req.params.id);
  const { userId, isChairman } = req.body;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  // Check user is not already in THIS committee
  const existing = await db.select().from(committeeMembersTable)
    .where(and(
      eq(committeeMembersTable.committeeId, committeeId),
      eq(committeeMembersTable.userId, userId)
    ));
  if (existing.length > 0) {
    res.status(400).json({ error: "Този потребител вече е член на тази комисия" });
    return;
  }

  // If setting as chairman, remove previous chairman
  if (isChairman) {
    await db.update(committeeMembersTable)
      .set({ isChairman: false })
      .where(eq(committeeMembersTable.committeeId, committeeId));
  }

  await db.insert(committeeMembersTable)
    .values({ committeeId, userId, isChairman: isChairman ?? false })
    .returning();

  // Get committee info for notification
  const [committee] = await db.select().from(committeesTable)
    .where(eq(committeesTable.id, committeeId)).limit(1);

  // Send notification to added member
  await sendNotification(
    userId,
    "Добавени сте към комисия",
    `Добавени сте като ${isChairman ? "председател" : "член"} на Комисия ${committee?.romanNumeral ?? ""}`,
    "info"
  );

  res.status(201).json({ message: "Member added" });
});

// DELETE remove member from committee
router.delete("/:id/members/:userId", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const committeeId = Number(req.params.id);
  const userId = Number(req.params.userId);

  // Get committee info for notification
  const [committee] = await db.select().from(committeesTable)
    .where(eq(committeesTable.id, committeeId)).limit(1);

  await db.delete(committeeMembersTable)
    .where(and(
      eq(committeeMembersTable.committeeId, committeeId),
      eq(committeeMembersTable.userId, userId)
    ));

  // Send notification to removed member
  await sendNotification(
    userId,
    "Премахнати сте от комисия",
    `Премахнати сте от Комисия ${committee?.romanNumeral ?? ""}`,
    "warning"
  );

  res.json({ message: "Member removed" });
});

// GET available committees for student (excludes supervisor/reviewer conflicts)
router.get("/available-for-student/:studentId", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const studentId = Number(req.params.studentId);
  const theses = await db.select().from(thesesTable)
    .where(eq(thesesTable.studentId, studentId));
  const thesis = theses[0];
  const excludedIds: number[] = [];
  if (thesis?.supervisorId) excludedIds.push(thesis.supervisorId);
  if (thesis?.reviewerId) excludedIds.push(thesis.reviewerId);

  const allCommittees = await db.select().from(committeesTable);
  const result = await Promise.all(allCommittees.map(async (c) => {
    const members = await db.select().from(committeeMembersTable)
      .where(eq(committeeMembersTable.committeeId, c.id));
    const memberIds = members.map(m => m.userId);
    const hasConflict = excludedIds.some(id => memberIds.includes(id));
    const formatted = await formatCommittee(c);
    return {
      ...formatted,
      disabled: hasConflict,
      disabledReason: hasConflict ? "Съдържа научния ръководител или рецензента на студента" : null
    };
  }));
  res.json(result);
});

// POST assign student to committee
router.post("/assign-student", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const { studentId, committeeId } = req.body;
  if (!studentId || !committeeId) {
    res.status(400).json({ error: "studentId and committeeId are required" }); return;
  }

  // Check conflict
  const theses = await db.select().from(thesesTable)
    .where(eq(thesesTable.studentId, studentId));
  const thesis = theses[0];
  const excludedIds: number[] = [];
  if (thesis?.supervisorId) excludedIds.push(thesis.supervisorId);
  if (thesis?.reviewerId) excludedIds.push(thesis.reviewerId);

  if (excludedIds.length > 0) {
    const members = await db.select().from(committeeMembersTable)
      .where(eq(committeeMembersTable.committeeId, committeeId));
    const memberIds = members.map(m => m.userId);
    if (excludedIds.some(id => memberIds.includes(id))) {
      res.status(400).json({ error: "Тази комисия съдържа научния ръководител или рецензента на студента" });
      return;
    }
  }

  const existing = await db.select().from(studentCommitteesTable)
    .where(eq(studentCommitteesTable.studentId, studentId));
  if (existing.length > 0) {
    await db.update(studentCommitteesTable)
      .set({ committeeId })
      .where(eq(studentCommitteesTable.studentId, studentId));
  } else {
    await db.insert(studentCommitteesTable).values({ studentId, committeeId });
  }
  res.json({ message: "Студентът е назначен към комисията" });
});

// GET student's own committee
router.get("/my-committee", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "student") {
    res.status(403).json({ error: "Only students" }); return;
  }
  const [assignment] = await db.select().from(studentCommitteesTable)
    .where(eq(studentCommitteesTable.studentId, req.userId!));
  if (!assignment) { res.json(null); return; }
  const [committee] = await db.select().from(committeesTable)
    .where(eq(committeesTable.id, assignment.committeeId)).limit(1);
  if (!committee) { res.json(null); return; }
  res.json(await formatCommittee(committee));
});

export default router;
