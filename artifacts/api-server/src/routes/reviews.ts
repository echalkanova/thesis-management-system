import { Router } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

async function formatReview(review: typeof reviewsTable.$inferSelect) {
  const [reviewer] = await db.select().from(usersTable).where(eq(usersTable.id, review.reviewerId)).limit(1);
  return {
    id: review.id,
    thesisId: review.thesisId,
    reviewerId: review.reviewerId,
    content: review.content,
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
  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.thesisId, thesisId));
  const formatted = await Promise.all(reviews.map(formatReview));
  res.json(formatted);
});

thesisReviewsRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const thesisId = Number(req.params.id);
  const { content, recommendation, isPublished } = req.body;
  if (!content || !recommendation) {
    res.status(400).json({ error: "Content and recommendation are required" });
    return;
  }
  const [review] = await db.insert(reviewsTable).values({
    thesisId,
    reviewerId: req.userId!,
    content,
    recommendation,
    isPublished: isPublished ?? false,
  }).returning();
  res.status(201).json(await formatReview(review));
});

export const reviewsRouter = Router();

reviewsRouter.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id)).limit(1);
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  res.json(await formatReview(review));
});

reviewsRouter.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [review] = await db.select().from(reviewsTable).where(eq(reviewsTable.id, id)).limit(1);
  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }
  if (req.userRole !== "admin" && review.reviewerId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { content, recommendation, isPublished } = req.body;
  const updates: Partial<typeof reviewsTable.$inferInsert> = {};
  if (content !== undefined) updates.content = content;
  if (recommendation !== undefined) updates.recommendation = recommendation;
  if (isPublished !== undefined) updates.isPublished = isPublished;
  const [updated] = await db.update(reviewsTable).set(updates).where(eq(reviewsTable.id, id)).returning();
  res.json(await formatReview(updated));
});
