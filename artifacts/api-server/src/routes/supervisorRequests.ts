import { Router } from "express";
import { db, usersTable, notificationsTable, supervisorRequestsTable, thesesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { pushNotification } from "../sse";
import { logAction } from "./auditLog";

const router = Router();

async function sendNotification(userId: number, title: string, message: string, type: string) {
  const [row] = await db.insert(notificationsTable).values({
    userId, title, message, type, relatedThesisId: null
  }).returning();
  pushNotification(userId, {
    id: row.id, title, message, type,
    isRead: false, relatedThesisId: null,
    createdAt: row.createdAt.toISOString()
  });
}

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "student") {
    res.status(403).json({ error: "Only students can send requests" });
    return;
  }

  const { supervisorId, thesisTitle, technologies, description } = req.body;
  if (!supervisorId || !thesisTitle || !technologies || !description) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const existing = await db.select().from(supervisorRequestsTable)
    .where(eq(supervisorRequestsTable.studentId, req.userId!));
  const active = existing.find(r => ["pending", "accepted"].includes(r.status));
  if (active) {
    res.status(400).json({ error: "Вече имате активно запитване или одобрен ръководител" });
    return;
  }

  const accepted = await db.select().from(supervisorRequestsTable)
    .where(and(
      eq(supervisorRequestsTable.supervisorId, supervisorId),
      eq(supervisorRequestsTable.status, "accepted")
    ));
  const [supervisor] = await db.select().from(usersTable)
    .where(eq(usersTable.id, supervisorId)).limit(1);
  if (!supervisor) { res.status(404).json({ error: "Supervisor not found" }); return; }

  if (accepted.length >= (supervisor.maxStudents ?? 40)) {
    res.status(400).json({ error: "Ръководителят няма свободни места" });
    return;
  }

  const [request] = await db.insert(supervisorRequestsTable).values({
    studentId: req.userId!,
    supervisorId,
    thesisTitle,
    technologies,
    description,
    status: "pending",
  }).returning();

  await sendNotification(
    supervisorId,
    "Ново запитване за ръководство",
    `Студент иска да бъдете негов ръководител за: "${thesisTitle}"`,
    "info"
  );

  res.status(201).json(request);
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  let requests;
  if (req.userRole === "student") {
    requests = await db.select().from(supervisorRequestsTable)
      .where(eq(supervisorRequestsTable.studentId, req.userId!));
  } else if (req.userRole === "supervisor" || req.userRole === "department_head") {
    requests = await db.select().from(supervisorRequestsTable)
      .where(eq(supervisorRequestsTable.supervisorId, req.userId!));
  } else if (req.userRole === "admin" || req.userRole === "department_head") {
    requests = await db.select().from(supervisorRequestsTable);
  } else {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const formatted = await Promise.all(requests.map(async (r) => {
    const [student] = await db.select().from(usersTable)
      .where(eq(usersTable.id, r.studentId)).limit(1);
    const [supervisor] = await db.select().from(usersTable)
      .where(eq(usersTable.id, r.supervisorId)).limit(1);
    let reviewer = null;
    if (r.reviewerId) {
      const [rev] = await db.select().from(usersTable)
        .where(eq(usersTable.id, r.reviewerId)).limit(1);
      if (rev) reviewer = { id: rev.id, firstName: rev.firstName, lastName: rev.lastName };
    }
    return {
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      student: student ? { id: student.id, firstName: student.firstName, lastName: student.lastName, email: student.email } : null,
      supervisor: supervisor ? { id: supervisor.id, firstName: supervisor.firstName, lastName: supervisor.lastName, email: supervisor.email } : null,
      reviewer,
    };
  }));

  res.json(formatted);
});

router.post("/:id/accept", requireAuth, async (req: AuthRequest, res) => {
  if (!["supervisor", "department_head"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Only supervisors can accept requests" });
    return;
  }

  const id = Number(req.params.id);
  const { reviewerId } = req.body;

  const [request] = await db.select().from(supervisorRequestsTable)
    .where(eq(supervisorRequestsTable.id, id)).limit(1);
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }
  if (request.supervisorId !== req.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db.update(supervisorRequestsTable)
    .set({ status: "accepted" })
    .where(eq(supervisorRequestsTable.id, id)).returning();

  const studentTheses = await db.select().from(thesesTable)
    .where(eq(thesesTable.studentId, request.studentId));
  for (const thesis of studentTheses) {
    await db.update(thesesTable)
      .set({ supervisorId: req.userId, reviewerId })
      .where(eq(thesesTable.id, thesis.id));
  }

  await sendNotification(
    request.studentId,
    "Запитването е одобрено!",
    `Вашето запитване за ръководство на "${request.thesisTitle}" е одобрено!`,
    "success"
  );

  await logAction(req.userId!, "accept_request", "supervisor_request", id, {
    studentId: request.studentId,
    thesisTitle: request.thesisTitle,
  });

  await logAction(req.userId!, "accept_request", "supervisor_request", id, {
    studentId: request.studentId,
    thesisTitle: request.thesisTitle,
  });
  res.json(updated);
});

router.post("/:id/reject", requireAuth, async (req: AuthRequest, res) => {
  if (!["supervisor", "department_head"].includes(req.userRole ?? "")) {
    res.status(403).json({ error: "Only supervisors can reject requests" });
    return;
  }

  const id = Number(req.params.id);
  const [request] = await db.select().from(supervisorRequestsTable)
    .where(eq(supervisorRequestsTable.id, id)).limit(1);
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }
  if (request.supervisorId !== req.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db.update(supervisorRequestsTable)
    .set({ status: "rejected" })
    .where(eq(supervisorRequestsTable.id, id)).returning();

  await sendNotification(
    request.studentId,
    "Запитването е отхвърлено",
    `За съжаление запитването ви за "${request.thesisTitle}" е отхвърлено.`,
    "warning"
  );
  await logAction(req.userId!, "reject_request", "supervisor_request", id, {
    studentId: request.studentId,
    thesisTitle: request.thesisTitle,
  });

  res.json(updated);
});

export default router;
