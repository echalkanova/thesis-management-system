import { Router } from "express";
import { db, thesesTable, usersTable, notificationsTable, supervisorRequestsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { pushNotification } from "../sse";
import { logAction } from "./auditLog";

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

async function formatThesis(thesis: typeof thesesTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, thesis.studentId)).limit(1);
  let supervisor = null;
  let reviewer = null;
  if (thesis.supervisorId) {
    const [s] = await db.select().from(usersTable).where(eq(usersTable.id, thesis.supervisorId)).limit(1);
    if (s) supervisor = formatUser(s);
  }
  if (thesis.reviewerId) {
    const [r] = await db.select().from(usersTable).where(eq(usersTable.id, thesis.reviewerId)).limit(1);
    if (r) reviewer = formatUser(r);
  }
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
    finalGrade: thesis.finalGrade ?? null,
    gradeCalculatedAt: thesis.gradeCalculatedAt?.toISOString() ?? null,
    student: student ? formatUser(student) : null,
    supervisor,
    reviewer,
  };
}

async function sendNotification(userId: number, title: string, message: string, type: string, relatedThesisId?: number) {
  const [row] = await db.insert(notificationsTable).values({ userId, title, message, type, relatedThesisId: relatedThesisId ?? null }).returning();
  pushNotification(userId, { id: row.id, title, message, type, isRead: false, relatedThesisId: relatedThesisId ?? null, createdAt: row.createdAt.toISOString() });
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { status, studentId, supervisorId, reviewerId, search } = req.query as Record<string, string>;
  let theses = await db.select().from(thesesTable);

  if (req.userRole === "student") {
    theses = theses.filter(t => t.studentId === req.userId);
  } else if (req.userRole === "supervisor") {
    theses = theses.filter(t => t.supervisorId === req.userId);
  } else if (req.userRole === "reviewer") {
    theses = theses.filter(t => t.reviewerId === req.userId && t.supervisorId !== req.userId);
  }

  if (status) theses = theses.filter(t => t.status === status);
  if (studentId) theses = theses.filter(t => t.studentId === Number(studentId));
  if (supervisorId) theses = theses.filter(t => t.supervisorId === Number(supervisorId));
  if (reviewerId) theses = theses.filter(t => t.reviewerId === Number(reviewerId));
  if (search) {
    const s = search.toLowerCase();
    theses = theses.filter(t => t.title.toLowerCase().includes(s) || (t.description ?? "").toLowerCase().includes(s));
  }

  const formatted = await Promise.all(theses.map(formatThesis));
  res.json(formatted);
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "student") {
    res.status(403).json({ error: "Only students can create theses" });
    return;
  }
  const { title, description, keywords, field } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  // Inherit the supervisor/reviewer from an already-accepted supervisor
  // request, so theses created after acceptance aren't left unassigned.
  const [acceptedRequest] = await db.select().from(supervisorRequestsTable)
    .where(and(
      eq(supervisorRequestsTable.studentId, req.userId!),
      eq(supervisorRequestsTable.status, "accepted"),
    )).limit(1);

  const [thesis] = await db.insert(thesesTable).values({
    title,
    description: description ?? null,
    keywords: keywords ?? null,
    field: field ?? null,
    studentId: req.userId!,
    status: "draft",
    supervisorId: acceptedRequest?.supervisorId ?? null,
    reviewerId: acceptedRequest?.reviewerId ?? null,
  }).returning();
  await logAction(req.userId, "create_thesis", "thesis", thesis.id, { title: thesis.title });
  res.status(201).json(await formatThesis(thesis));
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) {
    res.status(404).json({ error: "Thesis not found" });
    return;
  }
  res.json(await formatThesis(thesis));
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) {
    res.status(404).json({ error: "Thesis not found" });
    return;
  }
  if (req.userRole === "student" && thesis.studentId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { title, description, keywords, field } = req.body;
  const updates: Partial<typeof thesesTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (keywords !== undefined) updates.keywords = keywords;
  if (field !== undefined) updates.field = field;
  const [updated] = await db.update(thesesTable).set(updates).where(eq(thesesTable.id, id)).returning();
  res.json(await formatThesis(updated));
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) {
    res.status(404).json({ error: "Thesis not found" });
    return;
  }
  if (req.userRole !== "admin" && thesis.studentId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(thesesTable).where(eq(thesesTable.id, id));
  res.json({ message: "Thesis deleted" });
});

