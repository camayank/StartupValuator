import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle2, Circle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { IndustryMetricsForm } from "./IndustryMetricsForm";
import { MethodSelectionStep } from "./wizard-steps/MethodSelectionStep";
import { FinancialDetailsStep } from "./wizard-steps/FinancialDetailsStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import { ValuationProgress } from "@/components/ui/valuation-progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";

interface ValuationWizardProps {
  onSubmit: (data: ValuationFormData) => void;
}

export function ValuationWizard({ onSubmit }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { toast } = useToast();

  const updateFormData = (data: Partial<ValuationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.sector && formData.industry && formData.stage && formData.valuationPurpose);
      case 2:
        return !!(formData.industryMetrics && Object.keys(formData.industryMetrics).length > 0);
      case 3:
        return !!(formData.selectedMethods && formData.selectedMethods.length > 0);
      case 4:
        return !!(formData.financials && Object.keys(formData.financials).length > 0);
      case 5:
        return true; // Review step is always valid as it just shows data
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) {
      toast({
        title: "Incomplete Step",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < 5) {
      setCompletedSteps(prev => Array.from(new Set([...prev, currentStep])));
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: ValuationFormData) => {
    try {
      setIsSubmitting(true);
      toast({
        title: "Processing",
        description: "Analyzing your inputs and generating valuation report...",
        duration: 3000,
      });
      await onSubmit(data);
      setCompletedSteps(prev => Array.from(new Set([...prev, 5])));
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {showOnboarding ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to the Valuation Wizard</CardTitle>
              <CardDescription className="text-base">
                Let's guide you through the process of valuing your business using our AI-powered platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map((step) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Step {step}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step === 1 && "Tell us about your business type and stage"}
                        {step === 2 && "Enter industry-specific metrics"}
                        {step === 3 && "Review and select the recommended valuation approach"}
                        {step === 4 && "Provide basic financial information"}
                        {step === 5 && "Review and confirm your information"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button
                onClick={() => setShowOnboarding(false)}
                className="w-full"
                size="lg"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="w-full">
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
                      <p className="max-w-xs">Follow our step-by-step guide to get an accurate valuation for your business.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant="outline" className="text-sm">
                Step {currentStep} of 5
              </Badge>
            </div>

            <ValuationProgress
              currentStep={currentStep}
              completedSteps={completedSteps}
              totalSteps={5}
            />
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <BusinessInfoStep
                    data={formData}
                    onUpdate={updateFormData}
                    onNext={handleNext}
                    currentStep={currentStep}
                    totalSteps={5}
                  />
                )}
                {currentStep === 2 && formData.sector && formData.industry && (
                  <IndustryMetricsForm
                    sector={formData.sector}
                    industry={formData.industry}
                    onMetricsUpdate={(metrics) => {
                      updateFormData({ industryMetrics: metrics });
                      handleNext();
                    }}
                    onNext={handleNext}
                    currentStep={currentStep}
                    totalSteps={5}
                  />
                )}
                {currentStep === 3 && (
                  <MethodSelectionStep
                    data={formData}
                    onUpdate={updateFormData}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )}
                {currentStep === 4 && (
                  <FinancialDetailsStep
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
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      )}
    </div>
  );
}