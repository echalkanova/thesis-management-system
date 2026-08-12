import { Router } from "express";
import { db, gradesTable, usersTable, thesesTable } from "@workspace/db";
import { logAction } from "./auditLog";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

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
    createdAt: user.createdAt.toISOString(),
  };
}

async function formatGrade(grade: typeof gradesTable.$inferSelect) {
  const [grader] = await db.select().from(usersTable).where(eq(usersTable.id, grade.graderId)).limit(1);
  return {
    id: grade.id,
    thesisId: grade.thesisId,
    graderId: grade.graderId,
    value: grade.value,
    comment: grade.comment ?? null,
    createdAt: grade.createdAt.toISOString(),
    grader: grader ? formatUser(grader) : null,
  };
}

async function recalculateFinalGrade(thesisId: number) {
  const grades = await db.select().from(gradesTable).where(eq(gradesTable.thesisId, thesisId));
  if (grades.length === 0) return;
  const avg = grades.reduce((sum, g) => sum + g.value, 0) / grades.length;
  const finalGrade = Math.round(avg * 100) / 100;
  await db.update(thesesTable)
    .set({ finalGrade, gradeCalculatedAt: new Date() })
    .where(eq(thesesTable.id, thesisId));
  return finalGrade;
}

export const thesisGradesRouter = Router({ mergeParams: true });

thesisGradesRouter.get("/", requireAuth, async (req, res) => {
  const thesisId = Number(req.params.id);
  const grades = await db.select().from(gradesTable).where(eq(gradesTable.thesisId, thesisId));
  const formatted = await Promise.all(grades.map(formatGrade));
  res.json(formatted);
});

thesisGradesRouter.get("/final", requireAuth, async (req, res) => {
  const thesisId = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, thesisId)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }
  res.json({
    thesisId,
    finalGrade: thesis.finalGrade ?? null,
    gradeCalculatedAt: thesis.gradeCalculatedAt?.toISOString() ?? null,
  });
});

thesisGradesRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const thesisId = Number(req.params.id);

  // Намери дипломната работа
  const [thesis] = await db.select().from(thesesTable)
    .where(eq(thesesTable.id, thesisId)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }

  // Намери комисията на студента
  const { studentCommitteesTable, committeeMembersTable } = await import("@workspace/db");
  const [studentCommittee] = await db.select().from(studentCommitteesTable)
    .where(eq(studentCommitteesTable.studentId, thesis.studentId));

  if (!studentCommittee) {
    res.status(403).json({ error: "Студентът не е назначен към комисия" });
    return;
  }

  // Провери дали текущият потребител е председател на тази комисия
  const [chairmanRecord] = await db.select().from(committeeMembersTable)
    .where(and(
      eq(committeeMembersTable.committeeId, studentCommittee.committeeId),
      eq(committeeMembersTable.userId, req.userId!),
      eq(committeeMembersTable.isChairman, true)
    )).limit(1);

  if (!chairmanRecord && req.userRole !== "admin") {
    res.status(403).json({ error: "Само председателят на комисията може да нанася оценка" });
    return;
  }

  const { value, comment } = req.body;
  if (value === undefined) {
    res.status(400).json({ error: "Value is required" }); return;
  }
  if (value < 2 || value > 6) {
    res.status(400).json({ error: "Grade must be between 2 and 6" }); return;
  }

  // Изтрий стари оценки и добави нова (крайна оценка)
  await db.delete(gradesTable).where(eq(gradesTable.thesisId, thesisId));

  const [grade] = await db.insert(gradesTable).values({
    thesisId,
    graderId: req.userId!,
    value,
    comment: comment ?? null,
  }).returning();

  await recalculateFinalGrade(thesisId);
  res.status(201).json(await formatGrade(grade));
});

export const gradesRouter = Router();

gradesRouter.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [grade] = await db.select().from(gradesTable).where(eq(gradesTable.id, id)).limit(1);
  if (!grade) {
    res.status(404).json({ error: "Grade not found" });
    return;
  }
  if (req.userRole !== "admin" && grade.graderId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { value, comment } = req.body;
  const updates: Partial<typeof gradesTable.$inferInsert> = {};
  if (value !== undefined) updates.value = value;
  if (comment !== undefined) updates.comment = comment;
  const [updated] = await db.update(gradesTable).set(updates).where(eq(gradesTable.id, id)).returning();
  await recalculateFinalGrade(updated.thesisId);
  res.json(await formatGrade(updated));
});
