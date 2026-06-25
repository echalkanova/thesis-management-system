import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, verifyToken, type AuthRequest } from "../middlewares/auth";
import { addSseClient, removeSseClient } from "../sse";

const router = Router();

export function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    relatedThesisId: n.relatedThesisId ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

/* SSE stream — token passed as query param because EventSource can't set headers */
router.get("/stream", async (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) { res.status(401).end(); return; }

  const payload = verifyToken(token);
  if (!payload || typeof payload.userId !== "number") { res.status(401).end(); return; }

  const userId = payload.userId as number;

  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  /* Heartbeat every 25 s to survive proxy timeouts */
  const heartbeat = setInterval(() => {
    try { res.write(": ping\n\n"); } catch { clearInterval(heartbeat); }
  }, 25_000);

  addSseClient(userId, res);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeSseClient(userId, res);
  });
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.userId!));
  res.json(notifications.map(formatNotification));
});

router.patch("/:id/read", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [notification] = await db.update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.userId!)))
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(formatNotification(notification));
});

router.post("/read-all", requireAuth, async (req: AuthRequest, res) => {
  await db.update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, req.userId!));
  res.json({ message: "All notifications marked as read" });
});

export default router;
