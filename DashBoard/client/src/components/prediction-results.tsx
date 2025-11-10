import { Card } from "@/components/ui/card";
import type { PredictionResponse } from "@shared/schema";
import { ShieldCheck, AlertTriangle, AlertCircle, XCircle } from "lucide-react";

interface PredictionResultsProps {
  result: PredictionResponse | null;
}

export function PredictionResults({ result }: PredictionResultsProps) {
  if (!result) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No Results Yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your health metrics and click "Calculate Risk" to see your assessment
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const getRiskConfig = (level: string) => {
    switch (level) {
      case "low":
        return {
          color: "text-green-600 dark:text-green-500",
          bgColor: "bg-green-50 dark:bg-green-950/30",
          borderColor: "border-green-200 dark:border-green-900",
          icon: ShieldCheck,
          label: "Low Risk",
          description: "Your health metrics indicate a low risk profile",
        };
      case "moderate":
        return {
          color: "text-yellow-600 dark:text-yellow-500",
          bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
          borderColor: "border-yellow-200 dark:border-yellow-900",
          icon: AlertTriangle,
          label: "Moderate Risk",
          description: "Some health metrics may need attention",
        };
      case "high":
        return {
          color: "text-orange-600 dark:text-orange-500",
          bgColor: "bg-orange-50 dark:bg-orange-950/30",
          borderColor: "border-orange-200 dark:border-orange-900",
          icon: AlertCircle,
          label: "High Risk",
          description: "Several health metrics indicate elevated risk",
        };
      case "critical":
        return {
          color: "text-red-600 dark:text-red-500",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-900",
          icon: XCircle,
          label: "Critical Risk",
          description: "Immediate consultation with a healthcare provider recommended",
        };
      default:
        return {
          color: "text-muted-foreground",
          bgColor: "bg-muted",
          borderColor: "border-border",
          icon: AlertCircle,
          label: "Unknown",
          description: "Risk level could not be determined",
        };
    }
  };

  const config = getRiskConfig(result.riskLevel);
  const Icon = config.icon;
  const percentage = Math.round(result.riskScore * 100);

  return (
    <Card className="p-6" data-testid="card-prediction-results">
      <h3 className="text-lg font-semibold text-foreground mb-6">Risk Assessment Results</h3>

      <div className="space-y-6">
        <div className={`rounded-lg border-2 p-6 ${config.borderColor} ${config.bgColor}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${config.color}`} data-testid="text-risk-level">
                {config.label}
              </div>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-foreground">Risk Score</span>
              <span className={`text-4xl font-mono font-bold ${config.color}`} data-testid="text-risk-score">
                {percentage}%
              </span>
            </div>
            <div className="w-full h-3 bg-background rounded-full overflow-hidden">
              <div
                className={`h-full ${config.bgColor} border-r-2 ${config.borderColor} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {result.recommendations && result.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium uppercase tracking-wide text-foreground">
              Recommendations
            </h4>
            <div className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-md bg-accent/50 hover-elevate"
                  data-testid={`recommendation-${index}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            These results are based on statistical models and should not replace professional medical advice. 
            Please consult with a healthcare provider for personalized guidance.
          </p>
        </div>
      </div>
    </Card>
  );
}
