import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValuationStepCardProps {
  title: string;
  stepNumber: number;
  currentStep: number;
  isCompleted: boolean;
  onComplete: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ValuationStepCard({
  title,
  stepNumber,
  currentStep,
  isCompleted,
  onComplete,
  children,
  className,
}: ValuationStepCardProps) {
  const isActive = stepNumber === currentStep;
  const isLocked = stepNumber > currentStep;

  return (
    <Card className={cn("relative", className, {
      "opacity-50": isLocked,
      "border-green-500": isCompleted,
      "border-blue-500": isActive && !isCompleted,
    })}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isCompleted ? "bg-green-100 text-green-600" : 
            isActive ? "bg-blue-100 text-blue-600" :
            "bg-gray-100 text-gray-600"
          )}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <span className="font-semibold">{stepNumber}</span>
            )}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
      </CardHeader>
      {!isLocked && (
        <CardContent>
          {children}
          {isActive && (
            <div className="mt-6 flex justify-end">
              <Button onClick={onComplete} className="gap-2">
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
