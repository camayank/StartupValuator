import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Brain,
  Target,
  FileText,
  ChartBar,
  Building2,
  Users,
  TrendingUp,
  PieChart,
  LineChart,
  BarChart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { FinancialMetricsStep } from "./wizard-steps/FinancialDetailsStep";
import { MarketAnalysisStep } from "./wizard-steps/MarketAnalysisStep";
import { CompetitiveAnalysisStep } from "./wizard-steps/CompetitiveAnalysisStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import { AIAnalysisDashboard } from "./AIAnalysisDashboard";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface ValuationWizardProps {
  onSubmit: (data: ValuationFormData) => void;
}

const steps = [
  {
    id: "business-info",
    title: "Business Profile",
    description: "Company information and structure",
    icon: Building2,
    component: BusinessInfoStep,
  },
  {
    id: "financial-metrics",
    title: "Financial Metrics",
    description: "Key performance indicators",
    icon: TrendingUp,
    component: FinancialMetricsStep,
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    description: "Market size and positioning",
    icon: PieChart,
    component: MarketAnalysisStep,
  },
  {
    id: "competitive-analysis",
    title: "Competition",
    description: "Competitive landscape",
    icon: Users,
    component: CompetitiveAnalysisStep,
  },
  {
    id: "ai-analysis",
    title: "AI Analysis",
    description: "Advanced insights",
    icon: Brain,
    component: AIAnalysisDashboard,
  },
  {
    id: "review",
    title: "Review & Generate",
    description: "Final review",
    icon: FileText,
    component: ReviewStep,
  },
];

export function ValuationWizard({ onSubmit }: ValuationWizardProps) {
  const [currentStep, setCurrentStep] = useState<string>("business-info");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = (completedSteps.length / steps.length) * 100;

  const handleStepComplete = (stepId: string, data: Partial<ValuationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCompletedSteps(prev => Array.from(new Set([...prev, stepId])));

    const nextStepIndex = steps.findIndex(step => step.id === stepId) + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id);
    }
  };

  const handleStepBack = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].id);
    }
  };

  const handleSubmit = async (data: ValuationFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Valuation report generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate valuation report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStepIndex].component;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Navigation Sidebar */}
      <div className="w-80 border-r bg-muted/10 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Valuation Tool</h2>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {progress.toFixed(0)}% Complete
          </p>
        </div>

        <Separator className="my-6" />

        <ScrollArea className="h-[calc(100vh-15rem)]">
          <nav className="space-y-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isComplete = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const isClickable = index === 0 || completedSteps.includes(steps[index - 1].id);

              return (
                <Button
                  key={step.id}
                  variant={isCurrent ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isComplete && "text-primary",
                    !isClickable && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => isClickable && setCurrentStep(step.id)}
                  disabled={!isClickable}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{step.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {step.description}
                    </span>
                  </div>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="container max-w-4xl py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{steps[currentStepIndex].title}</CardTitle>
                      <CardDescription>
                        {steps[currentStepIndex].description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      Step {currentStepIndex + 1} of {steps.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CurrentStepComponent
                    data={formData}
                    onUpdate={(data) => handleStepComplete(currentStep, data)}
                    onBack={handleStepBack}
                    isLastStep={currentStepIndex === steps.length - 1}
                    onSubmit={handleSubmit}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}