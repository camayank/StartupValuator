import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface RiskAssessmentProps {
  data: {
    overallRisk: string;
    riskScore: number;
    categories: {
      market: string;
      financial: string;
      operational: string;
      competitive: string;
    };
    recommendations: string[];
  } | null;
}

export function RiskAssessment({ data }: RiskAssessmentProps) {
  if (!data) return null;

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "medium":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getRiskIcon(data.overallRisk)}
          Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Risk Score</span>
            <Badge variant={data.riskScore > 75 ? "destructive" : data.riskScore > 50 ? "warning" : "success"}>
              {data.riskScore}/100
            </Badge>
          </div>
          <Progress
            value={data.riskScore}
            className="h-2"
            indicatorClassName={getRiskColor(data.overallRisk)}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Risk Categories</h4>
          <div className="grid gap-3">
            {Object.entries(data.categories).map(([category, risk]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="capitalize text-sm">{category}</span>
                <Badge variant={
                  risk.toLowerCase() === "high" ? "destructive" :
                  risk.toLowerCase() === "medium" ? "warning" : "success"
                }>
                  {risk}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Recommendations</h4>
          <ul className="space-y-2">
            {data.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {recommendation}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
