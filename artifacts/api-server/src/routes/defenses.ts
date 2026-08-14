import { Router } from "express";
import { db, defensesTable, usersTable, notificationsTable, committeesTable, thesesTable, committeeMembersTable } from "@workspace/db";import { eq } from "drizzle-orm";
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
    if (c) {
      const members = await db.select().from(committeeMembersTable)
        .where(eq(committeeMembersTable.committeeId, c.id));
      const memberUsers = await Promise.all(members.map(async (m) => {
        const [u] = await db.select().from(usersTable).where(eq(usersTable.id, m.userId)).limit(1);
        return u ? { id: u.id, firstName: u.firstName, lastName: u.lastName, isChairman: m.isChairman } : null;
      }));
      committee = { id: c.id, romanNumeral: c.romanNumeral, members: memberUsers.filter(Boolean) };
    }
  }

  const studentUsers = await Promise.all(
    (defense.thesisIds ?? []).map(async (sid: number) => {
      const [u] = await db.select().from(usersTable).where(eq(usersTable.id, sid)).limit(1);
      return u ? { 
        id: u.id, 
        firstName: u.firstName, 
        lastName: u.lastName,
        faculty: u.faculty ?? null,
        department: u.department ?? null,
        specialty: (u as any).specialty ?? null,
        degree: (u as any).degree ?? null,
      } : null;
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

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [defense] = await db.select().from(defensesTable)
    .where(eq(defensesTable.id, id)).limit(1);
  if (!defense) { res.status(404).json({ error: "Defense not found" }); return; }
  res.json(await formatDefense(defense));
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

  if (!title || !scheduledAt) {
    res.status(400).json({ error: "Title and scheduledAt are required" }); return;
  }

  
  const allDefenses = await db.select().from(defensesTable);
  const sameDateTime = allDefenses.filter(d => {
    const sameDay = new Date(d.scheduledAt).toDateString() === new Date(scheduledAt).toDateString();
    const sameTime = d.startTime && startTime && d.startTime === startTime;
    return sameDay && sameTime;
  });

  if (committeeId && sameDateTime.some(d => d.committeeId === Number(committeeId))) {
    res.status(400).json({ error: "Тази комисия вече има насрочена защита в същия ден и час" });
    return;
  }

  if (room && sameDateTime.some(d => d.room === room)) {
    res.status(400).json({ error: "Тази зала вече е заета в същия ден и час" });
    return;
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

  if (!defense) { res.status(404).json({ error: "Defense not found" }); return; }
  
  // Провери конфликт с ръководител/рецензент
  const [thesis] = await db.select().from(thesesTable)
    .where(eq(thesesTable.studentId, studentId)).limit(1);
  
  if (thesis && defense.committeeId) {
    const committeeMembers = await db.select().from(committeeMembersTable)
      .where(eq(committeeMembersTable.committeeId, defense.committeeId));
    const memberIds = committeeMembers.map(m => m.userId);
    
    if (thesis.supervisorId && memberIds.includes(thesis.supervisorId)) {
      res.status(400).json({ error: "Научният ръководител на студента е член на тази комисия" });
      return;
    }
    if (thesis.reviewerId && memberIds.includes(thesis.reviewerId)) {
      res.status(400).json({ error: "Рецензентът на студента е член на тази комисия" });
      return;
    }
  }

  const currentIds = defense.thesisIds ?? [];
  if (!currentIds.includes(studentId)) {
    await db.update(defensesTable)
      .set({ thesisIds: [...currentIds, studentId] } as any)
      .where(eq(defensesTable.id, id));
    
    if (thesis) {
      await db.update(thesesTable)
        .set({ status: "scheduled_for_defense" } as any)
        .where(eq(thesesTable.studentId, studentId));
    }
  }

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
  const defenseId = Number(req.params.id);
  
  // Намери защитата преди изтриване
  const [defense] = await db.select().from(defensesTable)
    .where(eq(defensesTable.id, defenseId)).limit(1);

  if (defense) {
    // Известие до студентите
    for (const studentId of (defense.thesisIds ?? [])) {
      await sendNotification(
        studentId,
        "Защита изтрита",
        `Защитата "${defense.title}" е изтрита.`,
        "warning"
      );
    }

    // Известие до членовете на комисията
    if (defense.committeeId) {
      const members = await db.select().from(committeeMembersTable)
        .where(eq(committeeMembersTable.committeeId, defense.committeeId));
      for (const member of members) {
        await sendNotification(
          member.userId,
          "Защита изтрита",
          `Защитата "${defense.title}" е изтрита.`,
          "warning"
        );
      }
    }
  }

  await db.delete(defensesTable).where(eq(defensesTable.id, defenseId));
  res.json({ message: "Defense deleted" });
});

export default router;
