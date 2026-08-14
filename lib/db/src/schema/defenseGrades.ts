import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const defenseGradesTable = pgTable("defense_grades", {
  id: serial("id").primaryKey(),
  defenseId: integer("defense_id").notNull(),
  studentId: integer("student_id").notNull(),
  grade: numeric("grade", { precision: 4, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
