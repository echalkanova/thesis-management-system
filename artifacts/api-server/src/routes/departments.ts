import { Router } from "express";
import { db } from "@workspace/db";
import { departmentsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const departments = await db.select().from(departmentsTable);
  res.json(departments);
});

export default router;
