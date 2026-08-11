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
    subjectTaught: user.subjectTaught ?? null,
    maxStudents: user.maxStudents ?? 40,
    createdAt: user.createdAt.toISOString(),
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

export default router;
