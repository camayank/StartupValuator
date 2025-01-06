import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, Shield, Globe, LineChart } from "lucide-react";
import type { MarketSentiment } from "@/lib/api";
import { formatCurrency } from "@/lib/validations";

interface ValuationDashboardProps {
  valuation: number;
  currency: string;
  marketSentiment: MarketSentiment;
  industry: string;
  region: string;
}

export function ValuationDashboard({
  valuation,
  currency,
  marketSentiment,
  industry,
  region,
}: ValuationDashboardProps) {
  // Calculate the overall sentiment score as a percentage
  const overallSentimentScore = Math.round(marketSentiment.overallScore * 100);

  const getSentimentColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Valuation Summary */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Valuation Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">
            {formatCurrency(valuation, currency)}
          </div>
          <div className="text-sm text-muted-foreground">
            Based on current market conditions and company metrics
          </div>
        </CardContent>
      </Card>

      {/* Market Sentiment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className={`font-bold ${getSentimentColor(overallSentimentScore)}`}>
                  {overallSentimentScore}%
                </span>
              </div>
              <Progress 
                value={overallSentimentScore} 
                className={getProgressColor(overallSentimentScore)}
              />
            </div>
            
            <div className="space-y-2">
              {Object.entries(marketSentiment.sentimentByFactor).map(([factor, score]) => (
                <div key={factor} className="flex justify-between items-center">
                  <span className="text-sm capitalize">
                    {factor.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge variant={score >= 0.7 ? "default" : score >= 0.5 ? "secondary" : "destructive"}>
                    {Math.round(score * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Key insights for {industry} sector in {region}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              {marketSentiment.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              {marketSentiment.riskFactors.map((risk, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2" />
                  <p className="text-sm">{risk}</p>
                </div>
              ))}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Stay informed about these risk factors to make better strategic decisions.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
