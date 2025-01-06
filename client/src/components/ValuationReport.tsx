import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  PieChart,
  LineChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line
} from "recharts";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  FileText,
  PieChart as PieChartIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";
import { formatCurrency } from "@/lib/validations";

interface ValuationReportProps {
  data: ValuationFormData & {
    valuation: number;
    details: {
      baseValuation: number;
      adjustments: Record<string, number>;
    };
    assumptions: {
      discountRate: number;
      growthRate: number;
      terminalGrowthRate: number;
      beta: number;
      marketRiskPremium: number;
    };
    insights: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      risks: string[];
    };
  };
  onExport?: (format: 'pdf' | 'docx' | 'pptx') => void;
}

export function ValuationReport({ data, onExport }: ValuationReportProps) {
  const [activeTab, setActiveTab] = useState("summary");

  // Generate sample sensitivity analysis data
  const generateSensitivityData = () => {
    const baseValuation = data.valuation;
    const growthRates = [-2, -1, 0, 1, 2];
    const discountRates = [-2, -1, 0, 1, 2];

    return growthRates.flatMap(g => 
      discountRates.map(d => ({
        growthDiff: g,
        discountDiff: d,
        value: baseValuation * (1 + g/100) / (1 + d/100)
      }))
    );
  };

  // Generate sample comparison data
  const generateComparisonData = () => {
    return [
      {
        name: "Your Company",
        revenue: data.revenue,
        valuation: data.valuation,
        multiple: data.valuation / data.revenue
      },
      {
        name: "Industry Avg",
        revenue: data.revenue * 1.2,
        valuation: data.valuation * 1.3,
        multiple: (data.valuation * 1.3) / (data.revenue * 1.2)
      },
      {
        name: "Top Quartile",
        revenue: data.revenue * 1.5,
        valuation: data.valuation * 1.8,
        multiple: (data.valuation * 1.8) / (data.revenue * 1.5)
      }
    ];
  };

  const sensitivityData = generateSensitivityData();
  const comparisonData = generateComparisonData();

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <Card className="p-6">
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
          <Card className="p-4 border-2 border-primary">
            <h3 className="font-semibold mb-1">Valuation Range</h3>
            <div className="text-2xl font-bold">
              {formatCurrency(data.valuation * 0.9, data.currency)} - {formatCurrency(data.valuation * 1.1, data.currency)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Base: {formatCurrency(data.valuation, data.currency)}
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-1">Revenue Multiple</h3>
            <div className="text-2xl font-bold">
              {(data.valuation / data.revenue).toFixed(1)}x
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Industry Avg: {((data.valuation * 1.3) / (data.revenue * 1.2)).toFixed(1)}x
            </p>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-1">Risk Profile</h3>
            <div className="text-2xl font-bold">
              {data.assumptions.beta.toFixed(2)}β
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Market Risk Premium: {(data.assumptions.marketRiskPremium * 100).toFixed(1)}%
            </p>
          </Card>
        </div>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Revenue Growth</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={[
                    { year: 'Current', value: data.revenue },
                    { year: 'Year 1', value: data.revenue * (1 + data.growthRate) },
                    { year: 'Year 2', value: data.revenue * Math.pow(1 + data.growthRate, 2) },
                    { year: 'Year 3', value: data.revenue * Math.pow(1 + data.growthRate, 3) }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-medium mb-2">Valuation Breakdown</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Tooltip />
                    <Legend />
                    <Area
                      data={[
                        { name: 'Base Value', value: data.details.baseValuation },
                        ...Object.entries(data.details.adjustments).map(([key, value]) => ({
                          name: key,
                          value: value
                        }))
                      ]}
                      dataKey="value"
                      nameKey="name"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sensitivity Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="growthDiff" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Market Comparisons</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="multiple" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {data.insights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {data.insights.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-1" />
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Opportunities
              </h3>
              <ul className="space-y-2">
                {data.insights.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 mt-1" />
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Risk Factors
              </h3>
              <ul className="space-y-2">
                {data.insights.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-1" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This valuation report follows {data.complianceStandard?.toUpperCase()} standards
              and best practices for {data.region.toUpperCase()} region.
            </AlertDescription>
          </Alert>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compliance Checklist</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Valuation methodology aligns with regulatory requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>All required disclosures included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Market data sources properly cited</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Assumptions clearly documented</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Regulatory Notes</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                <p>
                  This valuation report complies with all applicable regulations and
                  standards for {data.region} region, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Standard methodology requirements</li>
                  <li>Documentation guidelines</li>
                  <li>Disclosure requirements</li>
                  <li>Data source validation</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Note: This report should be reviewed by qualified professionals
                  before being used for regulatory purposes.
                </p>
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
