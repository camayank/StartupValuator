import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  TrendingUp,
  Users,
  Building2,
  Boxes,
  Target,
  AlertCircle,
} from "lucide-react";

interface FundingReadinessProps {
  data: {
    overallScore: number;
    categories: {
      financial: {
        score: number;
        metrics: Record<string, number>;
      };
      market: {
        score: number;
        metrics: Record<string, number>;
      };
      team: {
        score: number;
        metrics: Record<string, number>;
      };
      product: {
        score: number;
        metrics: Record<string, number>;
      };
    };
    recommendations: string[];
    targetInvestors: Array<{
      type: string;
      matchScore: number;
      reason: string;
    }>;
  };
}

export function FundingReadiness({ data }: FundingReadinessProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  const categoryIcons = {
    financial: TrendingUp,
    market: Building2,
    team: Users,
    product: Boxes,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Funding Readiness Scorecard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <div className="text-3xl font-bold mb-2">{data.overallScore}%</div>
            <Badge variant={data.overallScore >= 80 ? "default" : data.overallScore >= 60 ? "secondary" : "destructive"}>
              {getScoreText(data.overallScore)}
            </Badge>
          </div>

          <div className="grid gap-4">
            {(Object.entries(data.categories) as Array<[keyof typeof categoryIcons, any]>).map(([category, value]) => {
              const Icon = categoryIcons[category];
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium capitalize">{category}</span>
                    </div>
                    <span className="text-sm">{Math.round(value.score * 100)}%</span>
                  </div>
                  <Progress
                    value={value.score * 100}
                    className={`h-2 ${getScoreColor(value.score * 100)}`}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(value.metrics).map(([metric, score]) => (
                      <div key={metric} className="text-sm">
                        <span className="text-muted-foreground capitalize">
                          {metric.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="ml-1 font-medium">
                          {Math.round((score as number) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4 className="font-medium flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {data.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {recommendation}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h4 className="font-medium mb-3">Target Investors</h4>
          <div className="space-y-3">
            {data.targetInvestors.map((investor, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{investor.type}</span>
                  <Badge variant="outline">
                    {Math.round(investor.matchScore * 100)}% Match
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {investor.reason}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}