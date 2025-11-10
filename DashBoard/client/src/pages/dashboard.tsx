import { useState } from "react";
import { LookerStudioEmbed } from "@/components/looker-studio-embed";
import { HealthPredictionForm } from "@/components/health-prediction-form";
import { PredictionResults } from "@/components/prediction-results";
import type { PredictionResponse } from "@shared/schema";

export default function Dashboard() {
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Health Analytics</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Mortality Risk Assessment
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Analytics Overview</h2>
          <LookerStudioEmbed />
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Risk Assessment</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthPredictionForm onPredictionComplete={setPredictionResult} />
            <PredictionResults result={predictionResult} />
          </div>
        </section>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground text-center">
            This tool provides risk assessments based on statistical models. Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
