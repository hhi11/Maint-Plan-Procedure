import { pgTable, text, serial, timestamp, json, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Keep existing users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  generationCount: integer("generation_count").notNull().default(0),
  isAdmin: text("is_admin").notNull().default("false"),
});

export const jobPlans = pgTable("job_plans", {
  id: serial("id").primaryKey(),
  planId: text("plan_id").notNull().unique(), // e.g. MJP-2024-001
  dateCreated: timestamp("date_created").notNull().defaultNow(),
  equipmentName: text("equipment_name").notNull(),
  equipmentModel: text("equipment_model").notNull().default(""),
  equipmentSerial: text("equipment_serial").notNull().default(""),
  scopeOfWork: text("scope_of_work").notNull(),
  jobSteps: json("job_steps").$type<{
    stepNumber: number;
    description: string;
  }[]>().notNull().default([]),
  toolsRequired: text("tools_required").array().notNull().default([]),
  materialsRequired: text("materials_required").array().notNull().default([]),
  manpowerCount: text("manpower_count").notNull().default(""),
  skillLevels: text("skill_levels").array().notNull().default([]),
  estimatedTime: text("estimated_time").notNull().default(""),
  safetyPpe: text("safety_ppe").array().notNull().default([]),
  safetyProcedures: text("safety_procedures").array().notNull().default([]),
  safetyHazards: text("safety_hazards").array().notNull().default([]),
  bestPractices: text("best_practices").notNull().default(""),
  recommendations: json("recommendations").$type<{
    manuals: string[];
    procedures: string[];
  }>().notNull().default({ manuals: [], procedures: [] }),
  applicableCodes: text("applicable_codes").array().notNull().default([]),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("draft"),
});

// Create insert schema
export const insertJobPlanSchema = createInsertSchema(jobPlans).omit({
  id: true,
});

// Types
export type InsertJobPlan = z.infer<typeof insertJobPlanSchema>;
export type JobPlan = typeof jobPlans.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Keep existing user schema
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});
