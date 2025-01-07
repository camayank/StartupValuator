import { cn } from "@/lib/utils";

interface ValuationProgressProps {
  currentStep: number;
  completedSteps: number[];
}

export function ValuationProgress({ currentStep, completedSteps }: ValuationProgressProps) {
  const steps = [
    "Company Information",
    "Financial Metrics",
    "Market Analysis",
    "Growth Projections",
    "Risk Assessment"
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn("flex flex-col items-center w-1/5", {
              "text-green-600": completedSteps.includes(index + 1),
              "text-blue-600": currentStep === index + 1,
              "text-gray-400": currentStep < index + 1
            })}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-2",
                completedSteps.includes(index + 1)
                  ? "bg-green-100"
                  : currentStep === index + 1
                  ? "bg-blue-100"
                  : "bg-gray-100"
              )}
            >
              {index + 1}
            </div>
            <span className="text-sm text-center">{step}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-4">
        <div className="absolute top-0 h-1 bg-gray-200 w-full" />
        <div
          className="absolute top-0 h-1 bg-green-500 transition-all duration-300"
          style={{
            width: `${(Math.max(...completedSteps) / steps.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
