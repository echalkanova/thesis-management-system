import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const thesesTable = pgTable("theses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  studentId: integer("student_id").notNull().references(() => usersTable.id),
  supervisorId: integer("supervisor_id").references(() => usersTable.id),
  reviewerId: integer("reviewer_id").references(() => usersTable.id),
  defenseId: integer("defense_id"),
  keywords: text("keywords"),
  field: text("field"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertThesisSchema = createInsertSchema(thesesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertThesis = z.infer<typeof insertThesisSchema>;
export type Thesis = typeof thesesTable.$inferSelect;
