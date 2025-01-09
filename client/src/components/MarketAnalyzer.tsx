import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, ChartBar, Globe, TrendingUp, Building2 } from "lucide-react";

interface MarketAnalyzerProps {
  sector: string;
  industry: string;
  region: string;
  onAnalysisComplete: (data: any) => void;
}

export function MarketAnalyzer({ sector, industry, region, onAnalysisComplete }: MarketAnalyzerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [thoughts, setThoughts] = useState("");

  const steps = [
    {
      id: "market_size",
      title: "Market Size Analysis",
      icon: Globe,
      thought: `Analyzing total addressable market for ${industry} in ${region}...`,
    },
    {
      id: "growth_trends",
      title: "Growth Trends",
      icon: TrendingUp,
      thought: `Evaluating market growth patterns and future projections...`,
    },
    {
      id: "competition",
      title: "Competitive Landscape",
      icon: Building2,
      thought: `Mapping key players and market share distribution...`,
    },
    {
      id: "metrics",
      title: "Key Performance Indicators",
      icon: ChartBar,
      thought: `Calculating industry-specific KPIs and benchmarks...`,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Update current step based on progress
        const newStep = Math.floor((prev / 100) * steps.length);
        if (newStep !== currentStep && newStep < steps.length) {
          setCurrentStep(newStep);
          setThoughts(steps[newStep].thought);
        }
        return prev + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep, steps.length]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Market Analysis in Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Analysis Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <div
                  key={step.id}
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
                    <StepIcon className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{step.title}</p>
                    {isActive && (
                      <p className="text-sm text-muted-foreground">{thoughts}</p>
                    )}
                  </div>
                  {isComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-2 w-2 rounded-full bg-primary"
                    />
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
