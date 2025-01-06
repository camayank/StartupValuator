import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  FileText,
  PieChart as PieChartIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  Layers,
  Target,
  Lightbulb,
  Scale,
  LucideIcon,
} from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";
import { ReviewAssumptions } from "./wizard-steps/ReviewAssumptions";

interface ValuationReportProps {
  data: ValuationFormData & {
    valuation: number;
    details: {
      baseValuation: number;
      adjustments: Record<string, number>;
      methodResults: {
        method: string;
        value: number;
        weight: number;
        description: string;
      }[];
    };
    assumptions: {
      discountRate: number;
      growthRate: number;
      terminalGrowthRate: number;
      beta: number;
      marketRiskPremium: number;
      margins: number;
      revenueMultiple: number;
    };
    insights: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      risks: string[];
      recommendations: string[];
    };
    marketData: {
      peerComparisons: {
        name: string;
        revenue: number;
        valuation: number;
        multiple: number;
      }[];
      industryMetrics: {
        metric: string;
        value: number;
        benchmark: number;
      }[];
    };
    projections: {
      year: string;
      revenue: number;
      ebitda: number;
      fcf: number;
    }[];
  };
  onExport?: (format: 'pdf' | 'docx' | 'pptx') => void;
  onRegenerateReport?: () => void;
  onUpdateAssumptions?: (assumptions: Partial<ValuationFormData>) => void;
}

type ReportSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
};

const REPORT_SECTIONS: ReportSection[] = [
  {
    id: "summary",
    title: "Executive Summary",
    icon: Target,
    description: "Overview of valuation results and key metrics",
  },
  {
    id: "methods",
    title: "Valuation Methods",
    icon: Scale,
    description: "Detailed breakdown of different valuation approaches",
  },
  {
    id: "analysis",
    title: "Financial Analysis",
    icon: BarChart3,
    description: "In-depth analysis of financial metrics and projections",
  },
  {
    id: "market",
    title: "Market Analysis",
    icon: PieChartIcon,
    description: "Industry comparables and market positioning",
  },
  {
    id: "insights",
    title: "AI Insights",
    icon: Lightbulb,
    description: "AI-generated analysis and recommendations",
  },
  {
    id: "assumptions",
    title: "Assumptions",
    icon: Layers,
    description: "Review and adjust valuation assumptions",
  },
];

