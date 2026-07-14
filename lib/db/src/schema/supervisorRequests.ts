import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const supervisorRequestsTable = pgTable("supervisor_requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  supervisorId: integer("supervisor_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  thesisTitle: text("thesis_title").notNull(),
  technologies: text("technologies").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  reviewerId: integer("reviewer_id").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type SupervisorRequest = typeof supervisorRequestsTable.$inferSelect;
