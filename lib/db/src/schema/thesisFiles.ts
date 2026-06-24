import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { thesesTable } from "./theses";
import { usersTable } from "./users";

export const thesisFilesTable = pgTable("thesis_files", {
  id: serial("id").primaryKey(),
  thesisId: integer("thesis_id").notNull().references(() => thesesTable.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedBy: integer("uploaded_by").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertThesisFileSchema = createInsertSchema(thesisFilesTable).omit({ id: true, createdAt: true });
export type InsertThesisFile = z.infer<typeof insertThesisFileSchema>;
export type ThesisFile = typeof thesisFilesTable.$inferSelect;
