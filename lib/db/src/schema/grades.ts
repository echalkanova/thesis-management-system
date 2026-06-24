import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { thesesTable } from "./theses";
import { usersTable } from "./users";

export const gradesTable = pgTable("grades", {
  id: serial("id").primaryKey(),
  thesisId: integer("thesis_id").notNull().references(() => thesesTable.id, { onDelete: "cascade" }),
  graderId: integer("grader_id").notNull().references(() => usersTable.id),
  value: real("value").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGradeSchema = createInsertSchema(gradesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof gradesTable.$inferSelect;
