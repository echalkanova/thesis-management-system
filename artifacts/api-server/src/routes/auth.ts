import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHmac } from "crypto";
import { signToken, requireAuth, type AuthRequest } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { logAction } from "./auditLog";

const router = Router();

function hashPassword(password: string): string {
  return createHmac("sha256", "thesis-pw-salt").update(password).digest("hex");
}

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
    facultyNumber: user.facultyNumber ?? null,
    maxStudents: user.maxStudents ?? 10,
    specialty: (user as any).specialty ?? null,
    degree: (user as any).degree ?? null,
    createdAt: user.createdAt.toISOString(),
    subjectTaught: user.subjectTaught ?? null,
  };
}

router.post("/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error });
    return;
  }
  const { email, password, firstName, lastName, role, faculty, department, phoneNumber } = parsed.data;
  const facultyNumber: string | undefined = (req.body as any).facultyNumber;

  // Faculty number validation — only required for student and supervisor
  const effectiveRole = role ?? "student";
  const needsFacultyNumber = effectiveRole === "student" || effectiveRole === "supervisor";
  if (needsFacultyNumber && (!facultyNumber || facultyNumber.trim() === "")) {
    res.status(400).json({ error: "Факултетният номер е задължителен за студенти и ръководители" });
    return;
  }
  if (facultyNumber && facultyNumber.trim() !== "") {
    const digits = /^\d{9}$/.test(facultyNumber);
    if (!digits) {
      res.status(400).json({ error: "Факултетният номер трябва да е точно 9 цифри" });
      return;
    }
    const expectedPrefix = effectiveRole === "student" ? "121222" : "001212";
    if ((effectiveRole === "student" || effectiveRole === "supervisor") && !facultyNumber.startsWith(expectedPrefix)) {
      res.status(400).json({ error: `Факултетният номер трябва да започва с "${expectedPrefix}"` });
      return;
    }
    const existingFn = await db.select().from(usersTable)
      .where(eq(usersTable.facultyNumber, facultyNumber)).limit(1);
    if (existingFn[0]) {
      res.status(400).json({ error: "Факултетният номер вече е зает" });
      return;
    }
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing[0]) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash: hashPassword(password),
    firstName,
    lastName,
    role: role ?? "student",
    faculty: faculty ?? null,
    department: department ?? null,
    phoneNumber: phoneNumber ?? null,
    facultyNumber: facultyNumber || null,
  }).returning();
  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({ user: formatUser(user), token });
});

router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken({ userId: user.id, role: user.role });
  await logAction(user.id, "login", "user", user.id, { email: user.email, role: user.role });
  res.json({ user: formatUser(user), token });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: "Email is required" }); return; }
  
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) { res.json({ message: "Ако имейлът съществува, ще получите линк" }); return; }
  
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const expiry = new Date(Date.now() + 60 * 60 * 1000);
  
  await db.update(usersTable)
    .set({ resetToken: token, resetTokenExpiry: expiry } as any)
    .where(eq(usersTable.id, user.id));
  
  const { sendPasswordResetEmail } = await import("../email");
  await sendPasswordResetEmail(user.email, token);
  
  res.json({ message: "Ако имейлът съществува, ще получите линк" });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400).json({ error: "Token and password required" }); return; }
  
  const [user] = await db.select().from(usersTable)
    .where(eq((usersTable as any).resetToken, token)).limit(1);
  
  if (!user || !(user as any).resetTokenExpiry || new Date((user as any).resetTokenExpiry) < new Date()) {
    res.status(400).json({ error: "Невалиден или изтекъл линк" }); return;
  }
  
  const { createHmac } = await import("crypto");
  const hash = createHmac("sha256", "thesis-pw-salt").update(password).digest("hex");
  
  await db.update(usersTable)
    .set({ passwordHash: hash, resetToken: null, resetTokenExpiry: null } as any)
    .where(eq(usersTable.id, user.id));
  
  res.json({ message: "Паролата е сменена успешно" });
});

export default router;
