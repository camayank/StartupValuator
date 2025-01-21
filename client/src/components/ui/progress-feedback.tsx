import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  className?: string;
}

export function ProgressFeedback({
  currentStep,
  totalSteps,
  stepTitles,
  className
}: StepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {stepTitles.map((title, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col items-center space-y-2",
              index < currentStep ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "h-8 w-8 rounded-full border-2 flex items-center justify-center",
                index < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "border-primary"
                  : "border-muted"
              )}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className="text-sm font-medium">{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressFeedback;
