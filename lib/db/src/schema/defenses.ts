import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const defensesTable = pgTable("defenses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  location: text("location"),
  roomOrLink: text("room_or_link"),
  thesisIds: integer("thesis_ids").array().notNull().default([]),
  committeeIds: integer("committee_ids").array().notNull().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDefenseSchema = createInsertSchema(defensesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDefense = z.infer<typeof insertDefenseSchema>;
export type Defense = typeof defensesTable.$inferSelect;
