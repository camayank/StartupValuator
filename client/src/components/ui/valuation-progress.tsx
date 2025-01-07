import { cn } from "@/lib/utils";
import { CircleIcon } from "lucide-react";

interface ValuationProgressProps {
  currentStep: number;
  completedSteps: number[];
}

export function ValuationProgress({ currentStep, completedSteps }: ValuationProgressProps) {
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
      title: "Market Analysis",
      description: "Industry and competition insights"
    },
    {
      title: "Review",
      description: "Review and confirm your information"
    }
  ];

  return (
    <div className="w-full mb-8">
      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn("flex flex-col items-center relative z-10 w-48", {
              "text-green-600": completedSteps.includes(index + 1),
              "text-blue-600": currentStep === index + 1,
              "text-gray-400": currentStep < index + 1
            })}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mb-2 border-2",
                completedSteps.includes(index + 1)
                  ? "bg-green-100 border-green-600"
                  : currentStep === index + 1
                  ? "bg-blue-100 border-blue-600"
                  : "bg-gray-100 border-gray-300"
              )}
            >
              {index + 1}
            </div>
            <h3 className="text-sm font-medium text-center">{step.title}</h3>
            <p className="text-xs text-center mt-1 text-gray-500">{step.description}</p>
          </div>
        ))}

        {/* Progress line */}
        <div className="absolute top-5 left-0 h-[2px] bg-gray-200 w-full -z-0" />
        <div
          className="absolute top-5 left-0 h-[2px] bg-green-500 transition-all duration-300 -z-0"
          style={{
            width: `${(Math.max(...completedSteps, 0) / steps.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}