router.post("/:id/submit", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) {
    res.status(404).json({ error: "Thesis not found" });
    return;
  }
  if (thesis.studentId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  if (!thesis.supervisorId) {
    res.status(400).json({ error: "Не можете да подадете дипломната работа без избран научен ръководител. Моля, изпратете запитване към ръководител." });
    return;
  }

  const [updated] = await db.update(thesesTable).set({ status: "submitted", submittedAt: new Date() }).where(eq(thesesTable.id, id)).returning();
  await logAction(req.userId, "submit_thesis", "thesis", id, { title: thesis.title });
  if (thesis.supervisorId) {
    await sendNotification(thesis.supervisorId, "Нова подадена дипломна работа", `Студент е предал своята дипломна работа: "${thesis.title}"`, "info", id);
  }
  res.json(await formatThesis(updated));
});

// Approve by supervisor
router.post("/:id/approve", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "supervisor") {
    res.status(403).json({ error: "Only supervisors can approve" });
    return;
  }
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }
  if (thesis.supervisorId !== req.userId) {
    res.status(403).json({ error: "You are not the supervisor of this thesis" });
    return;
  }
  if (!["submitted", "pending_supervisor_approval", "returned_for_revision"].includes(thesis.status)) {
    res.status(400).json({ error: "Thesis cannot be approved at this stage" });
    return;
  }
  const [updated] = await db.update(thesesTable)
    .set({ status: "approved_by_supervisor" })
    .where(eq(thesesTable.id, id)).returning();
  await logAction(req.userId, "approve_thesis", "thesis", id, { title: thesis.title });
  await sendNotification(thesis.studentId, "Дипломната работа е одобрена",
    `Научният ръководител одобри "${thesis.title}"`, "success", id);
  res.json(await formatThesis(updated));
});

// Return for revision by supervisor
router.post("/:id/return", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "supervisor") {
    res.status(403).json({ error: "Only supervisors can return thesis" });
    return;
  }
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }
  if (thesis.supervisorId !== req.userId) {
    res.status(403).json({ error: "You are not the supervisor of this thesis" });
    return;
  }
  const { comment } = req.body;
  const [updated] = await db.update(thesesTable)
    .set({ status: "returned_for_revision" })
    .where(eq(thesesTable.id, id)).returning();
  await logAction(req.userId, "return_thesis", "thesis", id, { title: thesis.title, comment: comment ?? null });
  await sendNotification(thesis.studentId, "Дипломната работа е върната за корекции",
    `${comment ? comment : "Научният ръководител върна работата ви за корекции."}`, "warning", id);
  res.json(await formatThesis(updated));
});

// Submit for review (admin assigns reviewer)
router.post("/:id/send-to-review", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Only admin can send to review" });
    return;
  }
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }
  if (thesis.status !== "approved_by_supervisor") {
    res.status(400).json({ error: "Thesis must be approved by supervisor first" });
    return;
  }
  const [updated] = await db.update(thesesTable)
    .set({ status: "under_review" })
    .where(eq(thesesTable.id, id)).returning();
  if (thesis.reviewerId) {
    await sendNotification(thesis.reviewerId, "Нова дипломна работа за рецензия",
      `Назначени сте за рецензент на "${thesis.title}"`, "info", id);
  }
  await sendNotification(thesis.studentId, "Дипломната работа е изпратена за рецензия",
    `"${thesis.title}" е изпратена за рецензия`, "info", id);
  res.json(await formatThesis(updated));
});

