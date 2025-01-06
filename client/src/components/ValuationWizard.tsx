import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Circle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { IndustryVariablesStep } from "./wizard-steps/IndustryVariablesStep"; // Added import
import { FinancialDetailsStep } from "./wizard-steps/FinancialDetailsStep";
import { MethodSelectionStep } from "./wizard-steps/MethodSelectionStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";


interface ValuationWizardProps {
  onSubmit: (data: ValuationFormData) => void;
}

type WizardStep = {
  id: number;
  title: string;
  description: string;
  helpText: string;
};

const STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Business Information",
    description: "Tell us about your business type and stage",
    helpText: "Start by providing basic information about your company to help us understand your business context.",
  },
  {
    id: 2,
    title: "Industry Variables",
    description: "Industry-specific parameters and metrics",
    helpText: "Enter key metrics specific to your industry that influence the valuation calculation.",
  },
  {
    id: 3,
    title: "Financial Information",
    description: "Key financial metrics and projections",
    helpText: "Provide your financial data to ensure accurate valuation calculations.",
  },
  {
    id: 4,
    title: "Valuation Method",
    description: "Choose and customize valuation approaches",
    helpText: "Select the most appropriate valuation methods based on your business model.",
  },
  {
    id: 5,
    title: "Review",
    description: "Review and confirm your information",
    helpText: "Review all inputs before generating your detailed valuation report.",
  },
];

export function ValuationWizard({ onSubmit }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      setIsSubmitting(true);
      toast({
        title: "Processing",
        description: "Analyzing your inputs and generating valuation report...",
        duration: 3000,
      });
      await onSubmit(formData as ValuationFormData);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to generate valuation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                <span className="text-xs font-medium">{step.title}</span>
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
            {/* Step Content will be rendered here */}
            {currentStep === 1 && (
              <BusinessInfoStep
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                currentStep={currentStep}
                totalSteps={STEPS.length}
              />
            )}
            {currentStep === 2 && (
              <IndustryVariablesStep // Added component
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
                currentStep={currentStep}
                totalSteps={STEPS.length}
              />
            )}
            {currentStep === 3 && (
              <FinancialDetailsStep
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
                currentStep={currentStep}
                totalSteps={STEPS.length}
              />
            )}
            {currentStep === 4 && (
              <MethodSelectionStep
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
                currentStep={currentStep}
                totalSteps={STEPS.length}
              />
            )}
            {currentStep === 5 && (
              <ReviewStep
                data={formData}
                onUpdate={updateFormData}
                onSubmit={handleSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
                currentStep={currentStep}
                totalSteps={STEPS.length}
              />
            )}


            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {currentStep === STEPS.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  Generate Report
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}