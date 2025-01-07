import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle2, Circle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { MethodSelectionStep } from "./wizard-steps/MethodSelectionStep";
import { FinancialDetailsStep } from "./wizard-steps/FinancialDetailsStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";

interface ValuationWizardProps {
  onSubmit: (data: ValuationFormData) => void;
}

interface StepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
}

interface ReviewStepProps extends Omit<StepProps, 'onNext'> {
  onSubmit: (data: ValuationFormData) => void;
  isSubmitting: boolean;
}

type WizardStep = {
  id: number;
  title: string;
  description: string;
  helpText: string;
  icon: React.ReactNode;
};

const STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Business Information",
    description: "Tell us about your business type and stage",
    helpText: "Start by providing basic information about your company. This helps us understand your business context and select the most appropriate valuation methods.",
    icon: <Circle className="w-4 h-4" />,
  },
  {
    id: 2,
    title: "Valuation Method",
    description: "Review and select the recommended valuation approach",
    helpText: "Our AI analyzes your business profile to recommend the most suitable valuation methods. You can review and adjust these recommendations.",
    icon: <Circle className="w-4 h-4" />,
  },
  {
    id: 3,
    title: "Financial Details",
    description: "Provide basic financial information",
    helpText: "Enter your key financial metrics. Don't worry if you don't have exact figures - our system can work with estimates and ranges.",
    icon: <Circle className="w-4 h-4" />,
  },
  {
    id: 4,
    title: "Review",
    description: "Review and confirm your information",
    helpText: "Take a final look at your inputs before we generate your detailed valuation report. You can go back and adjust any information if needed.",
    icon: <Circle className="w-4 h-4" />,
  },
];

export function ValuationWizard({ onSubmit }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
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

  const handleSubmit = async (data: ValuationFormData) => {
    try {
      setIsSubmitting(true);
      toast({
        title: "Processing",
        description: "Analyzing your inputs and generating valuation report...",
        duration: 3000,
      });
      await onSubmit(data);
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
    <div className="space-y-8 max-w-4xl mx-auto">
      {showOnboarding && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to the Valuation Wizard</CardTitle>
            <CardDescription className="text-base">
              Let's guide you through the process of valuing your business using our AI-powered platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {STEPS.map((step) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowOnboarding(false)} className="w-full">
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

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
                    <p className="max-w-xs">{STEPS[currentStep - 1].helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of {STEPS.length}
            </Badge>
          </div>

          {/* Progress Tracker */}
          <div className="mb-8">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="grid grid-cols-4 gap-4">
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
                  <motion.div
                    initial={false}
                    animate={step.id <= currentStep ? "active" : "inactive"}
                    variants={{
                      active: {
                        scale: 1.2,
                        transition: { duration: 0.3 },
                      },
                      inactive: {
                        scale: 1,
                        transition: { duration: 0.3 },
                      },
                    }}
                    className="mb-2"
                  >
                    {step.id < currentStep ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      step.icon
                    )}
                  </motion.div>
                  <span className="text-xs font-medium">{step.title}</span>
                </motion.div>
              ))}
            </div>
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
            >
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
                <MethodSelectionStep
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
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}