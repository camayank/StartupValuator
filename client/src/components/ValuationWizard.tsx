import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, BarChart3, Calculator, DollarSign, ClipboardCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { IndustryMetricsStep } from "./wizard-steps/IndustryMetricsStep";
import { MethodSelectionStep } from "./wizard-steps/MethodSelectionStep";
import { FinancialDetailsStep } from "./wizard-steps/FinancialDetailsStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import { StepCard } from "./wizard-steps/StepCard";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";

interface ValuationWizardProps {
  onSubmit: (data: ValuationFormData) => void;
}

const steps = [
  {
    title: "Business Information",
    description: "Tell us about your business type and stage",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: "Industry Metrics",
    description: "Enter sector-specific performance metrics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Valuation Method",
    description: "Choose the most suitable valuation approach",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    title: "Financial Details",
    description: "Input key financial information",
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    title: "Review",
    description: "Review and confirm your information",
    icon: <ClipboardCheck className="h-5 w-5" />,
  },
];

export function ValuationWizard({ onSubmit }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="w-full">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Business Valuation Wizard</CardTitle>
            <Badge variant="outline" className="text-sm">
              Step {currentStep} of 5
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => (
              <StepCard
                key={index}
                icon={step.icon}
                title={step.title}
                description={step.description}
                isActive={currentStep === index + 1}
                isComplete={completedSteps.includes(index + 1)}
                stepNumber={index + 1}
                totalSteps={5}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
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
              {currentStep === 2 && (
                <IndustryMetricsStep
                  data={formData}
                  onUpdate={updateFormData}
                  onNext={handleNext}
                  onBack={handleBack}
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
    </div>
  );
}