import { type HealthPrediction, type InsertHealthPrediction } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createPrediction(prediction: InsertHealthPrediction & { riskScore: number; riskLevel: string }): Promise<HealthPrediction>;
  getPredictions(): Promise<HealthPrediction[]>;
  getPredictionById(id: string): Promise<HealthPrediction | undefined>;
}

export class MemStorage implements IStorage {
  private predictions: Map<string, HealthPrediction>;

  constructor() {
    this.predictions = new Map();
  }

  async createPrediction(insertPrediction: InsertHealthPrediction & { riskScore: number; riskLevel: string }): Promise<HealthPrediction> {
    const id = randomUUID();
    const prediction: HealthPrediction = {
      ...insertPrediction,
      id,
      createdAt: new Date(),
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async getPredictions(): Promise<HealthPrediction[]> {
    return Array.from(this.predictions.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getPredictionById(id: string): Promise<HealthPrediction | undefined> {
    return this.predictions.get(id);
  }
}

export const storage = new MemStorage();
