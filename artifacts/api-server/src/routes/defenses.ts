import { Router } from "express";
import { db, defensesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth";

const router = Router();

function formatDefense(defense: typeof defensesTable.$inferSelect) {
  return {
    id: defense.id,
    title: defense.title,
    scheduledAt: defense.scheduledAt.toISOString(),
    location: defense.location ?? null,
    roomOrLink: defense.roomOrLink ?? null,
    thesisIds: defense.thesisIds,
    committeeIds: defense.committeeIds,
    notes: defense.notes ?? null,
    createdAt: defense.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  const defenses = await db.select().from(defensesTable);
  res.json(defenses.map(formatDefense));
});

router.post("/", requireAuth, requireRole("admin", "committee_member"), async (req, res) => {
  const { title, scheduledAt, location, roomOrLink, thesisIds, committeeIds, notes } = req.body;
  if (!title || !scheduledAt) {
    res.status(400).json({ error: "Title and scheduledAt are required" });
    return;
  }
  const [defense] = await db.insert(defensesTable).values({
    title,
    scheduledAt: new Date(scheduledAt),
    location: location ?? null,
    roomOrLink: roomOrLink ?? null,
    thesisIds: thesisIds ?? [],
    committeeIds: committeeIds ?? [],
    notes: notes ?? null,
  }).returning();
  res.status(201).json(formatDefense(defense));
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [defense] = await db.select().from(defensesTable).where(eq(defensesTable.id, id)).limit(1);
  if (!defense) {
    res.status(404).json({ error: "Defense not found" });
    return;
  }
  res.json(formatDefense(defense));
});

router.patch("/:id", requireAuth, requireRole("admin", "committee_member"), async (req, res) => {
  const id = Number(req.params.id);
  const { title, scheduledAt, location, roomOrLink, thesisIds, committeeIds, notes } = req.body;
  const updates: Partial<typeof defensesTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (scheduledAt !== undefined) updates.scheduledAt = new Date(scheduledAt);
  if (location !== undefined) updates.location = location;
  if (roomOrLink !== undefined) updates.roomOrLink = roomOrLink;
  if (thesisIds !== undefined) updates.thesisIds = thesisIds;
  if (committeeIds !== undefined) updates.committeeIds = committeeIds;
  if (notes !== undefined) updates.notes = notes;
  const [defense] = await db.update(defensesTable).set(updates).where(eq(defensesTable.id, id)).returning();
  if (!defense) {
    res.status(404).json({ error: "Defense not found" });
    return;
  }
  res.json(formatDefense(defense));
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(defensesTable).where(eq(defensesTable.id, id));
  res.json({ message: "Defense deleted" });
});

export default router;
