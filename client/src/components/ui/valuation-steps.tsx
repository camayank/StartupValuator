import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ValuationStepsProps {
  currentStep: number;
  completedSteps: number[];
}

const cardVariants = {
  inactive: { scale: 0.95, opacity: 0.7 },
  active: { 
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  completed: { scale: 0.98, opacity: 0.9 }
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 }
  }
};

export function ValuationSteps({ currentStep, completedSteps }: ValuationStepsProps) {
  const steps = [
    {
      title: "Business Information",
      description: "Tell us about your business type and stage"
    },
    {
      title: "Region & Standards",
      description: "Select your region and applicable standards"
    },
    {
      title: "Valuation Method",
      description: "Review region-specific valuation approaches"
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
          <motion.div
            key={index}
            initial="inactive"
            animate={isActive ? "active" : isCompleted ? "completed" : "inactive"}
            variants={cardVariants}
            whileHover={!isLocked ? { scale: isActive ? 1.02 : 0.98 } : {}}
          >
            <Card
              className={cn(
                "transition-colors duration-300",
                isActive && "border-blue-500 shadow-md bg-blue-50/30",
                isCompleted && "border-green-500 bg-green-50/30",
                isLocked && "opacity-50"
              )}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <motion.div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2",
                    isCompleted
                      ? "bg-green-100 border-green-500 text-green-600"
                      : isActive
                      ? "bg-blue-100 border-blue-500 text-blue-600"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                  )}
                  initial="initial"
                  animate="animate"
                  variants={iconVariants}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{stepNumber}</span>
                  )}
                </motion.div>
                <div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {step.description}
                  </p>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}