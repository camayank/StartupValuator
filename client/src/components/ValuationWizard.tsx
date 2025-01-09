import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle2, Circle, HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { IndustryMetricsForm } from "./IndustryMetricsForm";
import { MethodSelectionStep } from "./wizard-steps/MethodSelectionStep";
import { FinancialDetailsStep } from "./wizard-steps/FinancialDetailsStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";

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

  const steps = [
    { 
      number: 1, 
      title: "Business Information",
      description: "Tell us about your business type and stage"
    },
    { 
      number: 2, 
      title: "Industry Metrics",
      description: "Enter industry-specific metrics"
    },
    { 
      number: 3, 
      title: "Valuation Method",
      description: "Select the most appropriate valuation approach"
    },
    { 
      number: 4, 
      title: "Financial Details",
      description: "Provide key financial information"
    },
    { 
      number: 5, 
      title: "Review & Submit",
      description: "Review and confirm your information"
    }
  ];

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
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) {
      toast({
        title: "Incomplete Information",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < steps.length) {
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
        title: "Processing Valuation",
        description: "Our AI is analyzing your inputs and generating a comprehensive valuation report...",
        duration: 3000,
      });
      await onSubmit(data);
      setCompletedSteps(prev => Array.from(new Set([...prev, steps.length])));
      toast({
        title: "Valuation Complete",
        description: "Your valuation report has been generated successfully.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "Failed to generate valuation. Please try again or contact support.",
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
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Sparkles className="h-8 w-8 text-primary" />
                Welcome to AI-Powered Valuation
              </CardTitle>
              <CardDescription className="text-lg">
                Let's guide you through the process of valuing your business using our advanced AI platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {steps.map((step) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: step.number * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="mt-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">{step.number}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button
                onClick={() => setShowOnboarding(false)}
                className="w-full"
                size="lg"
              >
                Start Valuation Process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  {steps[currentStep - 1].title}
                  <Badge variant="secondary" className="ml-2">
                    Step {currentStep} of {steps.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-base">
                  {steps[currentStep - 1].description}
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
                    <p className="max-w-xs">Need help? Click for detailed guidance on this step.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        currentStep === step.number
                          ? "bg-primary text-primary-foreground"
                          : completedSteps.includes(step.number)
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {completedSteps.includes(step.number) ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{step.number}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "h-1 w-24 mt-4",
                          completedSteps.includes(step.number)
                            ? "bg-primary/20"
                            : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={(currentStep / steps.length) * 100} className="h-2" />
            </div>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[400px]"
              >
                {currentStep === 1 && (
                  <BusinessInfoStep
                    data={formData}
                    onUpdate={updateFormData}
                    onNext={handleNext}
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
                    isSubmitting={isSubmitting}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
              {currentStep < steps.length && (
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
      )}
    </div>
  );
}