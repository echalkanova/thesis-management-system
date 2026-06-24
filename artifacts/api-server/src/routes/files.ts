import { Router } from "express";
import { db, thesisFilesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router({ mergeParams: true });

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

function formatFile(file: typeof thesisFilesTable.$inferSelect) {
  return {
    id: file.id,
    thesisId: file.thesisId,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    fileType: file.fileType,
    fileSize: file.fileSize,
    uploadedBy: file.uploadedBy,
    createdAt: file.createdAt.toISOString(),
  };
}

export const thesisFilesRouter = Router({ mergeParams: true });

thesisFilesRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const thesisId = Number(req.params.id);
  const files = await db.select().from(thesisFilesTable).where(eq(thesisFilesTable.thesisId, thesisId));
  res.json(files.map(formatFile));
});

thesisFilesRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const thesisId = Number(req.params.id);
  const { fileName, fileUrl, fileType, fileSize } = req.body;
  if (!fileName || !fileUrl || !fileType || fileSize === undefined) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const [file] = await db.insert(thesisFilesTable).values({
    thesisId,
    fileName,
    fileUrl,
    fileType,
    fileSize,
    uploadedBy: req.userId!,
  }).returning();
  res.status(201).json(formatFile(file));
});

export const filesRouter = Router();

filesRouter.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [file] = await db.select().from(thesisFilesTable).where(eq(thesisFilesTable.id, id)).limit(1);
  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  if (req.userRole !== "admin" && file.uploadedBy !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(thesisFilesTable).where(eq(thesisFilesTable.id, id));
  res.json({ message: "File deleted" });
});
