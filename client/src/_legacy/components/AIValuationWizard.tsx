import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReportGenerationProgress } from "./ReportGenerationProgress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, ChartBar, FileText, Globe, ActivitySquare, Target, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";
import {
  validateFinancialMetrics,
  generateValuationReport,
  getMarketInsights,
  analyzeCompetitiveLandscape
} from "@/lib/services/ai-service";
import { ValuationProgress } from "@/components/ui/valuation-progress";

interface AIValuationWizardProps {
  formData: ValuationFormData;
  onComplete: (report: any) => void;
}

const analysisSteps = [
  {
    id: "metrics",
    title: "Financial Metrics Validation",
    description: "Validating and benchmarking key performance metrics",
    icon: ChartBar,
    aiPrompt: "Analyzing financial metrics and comparing with industry standards...",
  },
  {
    id: "market",
    title: "Market Analysis",
    description: "Analyzing market dynamics and competitive landscape",
    icon: Globe,
    aiPrompt: "Evaluating market conditions and industry trends...",
  },
  {
    id: "competition",
    title: "Competitive Analysis",
    description: "Assessing competitive positioning and advantages",
    icon: Target,
    aiPrompt: "Analyzing competitive landscape and market positioning...",
  },
  {
    id: "risks",
    title: "Risk Assessment",
    description: "Identifying and analyzing potential risks",
    icon: ActivitySquare,
    aiPrompt: "Evaluating business risks and mitigation strategies...",
  },
  {
    id: "report",
    title: "Report Generation",
    description: "Compiling comprehensive valuation report",
    icon: FileText,
    aiPrompt: "Generating detailed valuation analysis and recommendations...",
  },
];

export function AIValuationWizard({ formData, onComplete }: AIValuationWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [currentThought, setCurrentThought] = useState("");
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

  const processStep = async (step: typeof analysisSteps[0]) => {
    setThinking(true);
    setCurrentThought(step.aiPrompt);
    setError(null);

    try {
      let result;
      switch (step.id) {
        case "metrics":
          result = await validateFinancialMetrics(formData.financialData);
          break;
        case "market":
          result = await getMarketInsights(
            formData.businessInfo.sector,
            formData.businessInfo.businessModel
          );
          break;
        case "competition":
          result = await analyzeCompetitiveLandscape({
            sector: formData.businessInfo.sector,
            industry: formData.businessInfo.industry,
            competitors: formData.marketData.competitors
          });
          break;
        case "risks":
          // Use OpenAI for risk analysis
          result = await validateFinancialMetrics({
            ...formData.risksAndOpportunities,
            financials: formData.financialData
          });
          break;
        case "report":
          const finalReport = await generateValuationReport({
            ...formData,
            analysisResults
          });
          onComplete(finalReport);
          return;
      }

      setAnalysisResults(prev => ({
        ...prev,
        [step.id]: result
      }));

      toast({
        title: `${step.title} Complete`,
        description: "Analysis completed successfully",
      });

      setCompletedSteps([...completedSteps, currentStep +1]);

      if (currentStep < analysisSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (err) {
      console.error(`Error in ${step.id}:`, err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      toast({
        title: "Analysis Error",
        description: err instanceof Error ? err.message : "Failed to complete analysis",
        variant: "destructive",
      });
    } finally {
      setThinking(false);
    }
  };

  const handleStartAnalysis = async () => {
    setShowProgress(true);
    await processStep(analysisSteps[0]);
  };

  useEffect(() => {
    if (showProgress && !thinking && currentStep < analysisSteps.length) {
      processStep(analysisSteps[currentStep]);
    }
  }, [currentStep, showProgress, thinking]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {showProgress && (
        <ValuationProgress
          currentStep={currentStep + 1}
          completedSteps={completedSteps}
          totalSteps={analysisSteps.length}
          validationErrors={validationErrors}
          onStepClick={(step) => {
            if (completedSteps.includes(step) || step === currentStep + 1) {
              setCurrentStep(step - 1);
            }
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI-Powered Valuation Analysis
          </CardTitle>
          <CardDescription>
            Our advanced AI will analyze your business data and generate comprehensive insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showProgress ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {analysisSteps.map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <Card key={step.id} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <StepIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleStartAnalysis}
                  className="gap-2"
                >
                  <Brain className="h-5 w-5" />
                  Start AI Analysis
                </Button>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Progress Steps */}
                <div className="space-y-4">
                  {analysisSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isComplete = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isPending = index > currentStep;

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                          isCurrent ? "border-primary bg-primary/5" : "bg-card"
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          isComplete ? "bg-green-500" :
                            isCurrent ? "bg-primary" :
                              "bg-muted"
                        }`}>
                          <StepIcon className={`h-5 w-5 ${
                            isComplete || isCurrent ? "text-white" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{step.title}</h3>
                            <Badge variant={
                              isComplete ? "success" :
                                isCurrent ? "default" :
                                  "secondary"
                            }>
                              {isComplete ? "Complete" :
                                isCurrent ? "In Progress" :
                                  "Pending"}
                            </Badge>
                          </div>
                          {isCurrent && thinking && (
                            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {currentThought}
                            </p>
                          )}
                          {isComplete && analysisResults[step.id] && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              Analysis complete
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
                    {error}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}