import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { MethodSelectionStep } from "./wizard-steps/MethodSelectionStep";
import { FinancialDetailsStep } from "./wizard-steps/FinancialDetailsStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import type { ValuationFormData } from "@/lib/validations";

interface ValuationWizardProps {
  onSubmit: (data: ValuationFormData) => void;
}

type WizardStep = {
  id: number;
  title: string;
  description: string;
};

const STEPS: WizardStep[] = [
  {
    id: 1,
    title: "Business Information",
    description: "Tell us about your business type and stage",
  },
  {
    id: 2,
    title: "Valuation Method",
    description: "Review and select the recommended valuation approach",
  },
  {
    id: 3,
    title: "Financial Details",
    description: "Provide basic financial information",
  },
  {
    id: 4,
    title: "Review",
    description: "Review and confirm your information",
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
    } else {
      onSubmit(formData as ValuationFormData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Business Valuation Wizard</CardTitle>
          <Badge variant="outline">
            Step {currentStep} of {STEPS.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
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
              />
            )}
            {currentStep === 2 && (
              <MethodSelectionStep
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
              <ReviewStep
                data={formData}
                onUpdate={updateFormData}
                onSubmit={onSubmit}
                onBack={handleBack}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {currentStep < STEPS.length && (
            <Button
              onClick={handleNext}
              className="flex items-center ml-auto"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
