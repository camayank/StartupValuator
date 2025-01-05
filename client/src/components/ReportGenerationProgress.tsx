import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Activity, FileText, PieChart, Trophy } from "lucide-react";

interface ReportGenerationProgressProps {
  onComplete?: () => void;
}

const steps = [
  {
    id: "benchmarks",
    message: "Fetching industry benchmarks...",
    icon: LineChart,
  },
  {
    id: "discount",
    message: "Calculating discount rate using CAPM...",
    icon: Activity,
  },
  {
    id: "sensitivity",
    message: "Generating sensitivity analysis...",
    icon: PieChart,
  },
  {
    id: "report",
    message: "Compiling final report...",
    icon: FileText,
  },
];

const motivationalMessages = [
  "Creating insights that drive decisions! 🚀",
  "Turning data into actionable wisdom... 📊",
  "Building your roadmap to success! 🎯",
  "Crafting your financial story... 📈",
];

export function ReportGenerationProgress({ onComplete }: ReportGenerationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [motivationalIndex, setMotivationalIndex] = useState(0);

  useEffect(() => {
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        
        // Update step based on progress
        const stepProgress = Math.floor((next / 100) * steps.length);
        if (stepProgress !== currentStepIndex && stepProgress < steps.length) {
          setCurrentStepIndex(stepProgress);
        }

        // Update motivational message every 25%
        if (next % 25 === 0) {
          setMotivationalIndex((prev) => (prev + 1) % motivationalMessages.length);
        }

        // Complete the progress
        if (next >= 100) {
          clearInterval(interval);
          if (onComplete) {
            setTimeout(onComplete, 500);
          }
          return 100;
        }
        return next;
      });
    }, 150); // Adjust speed as needed

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <Trophy className="h-12 w-12 mx-auto text-primary animate-bounce" />
        <h2 className="text-2xl font-bold">Generating Your Report</h2>
        <motion.p
          key={motivationalMessages[motivationalIndex]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-muted-foreground"
        >
          {motivationalMessages[motivationalIndex]}
        </motion.p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStepIndex;
            const isComplete = index < currentStepIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isComplete
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    isActive ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <StepIcon className={`h-5 w-5 ${
                    isActive ? "animate-pulse" : ""
                  }`} />
                </div>
                <span className="flex-1">{step.message}</span>
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-2 w-2 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
}
