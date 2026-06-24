import { Router } from "express";
import { db, usersTable, thesesTable, defensesTable, reviewsTable, gradesTable } from "@workspace/db";
import { eq, sql, gte, lte } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

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

async function formatThesisSimple(thesis: typeof thesesTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, thesis.studentId)).limit(1);
  return {
    id: thesis.id,
    title: thesis.title,
    description: thesis.description ?? null,
    status: thesis.status,
    studentId: thesis.studentId,
    supervisorId: thesis.supervisorId ?? null,
    reviewerId: thesis.reviewerId ?? null,
    defenseId: thesis.defenseId ?? null,
    keywords: thesis.keywords ?? null,
    field: thesis.field ?? null,
    submittedAt: thesis.submittedAt?.toISOString() ?? null,
    createdAt: thesis.createdAt.toISOString(),
    updatedAt: thesis.updatedAt.toISOString(),
    student: student ? formatUser(student) : null,
    supervisor: null,
    reviewer: null,
  };
}

router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  const allTheses = await db.select().from(thesesTable);
  const allUsers = await db.select().from(usersTable);
  const allDefenses = await db.select().from(defensesTable);
  const allReviews = await db.select().from(reviewsTable);
  const allGrades = await db.select().from(gradesTable);

  const thesesByStatus: Record<string, number> = {};
  for (const t of allTheses) {
    thesesByStatus[t.status] = (thesesByStatus[t.status] ?? 0) + 1;
  }

  const now = new Date();
  const upcomingDefenses = allDefenses.filter(d => d.scheduledAt > now);
  const pendingReviews = allTheses.filter(t => t.status === "submitted" || t.status === "under_review").length;
  const avgGrade = allGrades.length > 0 ? allGrades.reduce((s, g) => s + g.value, 0) / allGrades.length : 0;

  const recentTheses = allTheses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
  const recentFormatted = await Promise.all(recentTheses.map(formatThesisSimple));

  const upcomingDefenseList = upcomingDefenses.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()).slice(0, 5).map(d => ({
    id: d.id,
    title: d.title,
    scheduledAt: d.scheduledAt.toISOString(),
    location: d.location ?? null,
    roomOrLink: d.roomOrLink ?? null,
    thesisIds: d.thesisIds,
    committeeIds: d.committeeIds,
    notes: d.notes ?? null,
    createdAt: d.createdAt.toISOString(),
  }));

  res.json({
    totalTheses: allTheses.length,
    thesesByStatus,
    totalStudents: allUsers.filter(u => u.role === "student").length,
    totalSupervisors: allUsers.filter(u => u.role === "supervisor").length,
    totalReviewers: allUsers.filter(u => u.role === "reviewer").length,
    upcomingDefenses: upcomingDefenses.length,
    pendingReviews,
    averageGrade: Math.round(avgGrade * 100) / 100,
    recentTheses: recentFormatted,
    upcomingDefenseList,
  });
});

router.get("/reports/theses", requireAuth, async (req, res) => {
  const allTheses = await db.select().from(thesesTable);

  const byStatus: Record<string, number> = {};
  const byField: Record<string, number> = {};
  const byMonthMap: Record<string, number> = {};

  for (const t of allTheses) {
    byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
    const field = t.field ?? "Неопределено";
    byField[field] = (byField[field] ?? 0) + 1;
    const month = t.createdAt.toISOString().slice(0, 7);
    byMonthMap[month] = (byMonthMap[month] ?? 0) + 1;
  }

  const byMonth = Object.entries(byMonthMap).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));

  res.json({ totalCount: allTheses.length, byStatus, byField, byMonth });
});

router.get("/reports/grades", requireAuth, async (req: AuthRequest, res) => {
  const allGrades = await db.select().from(gradesTable);
  const allTheses = await db.select().from(thesesTable);

  const avgGrade = allGrades.length > 0 ? allGrades.reduce((s, g) => s + g.value, 0) / allGrades.length : 0;

  const gradeDistribution: Record<string, number> = { "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 };
  for (const g of allGrades) {
    const key = String(Math.floor(g.value));
    if (key in gradeDistribution) gradeDistribution[key]++;
  }

  const thesesWithGrades = allTheses.filter(t => t.status === "defended");
  const topTheses = thesesWithGrades.slice(0, 5);
  const topFormatted = await Promise.all(topTheses.map(formatThesisSimple));

  const passing = allGrades.filter(g => g.value >= 3).length;
  const passingRate = allGrades.length > 0 ? (passing / allGrades.length) * 100 : 0;

  res.json({
    averageGrade: Math.round(avgGrade * 100) / 100,
    gradeDistribution,
    topTheses: topFormatted,
    passingRate: Math.round(passingRate * 100) / 100,
  });
});

export default router;
