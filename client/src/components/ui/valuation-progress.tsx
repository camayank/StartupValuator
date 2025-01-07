import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, CircleIcon } from "lucide-react";

interface ValuationProgressProps {
  currentStep: number;
  completedSteps: number[];
}

export function ValuationProgress({ currentStep, completedSteps }: ValuationProgressProps) {
  const steps = [
    {
      title: "Business Information",
      description: "Tell us about your business type and stage",
      badge: "🏢"
    },
    {
      title: "Valuation Method",
      description: "Review and select the recommended valuation approach",
      badge: "📊"
    },
    {
      title: "Financial Details",
      description: "Provide basic financial information",
      badge: "💰"
    },
    {
      title: "Review",
      description: "Review and confirm your information",
      badge: "✅"
    }
  ];

  const progress = (Math.max(...completedSteps, 0) / steps.length) * 100;

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
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn("flex flex-col items-center relative z-10 w-48", {
              "text-green-600": completedSteps.includes(index + 1),
              "text-primary": currentStep === index + 1,
              "text-gray-400": currentStep < index + 1
            })}
          >
            <motion.div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 text-lg",
                completedSteps.includes(index + 1)
                  ? "bg-green-100 border-green-500"
                  : currentStep === index + 1
                  ? "bg-primary/10 border-primary"
                  : "bg-gray-100 border-gray-300"
              )}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: completedSteps.includes(index + 1) ? [1, 1.1, 1] : 1, 
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
              {completedSteps.includes(index + 1) ? (
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
              <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
            </motion.div>
          </div>
        ))}

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