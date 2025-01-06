import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Circle,
  HelpCircle,
  Building2,
  Calculator,
  LineChart,
  ClipboardCheck,
  ArrowRight
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { ValuationFormData } from "@/lib/validations";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { IndustryVariablesStep } from "./wizard-steps/IndustryVariablesStep";
import { FinancialDetailsStep } from "./wizard-steps/FinancialDetailsStep";
import { MethodSelectionStep } from "./wizard-steps/MethodSelectionStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";

interface ValuationWizardProps {
  onSubmit: (data: ValuationFormData) => void;
}

const STEPS = [
  {
    id: 1,
    title: "Business Information",
    description: "Basic company details and context",
    icon: Building2,
    helpText: "Enter your company's basic information to help us understand your business context.",
  },
  {
    id: 2,
    title: "Industry Variables",
    description: "Sector-specific metrics and KPIs",
    icon: Calculator,
    helpText: "Provide industry-specific metrics that are crucial for your sector's valuation.",
  },
  {
    id: 3,
    title: "Financial Information",
    description: "Key financial metrics and growth",
    icon: LineChart,
    helpText: "Enter your company's financial data for accurate valuation calculation.",
  },
  {
    id: 4,
    title: "Valuation Method",
    description: "Choose valuation approaches",
    icon: Calculator,
    helpText: "Select and customize the most appropriate valuation methods for your business.",
  },
  {
    id: 5,
    title: "Review & Generate",
    description: "Verify and generate report",
    icon: ClipboardCheck,
    helpText: "Review all inputs and generate your comprehensive valuation report.",
  },
];

export function ValuationWizard({ onSubmit }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});

  const updateFormData = (data: Partial<ValuationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData as ValuationFormData);
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CardTitle>Business Valuation Wizard</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{STEPS[currentStep - 1].helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Badge variant="outline">
            Step {currentStep} of {STEPS.length}
          </Badge>
        </div>

        {/* Progress Tracker */}
        <div className="mb-4">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="grid grid-cols-5 gap-4">
            {STEPS.map((step) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.id * 0.1 }}
                className={cn(
                  "flex flex-col items-center text-center",
                  step.id === currentStep
                    ? "text-primary"
                    : step.id < currentStep
                    ? "text-muted-foreground"
                    : "text-muted"
                )}
              >
                <Circle className={cn(
                  "w-4 h-4 mb-2",
                  step.id <= currentStep ? "fill-current" : "fill-none"
                )} />
                <span className="text-xs font-medium hidden md:block">{step.title}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <CardDescription>
          {STEPS[currentStep - 1].description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {currentStep === 1 && (
              <BusinessInfoStep
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
              />
            )}
            {currentStep === 2 && (
              <IndustryVariablesStep
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <FinancialDetailsStep
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <MethodSelectionStep
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 5 && (
              <ReviewStep
                data={formData}
                onUpdate={updateFormData}
                onSubmit={handleSubmit}
                onBack={handleBack}
              />
            )}

            {currentStep !== 5 && (
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
            {currentStep === 5 && (
              <div className="flex justify-end pt-6 border-t">
                <Button onClick={handleSubmit}>
                  Generate Report
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}