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
import { Info } from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { FinancialMetricsStep } from "./wizard-steps/FinancialMetricsStep";
import { MarketAnalysisStep } from "./wizard-steps/MarketAnalysisStep";
import { CompetitiveAnalysisStep } from "./wizard-steps/CompetitiveAnalysisStep";
import { RiskAssessmentStep } from "./wizard-steps/RiskAssessmentStep";
import { ValuationSimulationStep } from "./wizard-steps/ValuationSimulationStep";
import { ReportGenerationStep } from "./wizard-steps/ReportGenerationStep";


interface ValuationWizardProps {
  onComplete: (data: ValuationFormData) => void;
  sessionData?: any;
}

const steps = [
  {
    id: "businessInfo",
    title: "Business Information",
    description: "Tell us about your business",
    component: BusinessInfoStep,
  },
  {
    id: "financialMetrics",
    title: "Financial Metrics",
    description: "Key financial indicators",
    component: FinancialMetricsStep,
  },
  {
    id: "marketAnalysis",
    title: "Market Analysis",
    description: "Market size and position",
    component: MarketAnalysisStep,
  },
  {
    id: "competitiveAnalysis",
    title: "Competitive Analysis",
    description: "Competitive landscape",
    component: CompetitiveAnalysisStep,
  },
  {
    id: "riskAssessment",
    title: "Risk Assessment",
    description: "Risk evaluation",
    component: RiskAssessmentStep,
  },
  {
    id: "valuationSimulation",
    title: "Valuation Simulation",
    description: "Calculate company value",
    component: ValuationSimulationStep,
  },
  {
    id: "reportGeneration",
    title: "Report Generation",
    description: "Generate detailed reports",
    component: ReportGenerationStep,
  }
];

export function ValuationWizard({ onComplete, sessionData }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const { toast } = useToast();

  const handleStepUpdate = async (stepId: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: data
    }));

    // Show success message
    toast({
      title: "Saved",
      description: "Your progress has been saved",
    });

    // Move to next step if available
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = () => {
    if (Object.keys(formData).length < steps.length) {
      toast({
        title: "Incomplete",
        description: "Please complete all steps before submitting",
        variant: "destructive"
      });
      return;
    }
    onComplete(formData as ValuationFormData);
  };

  const StepComponent = steps[currentStep].component;
  const stepId = steps[currentStep].id;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex justify-between items-center py-4 px-6 bg-background rounded-lg border">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex flex-col items-center ${
              index === currentStep
                ? "text-primary"
                : index < currentStep
                ? "text-muted-foreground"
                : "text-muted"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-muted"
                  : "bg-muted/50"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-sm font-medium hidden md:block">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Start by telling us about your business. This helps us provide accurate valuation insights.
              </AlertDescription>
            </Alert>
          )}

          <StepComponent
            onUpdate={(data: any) => handleStepUpdate(stepId, data)}
            initialData={formData[stepId]}
            sessionData={sessionData}
          />

          <div className="flex justify-between mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete}>
                Complete Valuation
              </Button>
            ) : (
              <Button onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}>
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ValuationWizard;