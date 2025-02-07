import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calculator,
  ChartBar,
  FileText,
  BarChart,
  ClipboardCheck,
  DollarSign,
  FileSpreadsheet,
  Building2,
  GanttChartSquare,
  BookOpen
} from "lucide-react";
import { ValuationWizard } from "@/components/ValuationWizard";
import { QuickCalculator } from "@/components/QuickCalculator";
import { FinancialProjections } from "@/components/FinancialProjections";
import { PitchDeckGenerator } from "@/components/PitchDeckGenerator";
import { BusinessPlanWizard } from "@/components/BusinessPlanWizard";
import { ComplianceChecker } from "@/components/ComplianceChecker";
import { ValuationDashboard } from "@/components/ValuationDashboard";

type Tool = {
  id: string;
  name: string;
  icon: any;
  component: any;
  description: string;
};

const mainTools: Tool[] = [
  {
    id: "full-valuation",
    name: "Full Valuation",
    icon: Calculator,
    component: ValuationWizard,
    description: "Complete startup valuation analysis"
  },
  {
    id: "quick-calculator",
    name: "Quick Calculator",
    icon: DollarSign,
    component: QuickCalculator,
    description: "Fast estimation tool"
  },
  {
    id: "financial-projections",
    name: "Financial Projections",
    icon: ChartBar,
    component: FinancialProjections,
    description: "Detailed financial forecasting"
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck",
    icon: FileText,
    component: PitchDeckGenerator,
    description: "Create investor presentations"
  },
  {
    id: "business-plan",
    name: "Business Plan",
    icon: Building2,
    component: BusinessPlanWizard,
    description: "Comprehensive business planning"
  }
];

const analytics: Tool[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: BarChart,
    component: ValuationDashboard,
    description: "Analytics and insights"
  },
  {
    id: "compliance",
    name: "Compliance Check",
    icon: ClipboardCheck,
    component: ComplianceChecker,
    description: "Regulatory compliance"
  }
];

const resources: Tool[] = [
  {
    id: "pricing",
    name: "Pricing",
    icon: FileSpreadsheet,
    component: null,
    description: "Subscription plans"
  },
  {
    id: "api-docs",
    name: "API Docs",
    icon: BookOpen,
    component: null,
    description: "API documentation"
  }
];

export function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const allTools = [...mainTools, ...analytics, ...resources];
  const ActiveComponent = selectedTool
    ? allTools.find(tool => tool.id === selectedTool)?.component
    : null;

  const renderToolSection = (title: string, tools: Tool[]) => (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground px-2">{title}</h2>
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant={selectedTool === tool.id ? "default" : "ghost"}
          className="w-full justify-start gap-2"
          onClick={() => setSelectedTool(tool.id)}
        >
          <tool.icon className="h-4 w-4" />
          <span>{tool.name}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 border-r bg-background p-4">
          <ScrollArea className="h-[calc(100vh-2rem)]">
            <div className="space-y-6">
              {renderToolSection("Main Tools", mainTools)}
              <Separator />
              {renderToolSection("Analytics", analytics)}
              <Separator />
              {renderToolSection("Resources", resources)}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Welcome to Startup Valuation Platform</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainTools.map((tool) => (
                <Card
                  key={tool.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <tool.icon className="h-5 w-5" />
                      {tool.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}