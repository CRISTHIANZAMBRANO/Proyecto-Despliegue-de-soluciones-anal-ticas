import { pgTable, text, varchar, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const healthPredictions = pgTable("health_predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  age: integer("age").notNull(),
  bmi: real("bmi").notNull(),
  cholesterol: integer("cholesterol").notNull(),
  systolicBp: integer("systolic_bp").notNull(),
  smoker: boolean("smoker").notNull(),
  alcohol: boolean("alcohol").notNull(),
  dailySteps: integer("daily_steps").notNull(),
  sleepHours: real("sleep_hours").notNull(),
  familyHistory: boolean("family_history").notNull(),
  riskScore: real("risk_score"),
  riskLevel: text("risk_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHealthPredictionSchema = createInsertSchema(healthPredictions, {
  age: z.number().min(1).max(120),
  bmi: z.number().min(10).max(60),
  cholesterol: z.number().min(100).max(400),
  systolicBp: z.number().min(70).max(200),
  dailySteps: z.number().min(0).max(50000),
  sleepHours: z.number().min(0).max(24),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertHealthPrediction = z.infer<typeof insertHealthPredictionSchema>;
export type HealthPrediction = typeof healthPredictions.$inferSelect;

export interface PredictionResponse {
  riskScore: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
  recommendations?: string[];
}
