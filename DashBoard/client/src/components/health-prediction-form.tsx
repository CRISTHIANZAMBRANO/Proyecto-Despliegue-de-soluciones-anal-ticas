import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertHealthPredictionSchema, type PredictionResponse } from "@shared/schema";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type FormValues = z.infer<typeof insertHealthPredictionSchema>;

interface HealthPredictionFormProps {
  onPredictionComplete: (result: PredictionResponse) => void;
}

export function HealthPredictionForm({ onPredictionComplete }: HealthPredictionFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(insertHealthPredictionSchema),
    defaultValues: {
      age: 45,
      bmi: 25,
      cholesterol: 200,
      systolicBp: 120,
      smoker: false,
      alcohol: false,
      dailySteps: 8000,
      sleepHours: 7,
      familyHistory: false,
    },
  });

  const predictMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/predict", data);
      const result = await response.json() as PredictionResponse;
      return result;
    },
    onSuccess: (data) => {
      onPredictionComplete(data);
      toast({
        title: "Prediction Complete",
        description: "Your health risk assessment has been calculated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Prediction Failed",
        description: error.message || "Unable to calculate risk prediction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    predictMutation.mutate(data);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Enter Your Health Metrics</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium uppercase tracking-wide">Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="45"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      data-testid="input-age"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bmi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium uppercase tracking-wide">BMI</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="25.0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      data-testid="input-bmi"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cholesterol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium uppercase tracking-wide">Cholesterol (mg/dL)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="200"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      data-testid="input-cholesterol"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systolicBp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium uppercase tracking-wide">Blood Pressure (Systolic)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="120"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      data-testid="input-systolic-bp"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dailySteps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium uppercase tracking-wide">Daily Steps</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="8000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      data-testid="input-daily-steps"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sleepHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium uppercase tracking-wide">Sleep Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="7.0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      data-testid="input-sleep-hours"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="smoker"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-4 hover-elevate">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">Smoker</FormLabel>
                    <div className="text-sm text-muted-foreground">Do you currently smoke?</div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-smoker"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alcohol"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-4 hover-elevate">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">Alcohol Consumption</FormLabel>
                    <div className="text-sm text-muted-foreground">Regular alcohol consumption?</div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-alcohol"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="familyHistory"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-4 hover-elevate">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">Family History</FormLabel>
                    <div className="text-sm text-muted-foreground">Family history of heart disease?</div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-family-history"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={predictMutation.isPending}
            data-testid="button-calculate-risk"
          >
            {predictMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Calculate Risk"
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
