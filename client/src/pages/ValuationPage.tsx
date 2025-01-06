import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BusinessInfoStep } from "@/components/wizard-steps/BusinessInfoStep";
import { MethodSelectionStep } from "@/components/wizard-steps/MethodSelectionStep";
import { ReviewStep } from "@/components/wizard-steps/ReviewStep";
import type { ValuationFormData } from "@/lib/validations";

const STEPS = [
  { id: 'business-info', title: 'Business Information' },
  { id: 'method-selection', title: 'Valuation Method' },
  { id: 'review', title: 'Review & Generate' }
];

export default function ValuationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleUpdate = (data: Partial<ValuationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSubmit = (data: ValuationFormData) => {
    // Handle final submission
    console.log('Final form data:', data);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Business Valuation</h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <BusinessInfoStep
              data={formData}
              onUpdate={handleUpdate}
              onNext={handleNext}
              currentStep={currentStep + 1}
              totalSteps={STEPS.length}
            />
          )}
          {currentStep === 1 && (
            <MethodSelectionStep
              data={formData}
              onUpdate={handleUpdate}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 2 && (
            <ReviewStep
              data={formData}
              onUpdate={handleUpdate}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}