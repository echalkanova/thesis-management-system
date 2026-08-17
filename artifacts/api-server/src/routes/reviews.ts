import { Router } from "express";
import { db, reviewsTable, usersTable, thesesTable, notificationsTable } from "@workspace/db";
import { logAction } from "./auditLog";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { pushNotification } from "../sse";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads/reviews");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, DOC and DOCX files are allowed"));
  },
});

async function sendNotification(userId: number, title: string, message: string, type: string, relatedThesisId?: number) {
  const [row] = await db.insert(notificationsTable)
    .values({ userId, title, message, type, relatedThesisId: relatedThesisId ?? null })
    .returning();
  pushNotification(userId, {
    id: row.id, title, message, type,
    isRead: false,
    relatedThesisId: relatedThesisId ?? null,
    createdAt: row.createdAt.toISOString()
  });
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id, email: user.email,
    firstName: user.firstName, lastName: user.lastName,
    role: user.role, faculty: user.faculty ?? null,
    department: user.department ?? null,
    phoneNumber: user.phoneNumber ?? null,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

async function formatReview(review: typeof reviewsTable.$inferSelect) {
  const [reviewer] = await db.select().from(usersTable)
    .where(eq(usersTable.id, review.reviewerId)).limit(1);
  return {
    id: review.id,
    thesisId: review.thesisId,
    reviewerId: review.reviewerId,
    content: review.content,
    fileUrl: review.fileUrl ?? null,
    recommendation: review.recommendation,
    isPublished: review.isPublished,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    reviewer: reviewer ? formatUser(reviewer) : null,
  };
}

export const thesisReviewsRouter = Router({ mergeParams: true });

thesisReviewsRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const thesisId = Number(req.params.id);

  const [thesis] = await db.select().from(thesesTable)
    .where(eq(thesesTable.id, thesisId)).limit(1);

  const laterStatuses = ["reviewed", "approved_for_defense", "scheduled_for_defense", "defended", "graded"];
  const isStudent = req.userRole === "student";

  if (isStudent && thesis && !laterStatuses.includes(thesis.status)) {
    res.json([]);
    return;
  }

  const reviews = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.thesisId, thesisId));
  const formatted = await Promise.all(reviews.map(formatReview));
  res.json(formatted);
});

// POST create review (with optional file upload)
thesisReviewsRouter.post("/", requireAuth, upload.single("file"), async (req: AuthRequest, res) => {
  const thesisId = Number(req.params.id);

  if (req.userRole !== "reviewer" && req.userRole !== "admin") {
    res.status(403).json({ error: "Only reviewers can submit reviews" });
    return;
  }

  const [thesis] = await db.select().from(thesesTable)
    .where(eq(thesesTable.id, thesisId)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }

  if (thesis.reviewerId !== req.userId && req.userRole !== "admin") {
    res.status(403).json({ error: "You are not the reviewer of this thesis" });
    return;
  }

  const { content, recommendation, isPublished } = req.body;
  if (!content || !recommendation) {
    res.status(400).json({ error: "Content and recommendation are required" });
    return;
  }

  let fileUrl: string | null = null;
  if (req.file) {
    fileUrl = `/uploads/reviews/${req.file.filename}`;
  }

  const [review] = await db.insert(reviewsTable).values({
    thesisId,
    reviewerId: req.userId!,
    content,
    recommendation,
    isPublished: isPublished === "true" || isPublished === true,
    ...(fileUrl ? { fileUrl } : {}),
  }).returning();

  // Update thesis status to reviewed
  await db.update(thesesTable)
    .set({ status: "reviewed" })
    .where(eq(thesesTable.id, thesisId));

  // Notify student
  await sendNotification(
    thesis.studentId,
    "Рецензията е готова",
    `Вашата дипломна работа "${thesis.title}" получи рецензия.`,
    "info",
    thesisId
  );

  // Notify supervisor
  if (thesis.supervisorId) {
    await sendNotification(
      thesis.supervisorId,
      "Рецензията е изготвена",
      `Рецензията на "${thesis.title}" е готова.`,
      "info",
      thesisId
    );
  }

  await logAction(req.userId, "publish_review", "review", review.id, { thesisId, recommendation });
  res.status(201).json(await formatReview(review));
});

export const reviewsRouter = Router();

reviewsRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const allReviews = await db.select().from(reviewsTable);
  const formatted = await Promise.all(allReviews.map(async (r) => {
    const [thesis] = await db.select().from(thesesTable)
      .where(eq(thesesTable.id, r.thesisId)).limit(1);
    let student = null;
    if (thesis?.studentId) {
      const [s] = await db.select().from(usersTable)
        .where(eq(usersTable.id, thesis.studentId)).limit(1);
      if (s) student = { id: s.id, firstName: s.firstName, lastName: s.lastName };
    }
    return {
      ...await formatReview(r),
      thesis: thesis ? {
        id: thesis.id,
        title: thesis.title,
        field: thesis.field ?? null,
        student,
      } : null,
    };
  }));
  res.json(formatted);
});

reviewsRouter.get("/my-reviews", requireAuth, async (req: AuthRequest, res) => {
  const reviews = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.reviewerId, req.userId!));
  
  const formatted = await Promise.all(reviews.map(async (r) => {
    const [thesis] = await db.select().from(thesesTable)
      .where(eq(thesesTable.id, r.thesisId)).limit(1);
    let student = null;
    if (thesis?.studentId) {
      const [s] = await db.select().from(usersTable)
        .where(eq(usersTable.id, thesis.studentId)).limit(1);
      if (s) student = { id: s.id, firstName: s.firstName, lastName: s.lastName };
    }
    return {
      ...await formatReview(r),
      thesis: thesis ? {
        id: thesis.id,
        title: thesis.title,
        field: thesis.field ?? null,
        student,
      } : null,
    };
  }));
  
  res.json(formatted);
});

reviewsRouter.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [review] = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.id, id)).limit(1);
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  res.json(await formatReview(review));
});

reviewsRouter.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [review] = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.id, id)).limit(1);
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  if (req.userRole !== "admin" && review.reviewerId !== req.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const { content, recommendation, isPublished } = req.body;
  const updates: Partial<typeof reviewsTable.$inferInsert> = {};
  if (content !== undefined) updates.content = content;
  if (recommendation !== undefined) updates.recommendation = recommendation;
  if (isPublished !== undefined) updates.isPublished = isPublished;
  const [updated] = await db.update(reviewsTable)
    .set(updates).where(eq(reviewsTable.id, id)).returning();
  res.json(await formatReview(updated));
});

// GET download review file
reviewsRouter.get("/:id/download", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [review] = await db.select().from(reviewsTable)
    .where(eq(reviewsTable.id, id)).limit(1);
  if (!review) { res.status(404).json({ error: "Review not found" }); return; }
  const fileUrl = review.fileUrl;
  if (!fileUrl) { res.status(404).json({ error: "No file attached" }); return; }
  const filePath = path.join(process.cwd(), fileUrl);
  if (!fs.existsSync(filePath)) { res.status(404).json({ error: "File not found on disk" }); return; }
  res.download(filePath);

  

});
