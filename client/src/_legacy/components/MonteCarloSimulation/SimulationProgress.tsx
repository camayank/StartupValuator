import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SimulationProgressProps {
  progress: number;
  iterations: number;
  isRunning: boolean;
  currentStep?: string;
}

export function SimulationProgress({ 
  progress, 
  iterations, 
  isRunning,
  currentStep 
}: SimulationProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isRunning && <Loader2 className="h-4 w-4 animate-spin" />}
          Monte Carlo Simulation Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Running iteration: {Math.floor((iterations * progress) / 100)}/{iterations}</span>
            <span>{progress.toFixed(1)}% Complete</span>
          </div>
          {currentStep && (
            <p className="text-sm text-muted-foreground">
              Current step: {currentStep}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
