import { Router } from "express";
import { db, auditLogTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

export async function logAction(
  userId: number | undefined,
  action: string,
  entityType: string,
  entityId?: number,
  details?: Record<string, unknown>
) {
  try {
    await db.insert(auditLogTable).values({
      userId: userId ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      details: details ?? null,
    });
  } catch {
    // Non-fatal — audit failures must not break main flow
  }
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  if (req.userRole !== "admin") {
    res.status(403).json({ error: "Only admin can view audit log" });
    return;
  }
  const logs = await db.select().from(auditLogTable)
    .orderBy(desc(auditLogTable.createdAt))
    .limit(200);

  const formatted = await Promise.all(logs.map(async (log) => {
    let user = null;
    if (log.userId) {
      const [u] = await db.select().from(usersTable)
        .where(eq(usersTable.id, log.userId)).limit(1);
      if (u) user = { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role };
    }
    return {
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId ?? null,
      details: log.details ?? null,
      createdAt: log.createdAt.toISOString(),
      user,
    };
  }));
  res.json(formatted);
});

export default router;
