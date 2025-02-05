import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  LineChart,
  PieChart,
  Radar,
  RadarChart,
} from "recharts";
import { Loader2 } from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";
import type { MarketAnalysisResult, RiskAssessmentResult, GrowthProjectionResult, TeamAnalysisResult, IPAssessmentResult } from "../../../server/services/ai-analysis-service";

interface AIAnalysisDashboardProps {
  formData: ValuationFormData;
}

interface AnalysisData {
  marketAnalysis: MarketAnalysisResult;
  riskAssessment: RiskAssessmentResult;
  growthProjections: GrowthProjectionResult;
  teamAnalysis: TeamAnalysisResult;
  ipAssessment: IPAssessmentResult;
}

export function AIAnalysisDashboard({ formData }: AIAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState("market");

  const { data: analysisData, isLoading } = useQuery<AnalysisData>({
    queryKey: ["analysis", "comprehensive", formData],
    queryFn: async () => {
      const response = await fetch("/api/analysis/comprehensive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch analysis data");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI-Powered Analysis Dashboard</CardTitle>
        <CardDescription>
          Comprehensive analysis of your startup using advanced AI models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="market">Market Analysis</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            <TabsTrigger value="growth">Growth Projections</TabsTrigger>
            <TabsTrigger value="team">Team Analysis</TabsTrigger>
            <TabsTrigger value="ip">IP Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="market">
            {analysisData?.marketAnalysis && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Market Trends</h3>
                <div className="grid grid-cols-2 gap-4">
                  {analysisData.marketAnalysis.trends.map((trend, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h4 className="font-medium">{trend.key}</h4>
                        <p className="text-sm text-muted-foreground">
                          {trend.description}
                        </p>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              trend.impact === "positive"
                                ? "bg-green-100 text-green-800"
                                : trend.impact === "negative"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {trend.impact} impact
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="risks">
            {analysisData?.riskAssessment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {analysisData.riskAssessment.overall.score.toFixed(1)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {analysisData.riskAssessment.overall.summary}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Object.entries(analysisData.riskAssessment.categories).map(([category, score]) => (
                          <li key={category} className="flex justify-between items-center">
                            <span className="capitalize">{category}</span>
                            <span className="font-semibold">{score.toFixed(1)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="growth">
            {analysisData?.growthProjections && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Revenue Projections</h3>
                <div className="grid grid-cols-2 gap-4">
                  {analysisData.growthProjections.growthDrivers.map((driver, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h4 className="font-medium">{driver.driver}</h4>
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <span>Impact</span>
                            <span>{(driver.impact * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Confidence</span>
                            <span>{(driver.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="team">
            {analysisData?.teamAnalysis && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {analysisData.teamAnalysis.overallScore.toFixed(1)}
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Key Strengths</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {analysisData.teamAnalysis.strengths.map((strength, index) => (
                            <li key={index} className="text-sm">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Expertise Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Object.entries(analysisData.teamAnalysis.expertise).map(([area, score]) => (
                          <li key={area} className="flex justify-between items-center">
                            <span className="capitalize">{area}</span>
                            <span className="font-semibold">{score.toFixed(1)}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ip">
            {analysisData?.ipAssessment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>IP Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {analysisData.ipAssessment.score.toFixed(1)}
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {analysisData.ipAssessment.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>IP Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Patents</h4>
                          <p className="text-sm">Count: {analysisData.ipAssessment.analysis.patents.count}</p>
                          <p className="text-sm">Strength: {analysisData.ipAssessment.analysis.patents.strength.toFixed(1)}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Trademarks</h4>
                          <p className="text-sm">Count: {analysisData.ipAssessment.analysis.trademarks.count}</p>
                          <p className="text-sm">Value: {analysisData.ipAssessment.analysis.trademarks.value.toFixed(1)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}