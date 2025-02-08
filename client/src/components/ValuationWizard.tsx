import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  sessionData?: any; // Add session data prop
}

const steps = [
  {
    id: "businessInfo",
    title: "Business Information",
    description: "Tell us about your business",
    component: BusinessInfoStep,
    requiredFields: ["companyName", "industry", "businessModel"]
  },
  {
    id: "financialMetrics",
    title: "Financial Metrics",
    description: "Key financial indicators",
    component: FinancialMetricsStep,
    requiredFields: ["annualRevenue", "annualExpenses", "margins"]
  },
  {
    id: "marketAnalysis",
    title: "Market Analysis",
    description: "Market size and position",
    component: MarketAnalysisStep,
    requiredFields: ["targetMarket", "marketSize"]
  },
  {
    id: "competitiveAnalysis",
    title: "Competitive Analysis",
    description: "Analyze competitors",
    component: CompetitiveAnalysisStep,
    requiredFields: ["competitors", "competitiveAdvantage"]
  },
  {
    id: "riskAssessment",
    title: "Risk Assessment",
    description: "Identify and mitigate risks",
    component: RiskAssessmentStep,
    requiredFields: ["riskFactors", "mitigationStrategies"]
  },
  {
    id: "valuationSimulation",
    title: "Valuation Simulation",
    description: "Calculate company value",
    component: ValuationSimulationStep,
    requiredFields: []
  },
  {
    id: "reportGeneration",
    title: "Report Generation",
    description: "Generate detailed reports",
    component: ReportGenerationStep,
    requiredFields: []
  }
];

export function ValuationWizard({ onComplete, sessionData }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ValuationFormData>({
    businessInfo: {},
    financialMetrics: {},
    marketAnalysis: {},
    competitiveAnalysis: {},
    riskAssessment: {},
    valuationSimulation: {},
    reportGeneration: {}
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const { toast } = useToast();

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

  const handleStepUpdate = async (stepId: string, data: any) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    if (!validateStep(stepIndex, data)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [stepId]: data
    }));

    if (!completedSteps.includes(stepIndex + 1)) {
      setCompletedSteps(prev => [...prev, stepIndex + 1]);
    }

    toast({
      title: "Step Complete",
      description: "Your data has been saved successfully."
    });

    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const handleError = (error: Error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  };

  const getCurrentStepComponent = () => {
    const StepComponent = steps[currentStep].component;
    const stepId = steps[currentStep].id;

    const commonProps = {
      onUpdate: (data: any) => handleStepUpdate(stepId, data),
      initialData: formData[stepId as keyof ValuationFormData],
      onError: handleError
    };

    if (stepId === "businessInfo") {
      return (
        <StepComponent
          {...commonProps}
          sessionData={sessionData}
          onComplete={() => handleStepUpdate(stepId, formData[stepId as keyof ValuationFormData])}
        />
      );
    }

    return <StepComponent {...commonProps} />;
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
          {getCurrentStepComponent()}

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
                onClick={() => onComplete(formData)}
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