import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const departmentsTable = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  faculty: text("faculty").notNull(),
  specialties: text("specialties").array().notNull().default([]),
  facultyNumberPrefix: text("faculty_number_prefix"),
  facultyNumberPrefixMaster: text("faculty_number_prefix_master"),
});
