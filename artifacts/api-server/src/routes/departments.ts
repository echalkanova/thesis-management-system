import { Router } from "express";
import { db } from "@workspace/db";
import { departmentsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../middlewares/auth";
import { logAction } from "./auditLog";

const router = Router();

// GET all departments (any authenticated user — used for selects across the app)
router.get("/", requireAuth, async (_req, res) => {
  const departments = await db.select().from(departmentsTable);
  res.json(departments);
});

// POST create a department (catedra). If the faculty name is new, this is how a new
// faculty effectively comes into existence, since faculties aren't a separate table —
// they're just the distinct `faculty` values across department rows.
router.post("/", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  const { name, faculty, specialties, facultyNumberPrefix, facultyNumberPrefixMaster } = req.body;
  if (!name || !faculty) {
    res.status(400).json({ error: "Името на катедрата и факултетът са задължителни" });
    return;
  }
  const [dept] = await db.insert(departmentsTable).values({
    name,
    faculty,
    specialties: Array.isArray(specialties) ? specialties : [],
    facultyNumberPrefix: facultyNumberPrefix || null,
    facultyNumberPrefixMaster: facultyNumberPrefixMaster || null,
  }).returning();
  await logAction(req.userId, "create_department", "department", dept.id, { name: dept.name, faculty: dept.faculty });
  res.status(201).json(dept);
});

// PATCH update a department's own fields (name, specialties, prefixes). To move a
// department to a different faculty, pass a new `faculty` value.
router.patch("/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Катедрата не е намерена" }); return; }

  const { name, faculty, specialties, facultyNumberPrefix, facultyNumberPrefixMaster } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (faculty !== undefined) updates.faculty = faculty;
  if (specialties !== undefined) updates.specialties = Array.isArray(specialties) ? specialties : existing.specialties;
  if (facultyNumberPrefix !== undefined) updates.facultyNumberPrefix = facultyNumberPrefix || null;
  if (facultyNumberPrefixMaster !== undefined) updates.facultyNumberPrefixMaster = facultyNumberPrefixMaster || null;

  const [updated] = await db.update(departmentsTable).set(updates).where(eq(departmentsTable.id, id)).returning();

  // Keep users pointing at the old department/faculty name in sync when renamed.
  if (name !== undefined && name !== existing.name) {
    await db.update(usersTable).set({ department: name }).where(eq(usersTable.department, existing.name));
  }
  if (faculty !== undefined && faculty !== existing.faculty) {
    await db.update(usersTable).set({ faculty }).where(and(eq(usersTable.faculty, existing.faculty), eq(usersTable.department, updated.name)));
  }

  await logAction(req.userId, "update_department", "department", id, { name: updated.name, faculty: updated.faculty });
  res.json(updated);
});

// DELETE a department — blocked if any user is still assigned to it.
router.delete("/:id", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Катедрата не е намерена" }); return; }

  const usersInDept = await db.select().from(usersTable).where(eq(usersTable.department, existing.name));
  if (usersInDept.length > 0) {
    res.status(400).json({ error: `Не може да се изтрие — ${usersInDept.length} потребители са свързани с тази катедра` });
    return;
  }

  await db.delete(departmentsTable).where(eq(departmentsTable.id, id));
  await logAction(req.userId, "delete_department", "department", id, { name: existing.name, faculty: existing.faculty });
  res.json({ message: "Катедрата е изтрита" });
});

// PATCH rename a faculty — updates every department under the old name, plus any
// users whose faculty field points at it.
router.patch("/faculty/:name", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  const oldName = decodeURIComponent(String(req.params.name));
  const { newName } = req.body;
  if (!newName) { res.status(400).json({ error: "Новото име е задължително" }); return; }

  const depts = await db.select().from(departmentsTable).where(eq(departmentsTable.faculty, oldName));
  if (depts.length === 0) { res.status(404).json({ error: "Факултетът не е намерен" }); return; }

  await db.update(departmentsTable).set({ faculty: newName }).where(eq(departmentsTable.faculty, oldName));
  await db.update(usersTable).set({ faculty: newName }).where(eq(usersTable.faculty, oldName));

  await logAction(req.userId, "rename_faculty", "faculty", undefined, { from: oldName, to: newName });
  res.json({ message: "Факултетът е преименуван" });
});

// DELETE a faculty — deletes every department under it, blocked if any user (of any
// department in the faculty, or with the bare faculty set) still references it.
router.delete("/faculty/:name", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  const name = decodeURIComponent(String(req.params.name));
  const depts = await db.select().from(departmentsTable).where(eq(departmentsTable.faculty, name));
  if (depts.length === 0) { res.status(404).json({ error: "Факултетът не е намерен" }); return; }

  const usersInFaculty = await db.select().from(usersTable).where(eq(usersTable.faculty, name));
  if (usersInFaculty.length > 0) {
    res.status(400).json({ error: `Не може да се изтрие — ${usersInFaculty.length} потребители са свързани с този факултет` });
    return;
  }

  await db.delete(departmentsTable).where(eq(departmentsTable.faculty, name));
  await logAction(req.userId, "delete_faculty", "faculty", undefined, { name, departmentsRemoved: depts.length });
  res.json({ message: "Факултетът е изтрит" });
});

// POST add a specialty to a department
router.post("/:id/specialties", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { specialty } = req.body;
  if (!specialty) { res.status(400).json({ error: "Името на специалността е задължително" }); return; }

  const [existing] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Катедрата не е намерена" }); return; }
  if (existing.specialties.includes(specialty)) {
    res.status(400).json({ error: "Тази специалност вече съществува в катедрата" });
    return;
  }

  const [updated] = await db.update(departmentsTable)
    .set({ specialties: [...existing.specialties, specialty] })
    .where(eq(departmentsTable.id, id)).returning();
  await logAction(req.userId, "add_specialty", "department", id, { specialty });
  res.status(201).json(updated);
});

// DELETE remove a specialty from a department — blocked if a user is enrolled in it.
router.delete("/:id/specialties/:specialty", requireAuth, requireRole("admin"), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const specialty = decodeURIComponent(String(req.params.specialty));

  const [existing] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Катедрата не е намерена" }); return; }

  const usersInSpecialty = await db.select().from(usersTable).where(eq(usersTable.specialty, specialty));
  if (usersInSpecialty.length > 0) {
    res.status(400).json({ error: `Не може да се изтрие — ${usersInSpecialty.length} потребители са в тази специалност` });
    return;
  }

  const [updated] = await db.update(departmentsTable)
    .set({ specialties: existing.specialties.filter((s: string) => s !== specialty) })
    .where(eq(departmentsTable.id, id)).returning();
  await logAction(req.userId, "remove_specialty", "department", id, { specialty });
  res.json(updated);
});

export default router;
