import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RevenueProjectionsStep } from "./RevenueProjectionsStep";
import { ExpensesProjectionsStep } from "./ExpensesProjectionsStep";
import { FundUtilizationStep } from "./FundUtilizationStep";
import { ProjectionsReviewStep } from "./ProjectionsReviewStep";
import { MarketValidationStep } from "./MarketValidationStep";
import type { FinancialProjectionData } from "@/lib/validations";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, Sparkles, LineChart, Calculator, Target, Coins, ClipboardCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Revenue Projections",
    description: "Forecast your revenue streams and growth",
    icon: LineChart
  },
  {
    title: "Expense Planning",
    description: "Plan your operational and capital expenses",
    icon: Calculator
  },
  {
    title: "Market Validation",
    description: "Validate projections against market data",
    icon: Target
  },
  {
    title: "Fund Utilization",
    description: "Plan how you'll utilize funding",
    icon: Coins
  },
  {
    title: "Review & Finalize",
    description: "Review and confirm your projections",
    icon: ClipboardCheck
  }
] as const;

interface ProjectionsReviewStepProps {
  data: FinancialProjectionData;
  onUpdate: (data: Partial<FinancialProjectionData>) => Promise<void>;
  onSubmit: (data: FinancialProjectionData) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

interface FundUtilizationStepProps {
  data: {
    totalFunding: number;
    burnRate: number;
    runway: number;
    allocation: {
      category: string;
      percentage: number;
      amount: number;
      description: string;
    }[];
  };
  onUpdate: (data: Partial<FinancialProjectionData>) => Promise<void>;
  onNext: () => void;
  onBack: () => void;
}

export function ProjectionsWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [data, setData] = useState<Partial<FinancialProjectionData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => Array.from(new Set([...prev, currentStep])));
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleUpdate = (newData: Partial<FinancialProjectionData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = async (finalData: FinancialProjectionData) => {
    try {
      setIsSubmitting(true);
      toast({
        title: "Processing Projections",
        description: "Analyzing and generating your financial projection report...",
        duration: 3000,
      });

      // Submit projections data to the server
      const response = await fetch('/api/projections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save projections: ${await response.text()}`);
      }

      // Generate and download the projections report
      const reportResponse = await fetch('/api/projections/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!reportResponse.ok) {
        throw new Error(`Failed to generate report: ${await reportResponse.text()}`);
      }

      const blob = await reportResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'financial-projections-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Your financial projections have been saved and the report is ready.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error submitting projections:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process projections",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {steps[currentStep].title}
              <Badge variant="secondary" className="ml-2">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-base">
              {steps[currentStep].description}
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Need help with financial projections? Click for guidance.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    currentStep === index
                      ? "bg-primary text-primary-foreground"
                      : completedSteps.includes(index)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {completedSteps.includes(index) ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-1 w-24 mt-4",
                      completedSteps.includes(index)
                        ? "bg-primary/20"
                        : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress
            value={((currentStep + 1) / steps.length) * 100}
            className="h-2"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <RevenueProjectionsStep
                  data={data}
                  onUpdate={handleUpdate}
                  onNext={handleNext}
                />
              )}
              {currentStep === 1 && (
                <ExpensesProjectionsStep
                  data={data}
                  onUpdate={handleUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 2 && (
                <MarketValidationStep
                  data={data}
                  onUpdate={handleUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <FundUtilizationStep
                  data={data}
                  onUpdate={handleUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 4 && (
                <ProjectionsReviewStep
                  data={data}
                  onUpdate={handleUpdate}
                  onSubmit={handleSubmit}
                  onBack={handleBack}
                  isSubmitting={isSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button
              onClick={handleNext}
              className="ml-auto flex items-center gap-2"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}