export function ValuationReport({ 
  data, 
  onExport, 
  onRegenerateReport,
  onUpdateAssumptions 
}: ValuationReportProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleUpdateAssumptions = async (updatedData: Partial<ValuationFormData>) => {
    if (onUpdateAssumptions) {
      await onUpdateAssumptions(updatedData);
    }
  };

  const handleRegenerate = async () => {
    if (onRegenerateReport) {
      setIsRegenerating(true);
      try {
        await onRegenerateReport();
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  const valuationMethods = data.details.methodResults.map(method => ({
    name: method.method,
    value: method.value,
    weight: method.weight,
    weightedValue: method.value * method.weight,
  }));

  return (
    <div className="space-y-8">
      {/* Executive Summary Card */}
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Valuation Report</h2>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString()} | {data.businessName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.('pdf')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.('docx')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Word
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-4 border-2 border-primary bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Final Valuation</h3>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {formatCurrency(data.valuation, data.currency)}
              </div>
              <div className="text-sm text-muted-foreground">
                Range: {formatCurrency(data.valuation * 0.9, data.currency)} - {formatCurrency(data.valuation * 1.1, data.currency)}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Revenue Multiple</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {(data.valuation / data.revenue).toFixed(1)}x
              </div>
              <div className="text-sm text-muted-foreground">
                Industry Avg: {data.assumptions.revenueMultiple.toFixed(1)}x
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Risk Profile</h3>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {data.assumptions.beta.toFixed(2)}β
              </div>
              <div className="text-sm text-muted-foreground">
                Market Risk Premium: {(data.assumptions.marketRiskPremium * 100).toFixed(1)}%
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Main Report Content */}
      <Card className="bg-card">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex border-b">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex h-10 items-center justify-start gap-4 px-4 py-1">
                  {REPORT_SECTIONS.map((section) => (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5"
                    >
                      <section.icon className="w-4 h-4" />
                      <span>{section.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
            </div>

            <div className="p-6">
              <TabsContent value="summary" className="space-y-6">
                <div className="grid gap-6">
                  {/* Valuation Methods Overview */}
                  <Card className="p-6">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle>Valuation Methods Overview</CardTitle>
                    </CardHeader>
                    <div className="mt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={valuationMethods}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="weightedValue" name="Weighted Value" fill="#8884d8" />
                          <Bar dataKey="value" name="Raw Value" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Key Metrics */}
                  <Card className="p-6">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle>Financial Projections</CardTitle>
                    </CardHeader>
                    <div className="mt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.projections}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            name="Revenue"
                            stackId="1"
                            fill="#8884d8" 
                            stroke="#8884d8"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="ebitda" 
                            name="EBITDA"
                            stackId="2"
                            fill="#82ca9d" 
                            stroke="#82ca9d"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="fcf" 
                            name="Free Cash Flow"
                            stackId="3"
                            fill="#ffc658" 
                            stroke="#ffc658"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="methods" className="space-y-6">
                <div className="grid gap-6">
                  {data.details.methodResults.map((method, index) => (
                    <Card key={index} className="p-6">
                      <CardHeader className="px-0 pt-0">
                        <div className="flex items-center justify-between">
                          <CardTitle>{method.method}</CardTitle>
                          <Badge variant="secondary">
                            Weight: {(method.weight * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">
                            {formatCurrency(method.value, data.currency)}
                          </span>
                          <span className="text-muted-foreground">
                            Weighted: {formatCurrency(method.value * method.weight, data.currency)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{method.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Financial Metrics */}
                  <Card className="p-6">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle>Financial Metrics</CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                      {data.marketData.industryMetrics.map((metric, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{metric.metric}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              Industry: {metric.benchmark}
                            </span>
                            <span className={`font-medium ${
                              metric.value > metric.benchmark ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {metric.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Growth Analysis */}
                  <Card className="p-6">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle>Growth Analysis</CardTitle>
                    </CardHeader>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={data.projections}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Revenue"
                          stroke="#8884d8" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="market" className="space-y-6">
                <div className="grid gap-6">
                  {/* Market Comparables */}
                  <Card className="p-6">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle>Market Comparables</CardTitle>
                    </CardHeader>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.marketData.peerComparisons}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="multiple" name="Revenue Multiple" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Detailed Comparisons */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {data.marketData.peerComparisons.map((peer, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">{peer.name}</h4>
                            <Badge>{peer.multiple.toFixed(1)}x</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Revenue: {formatCurrency(peer.revenue, data.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Valuation: {formatCurrency(peer.valuation, data.currency)}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card className="p-6">
                    <CardHeader className="px-0 pt-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <CardTitle>Strengths</CardTitle>
                      </div>
                    </CardHeader>
                    <ul className="space-y-2">
                      {data.insights.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Weaknesses */}
                  <Card className="p-6">
                    <CardHeader className="px-0 pt-0">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <CardTitle>Areas for Improvement</CardTitle>
                      </div>
                    </CardHeader>
                    <ul className="space-y-2">
                      {data.insights.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Opportunities */}
                  <Card className="p-6">
                    <CardHeader className="px-0 pt-0">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <CardTitle>Opportunities</CardTitle>
                      </div>
                    </CardHeader>
                    <ul className="space-y-2">
                      {data.insights.opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-500 mt-1" />
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {/* Recommendations */}
                  <Card className="p-6">
                    <CardHeader className="px-0 pt-0">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <CardTitle>Recommendations</CardTitle>
                      </div>
                    </CardHeader>
                    <ul className="space-y-2">
                      {data.insights.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500 mt-1" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="assumptions" className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Review and adjust the valuation assumptions below. Changes will automatically update the valuation and regenerate the report.
                  </AlertDescription>
                </Alert>

                <ReviewAssumptions
                  data={data}
                  onUpdate={handleUpdateAssumptions}
                  onRegenerate={handleRegenerate}
                  onBack={() => setActiveTab("summary")}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}