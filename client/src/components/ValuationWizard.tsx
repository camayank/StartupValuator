import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  DollarSign,
  PieChart,
  Users,
  ShieldCheck,
  Target,
  Brain,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { aiService } from "@/lib/services/ai-service";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { FinancialMetricsStep } from "./wizard-steps/FinancialMetricsStep";
import { MarketAnalysisStep } from "./wizard-steps/MarketAnalysisStep";
import { CompetitiveAnalysisStep } from "./wizard-steps/CompetitiveAnalysisStep";
import { RiskAssessmentStep } from "./wizard-steps/RiskAssessmentStep";
import { ValuationSimulationStep } from "./wizard-steps/ValuationSimulationStep";
import { ReportGenerationStep } from "./wizard-steps/ReportGenerationStep";

interface ValuationWizardProps {
  onComplete: (data: ValuationFormData) => void;
}

const sections = [
  {
    id: "business-info",
    title: "Business Information",
    description: "Tell us about your business",
    icon: Building2,
    prompt: "Let's start by setting up your business profile. Choose your industry:"
  },
  {
    id: "financials",
    title: "Financial Metrics",
    description: "Key financial indicators",
    icon: DollarSign,
    prompt: "Enter your revenue and financial metrics. Need AI to estimate missing data?"
  },
  {
    id: "market",
    title: "Market Analysis",
    description: "TAM, SAM, and market position",
    icon: PieChart,
    prompt: "Define your target market or let AI suggest TAM/SAM estimates"
  },
  {
    id: "competition",
    title: "Competitive Analysis",
    description: "Analyze competitors",
    icon: Users,
    prompt: "List your main competitors or use AI to detect them"
  },
  {
    id: "risks",
    title: "Risk Assessment",
    description: "Identify and mitigate risks",
    icon: ShieldCheck,
    prompt: "Select relevant risks or let AI scan for potential issues"
  },
  {
    id: "valuation",
    title: "Valuation Simulation",
    description: "Calculate company value",
    icon: Target,
    prompt: "Choose valuation methods or let AI recommend the best approach"
  },
  {
    id: "report",
    title: "Report Generation",
    description: "Generate detailed reports",
    icon: Brain,
    prompt: "Customize your report and export options"
  }
];

export function ValuationWizard({ onComplete }: ValuationWizardProps) {
  const [activeSection, setActiveSection] = useState("business-info");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);

  // Handle section updates with AI validation
  const handleSectionUpdate = async (sectionId: string, data: any) => {
    setIsProcessing(true);
    try {
      let aiResult;
      switch (sectionId) {
        case "financials":
          aiResult = await aiService.validateFinancialMetrics({
            ...data,
            industry: formData.businessInfo?.industry
          });
          break;
        case "market":
          aiResult = await aiService.getMarketInsights(
            formData.businessInfo?.sector || "",
            formData.businessInfo?.businessModel || "",
            data.targetMarket
          );
          break;
        case "risks":
          aiResult = await aiService.assessRisks({
            industry: formData.businessInfo?.industry || "",
            businessModel: formData.businessInfo?.businessModel || "",
            financials: formData.financials,
            marketData: formData.marketData
          });
          break;
        // Add other AI validations as needed
      }

      if (aiResult) {
        setAiAnalysis(prev => ({
          ...prev,
          [sectionId]: aiResult
        }));
      }

      setFormData(prev => ({
        ...prev,
        [sectionId]: data
      }));

      if (!completedSections.includes(sectionId)) {
        setCompletedSections(prev => [...prev, sectionId]);
      }

      // Auto-advance to next section
      const currentIndex = sections.findIndex(s => s.id === sectionId);
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1].id);
      }

      toast({
        title: "Section Complete",
        description: "Your data has been validated and saved."
      });
    } catch (error) {
      console.error("Error updating section:", error);
      toast({
        title: "Error",
        description: "Failed to validate data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate final report
  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      const report = await aiService.generateReport(formData, "full");
      onComplete({
        ...formData as ValuationFormData,
        aiAnalysis,
        report
      });
    } catch (error) {
      console.error("Error generating final report:", error);
      toast({
        title: "Error",
        description: "Failed to generate final report",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Update progress based on completed sections
  useEffect(() => {
    const totalSections = sections.length;
    const completedCount = completedSections.length;
    setProgress((completedCount / totalSections) * 100);
  }, [completedSections]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Progress Tracker */}
      <div className="w-72 border-r bg-muted/10 p-6 fixed h-screen overflow-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Startup Valuation</h2>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </p>
          <Separator />
          <ScrollArea className="h-[calc(100vh-200px)]">
            <nav className="space-y-2">
              {sections.map((section) => {
                const SectionIcon = section.icon;
                const isComplete = completedSections.includes(section.id);
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left",
                      isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
                      isComplete && "text-primary"
                    )}
                  >
                    <div className="mt-0.5">
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <SectionIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{section.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {section.description}
                      </div>
                      {isActive && (
                        <div className="mt-2 text-xs text-primary">
                          {section.prompt}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 pl-72">
        <div className="container max-w-4xl py-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{sections.find(s => s.id === activeSection)?.title}</CardTitle>
                  <CardDescription>
                    {sections.find(s => s.id === activeSection)?.description}
                  </CardDescription>
                </div>
                {isProcessing && (
                  <Badge variant="secondary" className="animate-pulse">
                    Processing...
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Dynamic Step Components */}
              {activeSection === "business-info" && (
                <BusinessInfoStep
                  onUpdate={(data) => handleSectionUpdate("business-info", data)}
                  initialData={formData.businessInfo}
                />
              )}
              {activeSection === "financials" && (
                <FinancialMetricsStep
                  onUpdate={(data) => handleSectionUpdate("financials", data)}
                  initialData={formData.financials}
                  aiAnalysis={aiAnalysis.financials}
                />
              )}
              {activeSection === "market" && (
                <MarketAnalysisStep
                  onUpdate={(data) => handleSectionUpdate("market", data)}
                  initialData={formData.marketData}
                  aiAnalysis={aiAnalysis.market}
                />
              )}
              {activeSection === "competition" && (
                <CompetitiveAnalysisStep
                  onUpdate={(data) => handleSectionUpdate("competition", data)}
                  initialData={formData.competition}
                  aiAnalysis={aiAnalysis.competition}
                />
              )}
              {activeSection === "risks" && (
                <RiskAssessmentStep
                  onUpdate={(data) => handleSectionUpdate("risks", data)}
                  initialData={formData.risks}
                  aiAnalysis={aiAnalysis.risks}
                />
              )}
              {activeSection === "valuation" && (
                <ValuationSimulationStep
                  onUpdate={(data) => handleSectionUpdate("valuation", data)}
                  initialData={formData.valuation}
                  aiAnalysis={aiAnalysis.valuation}
                />
              )}
              {activeSection === "report" && (
                <ReportGenerationStep
                  onUpdate={(data) => handleSectionUpdate("report", data)}
                  initialData={formData.report}
                  aiAnalysis={aiAnalysis.report}
                />
              )}


              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(sections[currentIndex - 1].id);
                    }
                  }}
                  disabled={activeSection === sections[0].id || isProcessing}
                >
                  Previous
                </Button>
                {activeSection === sections[sections.length - 1].id ? (
                  <Button
                    onClick={handleComplete}
                    disabled={isProcessing || completedSections.length !== sections.length}
                  >
                    Generate Report
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex < sections.length - 1) {
                        setActiveSection(sections[currentIndex + 1].id);
                      }
                    }}
                    disabled={isProcessing || !completedSections.includes(activeSection)}
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ValuationWizard;