// Approve for defense (admin)
router.post("/:id/approve-for-defense", requireAuth, async (req: AuthRequest, res) => {
  if (!["admin", "department_head"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Only admin or department head can approve for defense" });
    return;
  }
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }
  if (thesis.status !== "reviewed") {
    res.status(400).json({ error: "Thesis must be reviewed first" });
    return;
  }
  const [updated] = await db.update(thesesTable)
    .set({ status: "approved_for_defense" })
    .where(eq(thesesTable.id, id)).returning();
  await sendNotification(thesis.studentId, "Допуснати сте до защита!",
    `"${thesis.title}" е допусната до защита`, "success", id);
  res.json(await formatThesis(updated));
});

// Mark as defended (commission member)
router.post("/:id/mark-defended", requireAuth, async (req: AuthRequest, res) => {
  if (!["admin", "commission_member"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Only commission members can mark as defended" });
    return;
  }
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }
  if (thesis.status !== "scheduled_for_defense") {
    res.status(400).json({ error: "Thesis must be scheduled for defense first" });
    return;
  }
  const [updated] = await db.update(thesesTable)
    .set({ status: "defended" })
    .where(eq(thesesTable.id, id)).returning();
  await sendNotification(thesis.studentId, "Защитата е приключена!",
    `Защитата на "${thesis.title}" е успешно приключена`, "success", id);
  res.json(await formatThesis(updated));
});

// Admin: update status manually
router.patch("/:id/status", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Only admin can manually change status" });
    return;
  }
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }
  const { status } = req.body;
  if (!status) { res.status(400).json({ error: "Status is required" }); return; }
  const [updated] = await db.update(thesesTable)
    .set({ status })
    .where(eq(thesesTable.id, id)).returning();
  await sendNotification(thesis.studentId, "Статус променен",
    `Статусът на "${thesis.title}" е променен на: ${status}`, "info", id);
  res.json(await formatThesis(updated));
});

// Select reviewer after supervisor approval (supervisor only)
router.post("/:id/select-reviewer", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "supervisor") {
    res.status(403).json({ error: "Only supervisors can select reviewer" });
    return;
  }
  const id = Number(req.params.id);
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }
  if (thesis.supervisorId !== req.userId) {
    res.status(403).json({ error: "You are not the supervisor of this thesis" }); return;
  }
  if (thesis.status !== "approved_by_supervisor") {
    res.status(400).json({ error: "Thesis must be approved first" }); return;
  }
  const { reviewerId } = req.body;
  if (!reviewerId) { res.status(400).json({ error: "reviewerId is required" }); return; }

  const [updated] = await db.update(thesesTable)
    .set({
      reviewerId,
      status: "under_review",
      reviewerSelectedAt: new Date(),
    })
    .where(eq(thesesTable.id, id)).returning();

  await sendNotification(
    reviewerId,
    "Назначени сте за рецензент",
    `Назначени сте за рецензент на "${thesis.title}"`,
    "info", id
  );
  await sendNotification(
    thesis.studentId,
    "Дипломната работа е изпратена за рецензия",
    `"${thesis.title}" е изпратена за рецензия`,
    "info", id
  );

  res.json(await formatThesis(updated));
});

router.post("/:id/assign", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  if (!["admin", "supervisor"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, id)).limit(1);
  if (!thesis) {
    res.status(404).json({ error: "Thesis not found" });
    return;
  }
  const { role, userId } = req.body;
  const updates: Partial<typeof thesesTable.$inferInsert> = {};
  if (role === "supervisor") updates.supervisorId = userId;
  if (role === "reviewer") updates.reviewerId = userId;
  const [updated] = await db.update(thesesTable).set(updates).where(eq(thesesTable.id, id)).returning();
  await sendNotification(userId, "Назначение за дипломна работа", `Назначени сте като ${role === "supervisor" ? "научен ръководител" : "рецензент"} за: "${thesis.title}"`, "info", id);
  res.json(await formatThesis(updated));
});

export default router;
