import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  Sparkles,
  AlertTriangle,
  Lightbulb,
  LineChart
} from "lucide-react";

interface PotentialPredictorProps {
  data: {
    score: number;
    growth_potential: string;
    success_probability: number;
    strengths: string[];
    areas_of_improvement: string[];
    market_opportunities: string[];
    five_year_projection: {
      revenue_multiplier: number;
      market_share_potential: string;
      team_size_projection: string;
    };
  } | null;
}

export function PotentialPredictor({ data }: PotentialPredictorProps) {
  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Startup Potential Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Potential Score</span>
                <Badge variant={data.score > 75 ? "default" : data.score > 50 ? "secondary" : "destructive"}>
                  {data.score}/100
                </Badge>
              </div>
              <Progress
                value={data.score}
                className="h-2"
                indicatorClassName={getScoreColor(data.score)}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Success Probability</span>
              <span className="text-sm font-medium">{data.success_probability}%</span>
            </div>
            <Progress
              value={data.success_probability}
              className="h-2"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" />
              Growth Potential
            </h4>
            <p className="text-sm text-muted-foreground">{data.growth_potential}</p>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" />
              Key Strengths
            </h4>
            <ul className="space-y-2">
              {data.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {data.areas_of_improvement.map((area, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {area}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4" />
              Market Opportunities
            </h4>
            <ul className="space-y-2">
              {data.market_opportunities.map((opportunity, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {opportunity}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Target className="w-4 h-4" />
              5-Year Projections
            </h4>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Revenue Growth:</span>
                <span className="text-muted-foreground ml-2">
                  {data.five_year_projection.revenue_multiplier}x current revenue
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Market Share:</span>
                <span className="text-muted-foreground ml-2">
                  {data.five_year_projection.market_share_potential}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Team Size:</span>
                <span className="text-muted-foreground ml-2">
                  {data.five_year_projection.team_size_projection}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
