import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle2, Brain, Target, FileText, ChartBar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { IndustryMetricsForm } from "./IndustryMetricsForm";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import { AIAnalysisDashboard } from "./AIAnalysisDashboard";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ValuationWizardProps {
  onSubmit: (data: ValuationFormData) => void;
}

export function ValuationWizard({ onSubmit }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Consolidated steps for efficiency
  const steps = [
    { 
      number: 1, 
      title: "Business Profile",
      description: "Company information and market position",
      icon: Target,
      validationKeys: ['businessInfo']
    },
    { 
      number: 2, 
      title: "Financial & Metrics",
      description: "Key metrics and financial data",
      icon: Brain,
      validationKeys: ['financialData', 'marketData']
    },
    {
      number: 3,
      title: "AI Analysis",
      description: "AI-powered insights and analysis",
      icon: ChartBar,
      validationKeys: []  // No validation needed as this is analysis display
    },
    { 
      number: 4, 
      title: "Review & Generate",
      description: "Verify and generate valuation",
      icon: FileText,
      validationKeys: ['all']
    }
  ];

  const updateFormData = (data: Partial<ValuationFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...data };
      validateStep(currentStep, updated);
      return updated;
    });
  };

  const validateStep = (step: number, data: Partial<ValuationFormData> = formData): boolean => {
    const requiredKeys = steps[step - 1].validationKeys;
    if (requiredKeys[0] === 'all') return true;
    if (requiredKeys.length === 0) return true;
    return requiredKeys.every(key => data[key as keyof ValuationFormData]);
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
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
        description: "Analyzing inputs and generating comprehensive report...",
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
        description: "Failed to generate valuation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview panel component
  const ValuationPreview = () => (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-semibold">Valuation Summary</h3>
        {formData.businessInfo && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Company</p>
            <p className="text-sm text-muted-foreground">{formData.businessInfo.name}</p>
          </div>
        )}
        {formData.businessInfo && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Sector & Industry</p>
            <p className="text-sm text-muted-foreground">
              {formData.businessInfo.sector} - {formData.businessInfo.industry}
            </p>
          </div>
        )}
        {formData.businessInfo && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Business Stage</p>
            <p className="text-sm text-muted-foreground">{formData.businessInfo.productStage}</p>
          </div>
        )}
        {formData.financialData && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Financial Overview</p>
            <p className="text-sm text-muted-foreground">
              Revenue: ${formData.financialData.revenue?.toLocaleString()}<br />
              Growth Rate: {formData.financialData.growthRate}%<br />
              Margins: {formData.financialData.margins}%
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Preview
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                <ValuationPreview />
              </SheetContent>
            </Sheet>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between mb-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
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
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-1 w-32 mt-4",
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
                  currentStep={currentStep}
                  totalSteps={steps.length}
                />
              )}
              {currentStep === 2 && formData.businessInfo && (
                <IndustryMetricsForm
                  sector={formData.businessInfo.sector}
                  industry={formData.businessInfo.industry}
                  onMetricsUpdate={(metrics) => {
                    updateFormData({ marketData: { ...formData.marketData, ...metrics } });
                    handleNext();
                  }}
                  onNext={handleNext}
                  currentStep={currentStep}
                  totalSteps={steps.length}
                />
              )}
              {currentStep === 3 && (
                <AIAnalysisDashboard formData={formData as ValuationFormData} />
              )}
              {currentStep === 4 && (
                <ReviewStep
                  data={formData as ValuationFormData}
                  onUpdate={updateFormData}
                  onSubmit={handleSubmit}
                  onBack={handleBack}
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
    </div>
  );
}