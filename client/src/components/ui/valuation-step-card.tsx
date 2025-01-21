import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ValuationStepCardProps {
  title: string;
  description: string;
  stepNumber: number;
  currentStep: number;
  isCompleted: boolean;
  onComplete: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
}

const contentVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  }
};

export function ValuationStepCard({
  title,
  description,
  stepNumber,
  currentStep,
  isCompleted,
  onComplete,
  onBack,
  children,
  className,
}: ValuationStepCardProps) {
  const isActive = stepNumber === currentStep;
  const isLocked = stepNumber > currentStep;

  if (isLocked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={cn("relative cursor-not-allowed", className)}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-400"
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Lock className="w-4 h-4" />
              </motion.div>
              <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("relative transition-all", className, {
        "border-green-500 shadow-sm": isCompleted,
        "border-blue-500 shadow-md": isActive && !isCompleted,
        "border-gray-200": !isActive && !isCompleted,
      })}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                isCompleted ? "bg-green-100 text-green-600" : 
                isActive ? "bg-blue-100 text-blue-600" :
                "bg-gray-100 text-gray-600"
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="font-semibold">{stepNumber}</span>
              )}
            </motion.div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          </div>
        </CardHeader>
        <AnimatePresence mode="wait">
          {(isActive || isCompleted) && (
            <motion.div
              key={`content-${stepNumber}`}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CardContent>
                {children}
                {isActive && (
                  <motion.div 
                    className="mt-6 flex justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {stepNumber > 1 && (
                      <Button 
                        onClick={onBack}
                        variant="outline"
                        className="gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </Button>
                    )}
                    <Button 
                      onClick={onComplete} 
                      className="gap-2 relative overflow-hidden ml-auto"
                    >
                      <motion.span
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {stepNumber === 5 ? 'Submit' : 'Continue'}
                      </motion.span>
                      <motion.span
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.span>
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}