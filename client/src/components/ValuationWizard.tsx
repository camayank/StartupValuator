import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";

// Import step components
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { FinancialMetricsStep } from "./wizard-steps/FinancialMetricsStep";
import { MarketAnalysisStep } from "./wizard-steps/MarketAnalysisStep";
import { CompetitiveAnalysisStep } from "./wizard-steps/CompetitiveAnalysisStep";
import { RiskAssessmentStep } from "./wizard-steps/RiskAssessmentStep";
import { ValuationSimulationStep } from "./wizard-steps/ValuationSimulationStep";
import { ReportGenerationStep } from "./wizard-steps/ReportGenerationStep";

const steps = [
  {
    id: "businessInfo",
    title: "Business Profile",
    description: "Tell us about your startup",
    component: BusinessInfoStep,
    validation: ["companyName", "industry", "stage"]
  },
  {
    id: "financialMetrics",
    title: "Financial Overview",
    description: "Key financial metrics and projections",
    component: FinancialMetricsStep,
    validation: ["revenue", "expenses", "growth"]
  },
  {
    id: "marketAnalysis",
    title: "Market Analysis",
    description: "Market size and positioning",
    component: MarketAnalysisStep,
    validation: ["targetMarket", "marketSize"]
  },
  {
    id: "competitiveAnalysis",
    title: "Competition",
    description: "Competitive landscape analysis",
    component: CompetitiveAnalysisStep,
    validation: ["competitors"]
  },
  {
    id: "riskAssessment",
    title: "Risk Profile",
    description: "Risk assessment and mitigation",
    component: RiskAssessmentStep,
    validation: ["risks", "mitigation"]
  },
  {
    id: "valuationSimulation",
    title: "Valuation",
    description: "Value calculation and scenarios",
    component: ValuationSimulationStep,
    validation: ["methodology"]
  },
  {
    id: "reportGeneration",
    title: "Final Report",
    description: "Comprehensive valuation report",
    component: ReportGenerationStep,
    validation: ["reportType"]
  }
];

interface ValuationWizardProps {
  onComplete: (data: ValuationFormData) => void;
  sessionData?: any;
}

export function ValuationWizard({ onComplete, sessionData }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const validateStep = (stepIndex: number, data: any): boolean => {
    const requiredFields = steps[stepIndex].validation;
    const isValid = requiredFields.every(field => {
      const value = data[field];
      return value !== undefined && value !== null && value !== '';
    });

    setStepValidation(prev => ({
      ...prev,
      [stepIndex]: isValid
    }));

    return isValid;
  };

  const handleStepUpdate = async (stepId: string, data: any) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (!validateStep(stepIndex, data)) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [stepId]: data
    }));

    toast({
      title: "Progress Saved",
      description: "Your information has been saved successfully"
    });

    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const calculateProgress = () => {
    const validSteps = Object.values(stepValidation).filter(Boolean).length;
    return (validSteps / steps.length) * 100;
  };

  const StepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Progress Tracker */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">
            Step {currentStep + 1} of {steps.length}
          </h2>
          <span className="text-sm text-muted-foreground">
            {Math.round(calculateProgress())}% Complete
          </span>
        </div>
        <Progress value={calculateProgress()} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <Button
            key={step.id}
            variant={currentStep === index ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (stepValidation[index] || index <= currentStep) {
                setCurrentStep(index);
              }
            }}
            disabled={!stepValidation[index] && index > currentStep}
            className="whitespace-nowrap"
          >
            {step.title}
          </Button>
        ))}
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
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
                    Let's start by understanding your business better. This information helps us provide accurate valuation insights.
                  </AlertDescription>
                </Alert>
              )}

              <StepComponent
                onUpdate={(data: any) => handleStepUpdate(steps[currentStep].id, data)}
                initialData={formData[steps[currentStep].id]}
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
                  <Button 
                    onClick={() => onComplete(formData as ValuationFormData)}
                    disabled={!Object.values(stepValidation).every(Boolean)}
                  >
                    Generate Valuation Report
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                    disabled={!stepValidation[currentStep]}
                  >
                    Continue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ValuationWizard;