import { useState } from "react";
import { BusinessInfoStep } from "./BusinessInfoStep";
import { IndustryMetricsStep } from "./IndustryMetricsStep";
import { MethodSelectionStep } from "./MethodSelectionStep";
import { ReviewStep } from "./ReviewStep";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";

type Step = 1 | 2 | 3 | 4;

export function ValuationWorkflowController() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const { toast } = useToast();

  const handleUpdateData = (data: Partial<ValuationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    const nextStep = (currentStep + 1) as Step;
    if (nextStep <= 4) {
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    const prevStep = (currentStep - 1) as Step;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
    }
  };

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute left-0 top-0 -z-10 h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-4 pb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center rounded-full ${
                step <= currentStep ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Step {step}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <BusinessInfoStep
          data={formData}
          onUpdate={handleUpdateData}
          onNext={handleNext}
        />
      )}
      {currentStep === 2 && (
        <IndustryMetricsStep
          data={formData}
          onUpdate={handleUpdateData}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
        <MethodSelectionStep
          data={formData}
          onUpdate={handleUpdateData}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 4 && (
        <ReviewStep
          data={formData}
          onUpdate={handleUpdateData}
          onBack={handleBack}
        />
      )}
    </div>
  );
}