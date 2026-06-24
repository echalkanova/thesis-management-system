import { Router } from "express";
import { db, gradesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

export const thesisGradesRouter = Router({ mergeParams: true });

thesisGradesRouter.get("/", requireAuth, async (req, res) => {
  const thesisId = Number(req.params.id);
  const grades = await db.select().from(gradesTable).where(eq(gradesTable.thesisId, thesisId));
  const formatted = await Promise.all(grades.map(formatGrade));
  res.json(formatted);
});

thesisGradesRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const thesisId = Number(req.params.id);
  const { value, comment } = req.body;
  if (value === undefined) {
    res.status(400).json({ error: "Value is required" });
    return;
  }
  const [grade] = await db.insert(gradesTable).values({
    thesisId,
    graderId: req.userId!,
    value,
    comment: comment ?? null,
  }).returning();
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
  res.json(await formatGrade(updated));
});
