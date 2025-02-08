import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, CircleIcon, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ValuationProgressProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  onStepClick?: (step: number) => void;
  validationErrors?: Record<number, string>;
}

export function ValuationProgress({ 
  currentStep, 
  completedSteps, 
  totalSteps,
  onStepClick,
  validationErrors 
}: ValuationProgressProps) {
  const steps = [
    {
      title: "Business Information",
      description: "Basic company details",
      badge: "🏢",
      requiredFields: ["companyName", "industry", "businessModel"]
    },
    {
      title: "Financial Metrics",
      description: "Revenue and expenses",
      badge: "💰",
      requiredFields: ["annualRevenue", "expenses", "burnRate"]
    },
    {
      title: "Market Analysis",
      description: "Market size and position",
      badge: "📊",
      requiredFields: ["marketSize", "competitorCount"]
    },
    {
      title: "Growth Metrics",
      description: "Growth rate and projections",
      badge: "📈",
      requiredFields: ["growthRate", "projectedRevenue"]
    },
    {
      title: "Review & Submit",
      description: "Verify information",
      badge: "✅",
      requiredFields: []
    }
  ];

  const progress = (Math.max(...completedSteps, 0) / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="relative flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = completedSteps.includes(index + 1);
          const isCurrent = currentStep === index + 1;
          const hasError = validationErrors?.[index + 1];

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStepClick?.(index + 1)}
                  className={cn("flex flex-col items-center relative z-10 w-48", {
                    "text-green-600": isComplete && !hasError,
                    "text-primary": isCurrent && !hasError,
                    "text-destructive": hasError,
                    "text-gray-400": !isCurrent && !isComplete,
                    "cursor-pointer": onStepClick && (isComplete || isCurrent),
                    "cursor-not-allowed": !onStepClick || (!isComplete && !isCurrent)
                  })}
                  disabled={!onStepClick || (!isComplete && !isCurrent)}
                >
                  <motion.div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2",
                      isComplete && !hasError
                        ? "bg-green-100 border-green-500"
                        : isCurrent
                        ? "bg-primary/10 border-primary"
                        : hasError
                        ? "bg-destructive/10 border-destructive"
                        : "bg-gray-100 border-gray-300"
                    )}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: isComplete ? [1, 1.1, 1] : 1, 
                      opacity: 1 
                    }}
                    transition={{
                      duration: 0.3,
                      scale: {
                        duration: 0.5,
                        times: [0, 0.5, 1]
                      }
                    }}
                  >
                    {hasError ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span>{step.badge}</span>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <h3 className="text-sm font-medium">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 hidden md:block">
                      {step.description}
                    </p>
                    {hasError && (
                      <p className="text-xs text-destructive mt-1">
                        {validationErrors[index + 1]}
                      </p>
                    )}
                  </motion.div>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">
                  {isComplete ? "Completed" : isCurrent ? "Current step" : "Not yet available"}
                </p>
                {step.requiredFields.length > 0 && (
                  <p className="text-xs mt-1">
                    Required: {step.requiredFields.join(", ")}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Connecting line */}
        <div className="absolute top-6 left-0 h-[2px] bg-gray-200 w-full -z-0" />
        <motion.div
          className="absolute top-6 left-0 h-[2px] bg-primary -z-0"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}