import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle2 } from "lucide-react";

interface ValuationStepsProps {
  currentStep: number;
  completedSteps: number[];
}

export function ValuationSteps({ currentStep, completedSteps }: ValuationStepsProps) {
  const steps = [
    {
      title: "Business Information",
      description: "Tell us about your business type and stage"
    },
    {
      title: "Valuation Method",
      description: "Review and select the recommended valuation approach"
    },
    {
      title: "Financial Details",
      description: "Provide basic financial information"
    },
    {
      title: "Review",
      description: "Review and confirm your information"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-6 mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = completedSteps.includes(stepNumber);
        const isLocked = stepNumber > currentStep;

        return (
          <Card
            key={index}
            className={cn(
              "transition-all duration-200",
              isActive && "border-blue-500 shadow-md",
              isCompleted && "border-green-500",
              isLocked && "opacity-50"
            )}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2",
                  isCompleted
                    ? "bg-green-100 border-green-500 text-green-600"
                    : isActive
                    ? "bg-blue-100 border-blue-500 text-blue-600"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isLocked ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{stepNumber}</span>
                )}
              </div>
              <div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
