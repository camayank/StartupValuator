import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValuationStepCardProps {
  title: string;
  description: string;
  stepNumber: number;
  currentStep: number;
  isCompleted: boolean;
  onComplete: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ValuationStepCard({
  title,
  description,
  stepNumber,
  currentStep,
  isCompleted,
  onComplete,
  children,
  className,
}: ValuationStepCardProps) {
  const isActive = stepNumber === currentStep;
  const isLocked = stepNumber > currentStep;

  if (isLocked) {
    return (
      <Card className={cn("relative opacity-50 cursor-not-allowed", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("relative transition-all", className, {
      "border-green-500 shadow-sm": isCompleted,
      "border-blue-500 shadow-md": isActive && !isCompleted,
      "border-gray-200": !isActive && !isCompleted,
    })}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
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
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
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
    </Card>
  );
}