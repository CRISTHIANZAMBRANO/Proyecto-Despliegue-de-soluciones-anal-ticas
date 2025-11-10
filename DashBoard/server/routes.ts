import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHealthPredictionSchema, type PredictionResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/predict", async (req, res) => {
    try {
      const validatedData = insertHealthPredictionSchema.parse(req.body);

      // Calculate risk score based on health metrics
      // This is a placeholder algorithm - replace with actual API call
      const riskScore = calculateRiskScore(validatedData);
      const riskLevel = getRiskLevel(riskScore);
      const recommendations = generateRecommendations(validatedData, riskLevel);

      // Store prediction
      await storage.createPrediction({
        ...validatedData,
        riskScore,
        riskLevel,
      });

      const response: PredictionResponse = {
        riskScore,
        riskLevel,
        recommendations,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Prediction error:", error);
      res.status(400).json({
        error: error.message || "Invalid input data",
      });
    }
  });

  app.get("/api/predictions", async (_req, res) => {
    try {
      const predictions = await storage.getPredictions();
      res.json(predictions);
    } catch (error: any) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ error: "Failed to fetch predictions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Placeholder risk calculation algorithm
function calculateRiskScore(data: any): number {
  let score = 0;

  // Age factor (0-0.3)
  if (data.age > 60) score += 0.3;
  else if (data.age > 50) score += 0.2;
  else if (data.age > 40) score += 0.1;

  // BMI factor (0-0.2)
  if (data.bmi > 30) score += 0.2;
  else if (data.bmi > 25) score += 0.1;
  else if (data.bmi < 18.5) score += 0.1;

  // Cholesterol factor (0-0.15)
  if (data.cholesterol > 240) score += 0.15;
  else if (data.cholesterol > 200) score += 0.1;

  // Blood pressure factor (0-0.15)
  if (data.systolicBp > 140) score += 0.15;
  else if (data.systolicBp > 130) score += 0.1;
  else if (data.systolicBp > 120) score += 0.05;

  // Lifestyle factors
  if (data.smoker) score += 0.15;
  if (data.alcohol) score += 0.05;
  if (data.familyHistory) score += 0.1;

  // Activity and sleep (protective factors)
  if (data.dailySteps < 5000) score += 0.1;
  else if (data.dailySteps > 10000) score -= 0.05;

  if (data.sleepHours < 6 || data.sleepHours > 9) score += 0.05;

  // Normalize to 0-1 range
  return Math.max(0, Math.min(1, score));
}

function getRiskLevel(score: number): "low" | "moderate" | "high" | "critical" {
  if (score < 0.25) return "low";
  if (score < 0.5) return "moderate";
  if (score < 0.75) return "high";
  return "critical";
}

function generateRecommendations(data: any, riskLevel: string): string[] {
  const recommendations: string[] = [];

  if (data.smoker) {
    recommendations.push("Quitting smoking can significantly reduce your health risks. Consider consulting with a healthcare provider about smoking cessation programs.");
  }

  if (data.bmi > 25) {
    recommendations.push("Maintaining a healthy weight through balanced diet and regular exercise can improve overall health outcomes.");
  }

  if (data.dailySteps < 8000) {
    recommendations.push("Increasing daily physical activity to 8,000-10,000 steps can help reduce cardiovascular risks.");
  }

  if (data.cholesterol > 200) {
    recommendations.push("Consider discussing cholesterol management strategies with your doctor, including dietary changes and regular monitoring.");
  }

  if (data.systolicBp > 120) {
    recommendations.push("Monitor blood pressure regularly and discuss management strategies with a healthcare provider.");
  }

  if (data.sleepHours < 7 || data.sleepHours > 9) {
    recommendations.push("Aim for 7-9 hours of quality sleep per night to support overall health and recovery.");
  }

  if (riskLevel === "high" || riskLevel === "critical") {
    recommendations.push("Schedule a comprehensive health checkup with your healthcare provider to discuss these risk factors.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Continue maintaining your healthy lifestyle habits with regular exercise, balanced nutrition, and adequate sleep.");
    recommendations.push("Schedule regular health checkups to monitor your ongoing wellness.");
  }

  return recommendations;
}
