import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReportGenerationProgress } from "./ReportGenerationProgress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ChartBar, FileText, Globe, Lightning, Target } from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";

interface AIValuationWizardProps {
  formData: ValuationFormData;
  onComplete: (report: any) => void;
}

const analysisSteps = [
  {
    id: "industry",
    title: "Industry Analysis",
    description: "Analyzing market dynamics and competitive landscape",
    icon: Globe,
    aiPrompt: "Analyzing industry trends, market size, and competitive dynamics...",
  },
  {
    id: "metrics",
    title: "Metric Validation",
    description: "Validating and benchmarking key performance metrics",
    icon: ChartBar,
    aiPrompt: "Comparing metrics against industry standards and identifying areas for optimization...",
  },
  {
    id: "potential",
    title: "Growth Potential",
    description: "Evaluating growth opportunities and market potential",
    icon: Target,
    aiPrompt: "Assessing growth vectors and market expansion possibilities...",
  },
  {
    id: "risks",
    title: "Risk Assessment",
    description: "Identifying and analyzing potential risks",
    icon: Lightning,
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
  const [currentStep, setCurrentStep] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [currentThought, setCurrentThought] = useState("");

  const handleStartAnalysis = () => {
    setShowProgress(true);
    setThinking(true);
    setCurrentThought(analysisSteps[0].aiPrompt);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
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
                <Button size="lg" onClick={handleStartAnalysis}>
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
              >
                {thinking ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-primary animate-pulse" />
                      <p className="text-sm text-muted-foreground">{currentThought}</p>
                    </div>
                    <ReportGenerationProgress
                      onComplete={() => onComplete({ status: "completed" })}
                    />
                  </div>
                ) : (
                  <ReportGenerationProgress
                    onComplete={() => onComplete({ status: "completed" })}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
