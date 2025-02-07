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
  CheckCircle2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";
import { BusinessInfoStep } from "./wizard-steps/BusinessInfoStep";
import { FinancialMetricsStep } from "./wizard-steps/FinancialDetailsStep";
import { MarketAnalysisStep } from "./wizard-steps/MarketAnalysisStep";
import { CompetitiveAnalysisStep } from "./wizard-steps/CompetitiveAnalysisStep";
import { ReviewStep } from "./wizard-steps/ReviewStep";
import { AIAnalysisDashboard } from "./AIAnalysisDashboard";


interface ValuationWizardProps {
  onSubmit: (data: ValuationFormData) => void;
}

const sections = [
  {
    id: "business-profile",
    title: "Business Profile",
    icon: Building2,
    description: "Basic company information"
  },
  {
    id: "financial-metrics",
    title: "Financial Metrics",
    icon: DollarSign,
    description: "Revenue and key metrics"
  },
  {
    id: "market-analysis",
    title: "Market Analysis",
    icon: PieChart,
    description: "TAM, SAM, and SOM"
  },
  {
    id: "competitive-landscape",
    title: "Competition",
    icon: Users,
    description: "Competitive analysis"
  },
  {
    id: "advantages",
    title: "Competitive Edge",
    icon: ShieldCheck,
    description: "Your unique advantages"
  },
  {
    id: "growth-strategy",
    title: "Growth Strategy",
    icon: Target,
    description: "Future growth plans"
  },
  {
    id: "ai-insights",
    title: "AI Analysis",
    icon: Brain,
    description: "AI-powered insights"
  }
];

export function ValuationWizard({ onSubmit }: ValuationWizardProps) {
  const [activeSection, setActiveSection] = useState("business-profile");
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<ValuationFormData>>({});
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);

  // Update progress when form data changes
  useEffect(() => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
    setProgress((filledFields / totalFields) * 100);
  }, [formData]);

  const handleSectionUpdate = (sectionId: string, data: Partial<ValuationFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    if (!completedSections.includes(sectionId)) {
      setCompletedSections(prev => [...prev, sectionId]);
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData as ValuationFormData);
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
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Progress Tracker */}
      <div className="w-72 border-r bg-muted/10 p-6 fixed h-screen overflow-auto">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Valuation Form</h2>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </p>
          <Separator />
          <ScrollArea className="h-[calc(100vh-200px)]">
            <nav className="space-y-2">
              {sections.map((section, index) => {
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
          <div className="space-y-6">
            {/* Business Profile Section */}
            <section id="business-profile" className="scroll-mt-16">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <div>
                      <CardTitle>Business Profile</CardTitle>
                      <CardDescription>Tell us about your business</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <BusinessInfoStep onUpdate={data => handleSectionUpdate("business-profile", data)} />
                </CardContent>
              </Card>
            </section>

            {/* Financial Metrics Section */}
            <section id="financial-metrics" className="scroll-mt-16">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <div>
                      <CardTitle>Financial Metrics</CardTitle>
                      <CardDescription>Key financial indicators</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FinancialMetricsStep onUpdate={data => handleSectionUpdate("financial-metrics", data)}/>
                </CardContent>
              </Card>
            </section>

            {/* Market Analysis Section */}
            <section id="market-analysis" className="scroll-mt-16">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    <div>
                      <CardTitle>Market Analysis</CardTitle>
                      <CardDescription>Market size and opportunity</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <MarketAnalysisStep onUpdate={data => handleSectionUpdate("market-analysis", data)}/>
                </CardContent>
              </Card>
            </section>

            {/* Competition Section */}
            <section id="competitive-landscape" className="scroll-mt-16">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <div>
                      <CardTitle>Competitive Landscape</CardTitle>
                      <CardDescription>Analyze your competition</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CompetitiveAnalysisStep onUpdate={data => handleSectionUpdate("competitive-landscape", data)}/>
                </CardContent>
              </Card>
            </section>

            {/* Competitive Advantages Section */}
            <section id="advantages" className="scroll-mt-16">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    <div>
                      <CardTitle>Competitive Advantages</CardTitle>
                      <CardDescription>Your unique value proposition</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Advantages Form Component */}
                </CardContent>
              </Card>
            </section>

            {/* Growth Strategy Section */}
            <section id="growth-strategy" className="scroll-mt-16">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <div>
                      <CardTitle>Growth Strategy</CardTitle>
                      <CardDescription>Future growth plans</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Growth Strategy Form Component */}
                </CardContent>
              </Card>
            </section>

            {/* AI Analysis Section */}
            <section id="ai-insights" className="scroll-mt-16">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    <div>
                      <CardTitle>AI Insights</CardTitle>
                      <CardDescription>AI-powered analysis and recommendations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AIAnalysisDashboard onUpdate={data => handleSectionUpdate("ai-insights", data)}/>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}