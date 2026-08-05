import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const committeesTable = pgTable("committees", {
  id: serial("id").primaryKey(),
  romanNumeral: text("roman_numeral").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const committeeMembersTable = pgTable("committee_members", {
  id: serial("id").primaryKey(),
  committeeId: integer("committee_id").notNull().references(() => committeesTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studentCommitteesTable = pgTable("student_committees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  committeeId: integer("committee_id").notNull().references(() => committeesTable.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
});
