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
import { ArrowLeft, ArrowRight, CheckCircle2, HelpCircle, LineChart, Calculator, Target, Coins, ClipboardCheck } from "lucide-react";
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
    icon: LineChart,
    validationFields: ["baseRevenue", "growthRate", "marginProjection"]
  },
  {
    title: "Expense Planning",
    description: "Plan your operational and capital expenses",
    icon: Calculator,
    validationFields: ["baseExpenses", "assumptions.expenseAssumptions"]
  },
  {
    title: "Market Validation",
    description: "Validate projections against market data",
    icon: Target,
    validationFields: ["marketSize", "competitorAnalysis", "marketGrowth"]
  },
  {
    title: "Fund Utilization",
    description: "Plan how you'll utilize funding",
    icon: Coins,
    validationFields: ["totalFunding", "burnRate", "allocation"]
  },
  {
    title: "Review & Finalize",
    description: "Review and confirm your projections",
    icon: ClipboardCheck,
    validationFields: []
  }
] as const;

export function ProjectionsWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [data, setData] = useState<Partial<FinancialProjectionData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});
  const { toast } = useToast();

  // Current step icon component
  const CurrentStepIcon = steps[currentStep].icon;

  const validateStep = (stepIndex: number): boolean => {
    const step = steps[stepIndex];
    const errors: string[] = [];

    step.validationFields.forEach(field => {
      const value = field.includes('.')
        ? field.split('.').reduce((obj, key) => obj?.[key], data)
        : data[field as keyof FinancialProjectionData];

      if (value === undefined || value === null ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${field.split('.').pop()} is required`);
      }
    });

    setStepErrors(prev => ({ ...prev, [stepIndex]: errors }));
    return errors.length === 0;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (!validateStep(currentStep)) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields before proceeding.",
          variant: "destructive",
        });
        return;
      }

      setCompletedSteps(prev => Array.from(new Set([...prev, currentStep])));
      setCurrentStep(prev => prev + 1);

      // Animate progress update
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
        progressBar.classList.add('progress-animate');
        setTimeout(() => progressBar.classList.remove('progress-animate'), 500);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleUpdate = async (newData: Partial<FinancialProjectionData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = async (finalData: FinancialProjectionData) => {
    try {
      setIsSubmitting(true);

      // Validate all steps before final submission
      let hasErrors = false;
      for (let i = 0; i < steps.length - 1; i++) {
        if (!validateStep(i)) {
          hasErrors = true;
          setCurrentStep(i);
          break;
        }
      }

      if (hasErrors) {
        toast({
          title: "Validation Error",
          description: "Please complete all required information before generating the report.",
          variant: "destructive",
        });
        return;
      }

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
              <CurrentStepIcon className="h-6 w-6 text-primary" />
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
                <Button variant="ghost" size="icon" className="relative">
                  <HelpCircle className="h-5 w-5" />
                  {stepErrors[currentStep]?.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2">
                  <p className="font-medium">Step Requirements</p>
                  {stepErrors[currentStep]?.length > 0 ? (
                    <ul className="text-sm space-y-1 text-destructive">
                      {stepErrors[currentStep].map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">All required fields are complete.</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: currentStep === index ? 1.1 : 1,
                      backgroundColor: currentStep === index
                        ? "var(--primary)"
                        : completedSteps.includes(index)
                        ? "var(--primary-light)"
                        : "var(--muted)"
                    }}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      "shadow-lg hover:shadow-xl transition-shadow duration-200",
                      currentStep === index
                        ? "bg-primary text-primary-foreground"
                        : completedSteps.includes(index)
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {completedSteps.includes(index) ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </motion.div>
                  {index < steps.length - 1 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: completedSteps.includes(index) ? 1 : 0,
                        backgroundColor: completedSteps.includes(index)
                          ? "var(--primary-light)"
                          : "var(--muted)"
                      }}
                      className={cn(
                        "h-1 w-24 mt-4 origin-left",
                        completedSteps.includes(index)
                          ? "bg-primary/20"
                          : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Progress
            value={((currentStep + 1) / steps.length) * 100}
            className="h-2 progress-bar"
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
              disabled={stepErrors[currentStep]?.length > 0}
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}