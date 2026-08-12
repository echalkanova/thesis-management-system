import { Router } from "express";
import { db, thesisFilesTable, thesesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup uploads folder
const uploadDir = path.join(process.cwd(), "uploads");
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
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, DOC and DOCX files are allowed"));
  },
});

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

// GET all files for a thesis
thesisFilesRouter.get("/", requireAuth, async (req: AuthRequest, res) => {
  const thesisId = Number(req.params.id);
  const files = await db.select().from(thesisFilesTable).where(eq(thesisFilesTable.thesisId, thesisId));
  res.json(files.map(formatFile));
});

// POST upload a real file
thesisFilesRouter.post("/", requireAuth, upload.single("file"), async (req: AuthRequest, res) => {
  const thesisId = Number(req.params.id);

  // Check thesis exists and user has access
  const [thesis] = await db.select().from(thesesTable).where(eq(thesesTable.id, thesisId)).limit(1);
  if (!thesis) { res.status(404).json({ error: "Thesis not found" }); return; }

  // Only student (owner), supervisor, or admin can upload
  const allowed = req.userRole === "admin" || req.userRole === "supervisor" || thesis.studentId === req.userId;
  if (!allowed) { res.status(403).json({ error: "Forbidden" }); return; }

  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }

  const fileUrl = `/uploads/${req.file.filename}`;
  const [file] = await db.insert(thesisFilesTable).values({
    thesisId,
    fileName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
    fileUrl,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    uploadedBy: req.userId!,
  }).returning();

  res.status(201).json(formatFile(file));
});

export const filesRouter = Router();

// DELETE a file
filesRouter.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [file] = await db.select().from(thesisFilesTable).where(eq(thesisFilesTable.id, id)).limit(1);
  if (!file) { res.status(404).json({ error: "File not found" }); return; }
  if (req.userRole !== "admin" && file.uploadedBy !== req.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  // Delete physical file
  const filePath = path.join(process.cwd(), "uploads", path.basename(file.fileUrl));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await db.delete(thesisFilesTable).where(eq(thesisFilesTable.id, id));
  res.json({ message: "File deleted" });
});

// GET download a file
filesRouter.get("/:id/download", requireAuth, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [file] = await db.select().from(thesisFilesTable).where(eq(thesisFilesTable.id, id)).limit(1);
  if (!file) { res.status(404).json({ error: "File not found" }); return; }
  const filePath = path.join(process.cwd(), "uploads", path.basename(file.fileUrl));
  if (!fs.existsSync(filePath)) { res.status(404).json({ error: "File not found on disk" }); return; }
  res.download(filePath, file.fileName);
});
