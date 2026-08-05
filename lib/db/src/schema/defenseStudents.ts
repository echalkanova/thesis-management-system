import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { defensesTable } from "./defenses";
import { usersTable } from "./users";

export const defenseStudentsTable = pgTable("defense_students", {
  id: serial("id").primaryKey(),
  defenseId: integer("defense_id").notNull().references(() => defensesTable.id, { onDelete: "cascade" }),
  studentId: integer("student_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
