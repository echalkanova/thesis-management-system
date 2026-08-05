import { Router } from "express";
import { db, defensesTable, usersTable, notificationsTable, committeesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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

async function formatDefense(defense: typeof defensesTable.$inferSelect) {
  let committee = null;
  if (defense.committeeId) {
    const [c] = await db.select().from(committeesTable)
      .where(eq(committeesTable.id, defense.committeeId)).limit(1);
    if (c) committee = { id: c.id, romanNumeral: c.romanNumeral };
  }

  const studentUsers = await Promise.all(
    (defense.thesisIds ?? []).map(async (sid: number) => {
      const [u] = await db.select().from(usersTable).where(eq(usersTable.id, sid)).limit(1);
      return u ? { id: u.id, firstName: u.firstName, lastName: u.lastName } : null;
    })
  );

  return {
    id: defense.id,
    title: defense.title,
    scheduledAt: defense.scheduledAt.toISOString(),
    location: defense.location ?? null,
    roomOrLink: defense.roomOrLink ?? null,
    room: defense.room ?? null,
    startTime: defense.startTime ?? null,
    endTime: defense.endTime ?? null,
    committeeId: defense.committeeId ?? null,
    committee,
    thesisIds: defense.thesisIds ?? [],
    committeeIds: defense.committeeIds ?? [],
    students: studentUsers.filter(Boolean),
    notes: defense.notes ?? null,
    createdAt: defense.createdAt.toISOString(),
  };
}

// GET all defenses
router.get("/", requireAuth, async (_req, res) => {
  const defenses = await db.select().from(defensesTable);
  const formatted = await Promise.all(defenses.map(formatDefense));
  res.json(formatted);
});

// GET defense for current student
router.get("/my-defense", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "student") {
    res.status(403).json({ error: "Only students" }); return;
  }
  const allDefenses = await db.select().from(defensesTable);
  const myDefense = allDefenses.find(d =>
    (d.thesisIds ?? []).includes(req.userId!)
  );
  if (!myDefense) { res.json(null); return; }
  res.json(await formatDefense(myDefense));
});

// POST create defense (department_head / admin only)
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Only department head can manage defenses" }); return;
  }
  const { title, scheduledAt, location, room, startTime, endTime, committeeId, notes } = req.body;
  if (!title || !scheduledAt) {
    res.status(400).json({ error: "Title and scheduledAt are required" }); return;
  }
  const [defense] = await db.insert(defensesTable).values({
    title,
    scheduledAt: new Date(scheduledAt),
    location: location ?? null,
    roomOrLink: room ?? null,
    room: room ?? null,
    startTime: startTime ?? null,
    endTime: endTime ?? null,
    committeeId: committeeId ?? null,
    thesisIds: [],
    committeeIds: committeeId ? [committeeId] : [],
    notes: notes ?? null,
  } as any).returning();
  res.status(201).json(await formatDefense(defense));
});

// PATCH update defense
router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const id = Number(req.params.id);
  const { title, scheduledAt, location, room, startTime, endTime, committeeId, notes } = req.body;
  const updates: any = {};
  if (title !== undefined) updates.title = title;
  if (scheduledAt !== undefined) updates.scheduledAt = new Date(scheduledAt);
  if (location !== undefined) updates.location = location;
  if (room !== undefined) { updates.room = room; updates.roomOrLink = room; }
  if (startTime !== undefined) updates.startTime = startTime;
  if (endTime !== undefined) updates.endTime = endTime;
  if (committeeId !== undefined) updates.committeeId = committeeId;
  if (notes !== undefined) updates.notes = notes;
  const [updated] = await db.update(defensesTable)
    .set(updates).where(eq(defensesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Defense not found" }); return; }
  res.json(await formatDefense(updated));
});

// POST add student to defense
router.post("/:id/add-student", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const id = Number(req.params.id);
  const { studentId } = req.body;
  if (!studentId) { res.status(400).json({ error: "studentId is required" }); return; }

  const [defense] = await db.select().from(defensesTable)
    .where(eq(defensesTable.id, id)).limit(1);
  if (!defense) { res.status(404).json({ error: "Defense not found" }); return; }

  const currentIds = defense.thesisIds ?? [];
  if (!currentIds.includes(studentId)) {
    await db.update(defensesTable)
      .set({ thesisIds: [...currentIds, studentId] } as any)
      .where(eq(defensesTable.id, id));
  }

  // Notify student
  await sendNotification(
    studentId,
    "Насрочена защита",
    `Добавени сте към защита "${defense.title}" на ${new Date(defense.scheduledAt).toLocaleDateString("bg")}${defense.room ? ` в зала ${defense.room}` : ""}`,
    "info"
  );

  res.json({ message: "Student added to defense" });
});

// POST remove student from defense
router.post("/:id/remove-student", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const id = Number(req.params.id);
  const { studentId } = req.body;
  const [defense] = await db.select().from(defensesTable)
    .where(eq(defensesTable.id, id)).limit(1);
  if (!defense) { res.status(404).json({ error: "Defense not found" }); return; }
  const currentIds = (defense.thesisIds ?? []).filter((sid: number) => sid !== studentId);
  await db.update(defensesTable)
    .set({ thesisIds: currentIds } as any)
    .where(eq(defensesTable.id, id));
  res.json({ message: "Student removed" });
});

// DELETE defense
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  if (!["department_head", "admin"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  await db.delete(defensesTable).where(eq(defensesTable.id, Number(req.params.id)));
  res.json({ message: "Defense deleted" });
});

export default router;
