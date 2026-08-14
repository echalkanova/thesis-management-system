import multer from "multer";
import path from "path";
import fs from "fs";
import { Router } from "express";
import { db, messagesTable, usersTable } from "@workspace/db";
import { eq, and, or, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

function fmtUser(u: typeof usersTable.$inferSelect) {
  return { id: u.id, firstName: u.firstName, lastName: u.lastName, role: u.role, email: u.email };
}

// Unread count — must be before /:userId
router.get("/unread-count", requireAuth, async (req: AuthRequest, res) => {
  const msgs = await db.select().from(messagesTable)
    .where(and(eq(messagesTable.receiverId, req.userId!), eq(messagesTable.isRead, false)));
  res.json({ count: msgs.length });
});

// Conversations list
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const all = await db.select().from(messagesTable)
    .where(or(eq(messagesTable.senderId, req.userId!), eq(messagesTable.receiverId, req.userId!)))
    .orderBy(desc(messagesTable.createdAt));

  const map = new Map<number, { lastMessage: typeof all[0]; unreadCount: number }>();
  for (const msg of all) {
    const partnerId = msg.senderId === req.userId ? msg.receiverId : msg.senderId;
    if (!map.has(partnerId)) {
      map.set(partnerId, { lastMessage: msg, unreadCount: 0 });
    }
    if (msg.receiverId === req.userId && !msg.isRead) {
      map.get(partnerId)!.unreadCount++;
    }
  }

  const result = await Promise.all(
    Array.from(map.entries()).map(async ([partnerId, data]) => {
      const [u] = await db.select().from(usersTable).where(eq(usersTable.id, partnerId)).limit(1);
      return {
        user: u ? fmtUser(u) : null,
        lastMessage: { ...data.lastMessage, createdAt: data.lastMessage.createdAt.toISOString() },
        unreadCount: data.unreadCount,
      };
    })
  );
  res.json(result.filter(r => r.user));
});

// Messages with a specific user
router.get("/:userId", requireAuth, async (req: AuthRequest, res) => {
  const partnerId = Number(req.params.userId);
  const msgs = await db.select().from(messagesTable)
    .where(or(
      and(eq(messagesTable.senderId, req.userId!), eq(messagesTable.receiverId, partnerId)),
      and(eq(messagesTable.senderId, partnerId), eq(messagesTable.receiverId, req.userId!))
    ))
    .orderBy(messagesTable.createdAt);

  // Auto-mark received as read
  await db.update(messagesTable)
    .set({ isRead: true })
    .where(and(
      eq(messagesTable.senderId, partnerId),
      eq(messagesTable.receiverId, req.userId!),
      eq(messagesTable.isRead, false)
    ));

  res.json(msgs.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
});

// Send message
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !String(content ?? "").trim()) {
    res.status(400).json({ error: "receiverId and content are required" });
    return;
  }
  const [msg] = await db.insert(messagesTable).values({
    senderId: req.userId!,
    receiverId: Number(receiverId),
    content: String(content).trim(),
  }).returning();
  res.status(201).json({ ...msg, createdAt: msg.createdAt.toISOString() });
});

const msgUploadDir = path.join(process.cwd(), "uploads/messages");
if (!fs.existsSync(msgUploadDir)) fs.mkdirSync(msgUploadDir, { recursive: true });

const msgStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  },
});
const msgUpload = multer({ storage: msgStorage });

router.post("/upload", requireAuth, msgUpload.single("file"), async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: "No file" }); return; }
  const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, name: originalName });
});

export default router;
