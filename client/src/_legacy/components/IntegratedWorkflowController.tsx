import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  FileText, 
  PieChart,
  ArrowRight,
  RefreshCcw,
  Presentation,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";
import { PitchDeckGenerator } from "./PitchDeckGenerator";
import { BusinessPlanWizard } from "./BusinessPlanWizard";
import { ValuationWizard } from "./ValuationWizard";
import { ReportGenerationProgress } from "./ReportGenerationProgress";
import type { ProjectData } from "@/lib/types/shared";

type WorkflowStep = 
  | "business_plan" 
  | "valuation" 
  | "pitch_deck"
  | "report";

interface WorkflowData extends Partial<ProjectData> {
  businessPlan?: any;
  valuation?: any;
  pitchDeck?: any;
}

export function IntegratedWorkflowController() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>("business_plan");
  const [workflowData, setWorkflowData] = useState<WorkflowData>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStepComplete = (step: WorkflowStep, data: any) => {
    setWorkflowData(prev => ({
      ...prev,
      [step]: data
    }));

    // Automatically move to next step
    const steps: WorkflowStep[] = ["business_plan", "valuation", "pitch_deck", "report"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1]);
    }
  };

  const handleRestart = () => {
    setWorkflowData({});
    setActiveStep("business_plan");
    setIsGenerating(false);
  };

  return (
    <div className="container max-w-7xl py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Startup Success Suite</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Start New Project
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-8">
            {[
              { id: "business_plan", icon: Building2, label: "Business Plan" },
              { id: "valuation", icon: BarChart3, label: "Valuation" },
              { id: "pitch_deck", icon: Presentation, label: "Pitch Deck" },
              { id: "report", icon: PieChart, label: "Final Report" },
            ].map(({ id, icon: Icon, label }, index) => (
              <div key={id} className="flex flex-col items-center gap-2">
                <div
                  className={`rounded-full p-3 ${
                    activeStep === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{label}</span>
                {index < 3 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          <Tabs value={activeStep} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="business_plan">Business Plan</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="pitch_deck">Pitch Deck</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
            </TabsList>

            <TabsContent value="business_plan">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BusinessPlanWizard
                  onComplete={(data) => handleStepComplete("business_plan", data)}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="valuation">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ValuationWizard
                  initialData={workflowData.businessPlan}
                  onComplete={(data) => handleStepComplete("valuation", data)}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="pitch_deck">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PitchDeckGenerator
                  initialData={{
                    ...workflowData.businessPlan,
                    valuation: workflowData.valuation
                  }}
                  onComplete={(data) => handleStepComplete("pitch_deck", data)}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="report">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {isGenerating ? (
                  <ReportGenerationProgress
                    onComplete={() => setIsGenerating(false)}
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-2xl font-bold mb-4">
                        Generate Comprehensive Report
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Generate a complete report including your business plan, valuation analysis, and pitch deck.
                      </p>
                      <Button
                        onClick={() => setIsGenerating(true)}
                        className="w-full"
                      >
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}