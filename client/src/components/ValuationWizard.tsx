import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ValuationProgress } from "@/components/ui/valuation-progress";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { FinancialMetricsStep } from "./wizard-steps/FinancialMetricsStep";
import { MarketAnalysisStep } from "./wizard-steps/MarketAnalysisStep";
import { CompetitiveAnalysisStep } from "./wizard-steps/CompetitiveAnalysisStep";
import { RiskAssessmentStep } from "./wizard-steps/RiskAssessmentStep";
import { ValuationSimulationStep } from "./wizard-steps/ValuationSimulationStep";
import { ReportGenerationStep } from "./wizard-steps/ReportGenerationStep";
import type { ValuationFormData } from "@/lib/validations";


interface ValuationWizardProps {
  onComplete: (data: ValuationFormData) => void;
}

const steps = [
  {
    id: "business-info",
    title: "Business Information",
    description: "Tell us about your business",
    component: BusinessInfoStep,
    requiredFields: ["companyName", "industry", "businessModel"]
  },
  {
    id: "financials",
    title: "Financial Metrics",
    description: "Key financial indicators",
    component: FinancialMetricsStep,
    requiredFields: ["annualRevenue", "annualExpenses", "margins"]
  },
  {
    id: "market",
    title: "Market Analysis",
    description: "Market size and position",
    component: MarketAnalysisStep,
    requiredFields: ["targetMarket", "marketSize"]
  },
  {
    id: "competition",
    title: "Competitive Analysis",
    description: "Analyze competitors",
    component: CompetitiveAnalysisStep,
    requiredFields: ["competitors", "competitiveAdvantage"]
  },
  {
    id: "risks",
    title: "Risk Assessment",
    description: "Identify and mitigate risks",
    component: RiskAssessmentStep,
    requiredFields: ["riskFactors", "mitigationStrategies"]
  },
  {
    id: "valuation",
    title: "Valuation Simulation",
    description: "Calculate company value",
    component: ValuationSimulationStep,
    requiredFields: [] // Add required fields if necessary
  },
  {
    id: "report",
    title: "Report Generation",
    description: "Generate detailed reports",
    component: ReportGenerationStep,
    requiredFields: [] // Add required fields if necessary
  }
];

export function ValuationWizard({ onComplete }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const { toast } = useToast();

  // Validate required fields for current step
  const validateStep = (stepIndex: number, data: any) => {
    const step = steps[stepIndex];
    const missingFields = step.requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        [stepIndex + 1]: `Missing required fields: ${missingFields.join(', ')}`
      }));
      return false;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[stepIndex + 1];
      return newErrors;
    });
    return true;
  };

  // Handle step data updates
  const handleStepUpdate = async (stepId: string, data: any) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    // Validate step data
    if (!validateStep(stepIndex, data)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      [stepId]: data
    }));

    // Mark step as completed
    if (!completedSteps.includes(stepIndex + 1)) {
      setCompletedSteps(prev => [...prev, stepIndex + 1]);
    }

    // Show success message
    toast({
      title: "Step Complete",
      description: "Your data has been saved successfully."
    });

    // Auto-advance to next step if available
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  // Handle completion
  const handleComplete = () => {
    // Validate all steps
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i, formData[steps[i].id])) {
        toast({
          title: "Incomplete Data",
          description: `Please complete step ${i + 1}: ${steps[i].title}`,
          variant: "destructive"
        });
        setCurrentStep(i);
        return;
      }
    }

    onComplete(formData as ValuationFormData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ValuationProgress
        currentStep={currentStep + 1}
        completedSteps={completedSteps}
        totalSteps={steps.length}
        validationErrors={validationErrors}
        onStepClick={(step) => {
          if (completedSteps.includes(step) || step === currentStep + 1) {
            setCurrentStep(step - 1);
          }
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Render current step component */}
          {(() => {
            const StepComponent = steps[currentStep].component;
            return (
              <StepComponent
                onUpdate={(data: any) => handleStepUpdate(steps[currentStep].id, data)}
                initialData={formData[steps[currentStep].id]}
              />
            );
          })()}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={completedSteps.length !== steps.length}
              >
                Complete Valuation
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={!completedSteps.includes(currentStep + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ValuationWizard;