import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { defensesTable } from "./defenses";
import { usersTable } from "./users";

export const defenseGradesTable = pgTable("defense_grades", {
  id: serial("id").primaryKey(),
  defenseId: integer("defense_id").notNull().references(() => defensesTable.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  grade: numeric("grade", { precision: 4, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});