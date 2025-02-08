import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, ChartBar, Globe, TrendingUp, Building2, LineChart, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface MarketAnalyzerProps {
  sector: string;
  industry: string;
  region: string;
  onAnalysisComplete: (data: MarketAnalysisResult) => void;
}

interface MarketAnalysisResult {
  marketSize: {
    total: number;
    addressable: number;
    serviceable: number;
    growth: number;
  };
  competitors: Array<{
    name: string;
    marketShare: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  trends: Array<{
    name: string;
    impact: number;
    probability: number;
    timeframe: string;
  }>;
  metrics: {
    cagr: number;
    penetration: number;
    concentration: number;
    barriers: number;
  };
  sentiment: {
    score: number;
    factors: Array<{
      name: string;
      impact: number;
      trend: 'positive' | 'negative' | 'neutral';
    }>;
  };
}

export function MarketAnalyzer({ sector, industry, region, onAnalysisComplete }: MarketAnalyzerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [thoughts, setThoughts] = useState("");

  const steps = [
    {
      id: "market_size",
      title: "Market Size Analysis",
      icon: Globe,
      thought: `Analyzing total addressable market for ${industry} in ${region}...`,
    },
    {
      id: "growth_trends",
      title: "Growth Trends",
      icon: TrendingUp,
      thought: `Evaluating market growth patterns and future projections...`,
    },
    {
      id: "competition",
      title: "Competitive Landscape",
      icon: Building2,
      thought: `Mapping key players and market share distribution...`,
    },
    {
      id: "real_time_metrics",
      title: "Real-Time Market Metrics",
      icon: Activity,
      thought: `Gathering live market indicators and metrics...`,
    },
    {
      id: "sentiment_analysis",
      title: "Market Sentiment",
      icon: LineChart,
      thought: `Analyzing market sentiment and news impact...`,
    },
    {
      id: "ai_insights",
      title: "AI-Powered Insights",
      icon: Brain,
      thought: `Generating AI-enhanced market predictions...`,
    },
  ];

  const { data: marketAnalysis, isLoading } = useQuery({
    queryKey: ['marketAnalysis', sector, industry, region],
    queryFn: async () => {
      const response = await axios.post('/api/market-analysis', {
        sector,
        industry,
        region,
      });
      return response.data as MarketAnalysisResult;
    },
    onSuccess: (data) => {
      onAnalysisComplete(data);
      setProgress(100);
    },
    onError: (error) => {
      console.error('Market analysis error:', error);
      setThoughts('Error occurred during market analysis');
    },
  });

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const newStep = Math.floor((prev / 100) * steps.length);
          if (newStep !== currentStep && newStep < steps.length) {
            setCurrentStep(newStep);
            setThoughts(steps[newStep].thought);
          }
          return prev + 1;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentStep, steps.length, isLoading]);

  const renderMetric = (label: string, value: number, format: 'percentage' | 'currency' | 'number' = 'number') => {
    const formattedValue = format === 'percentage' ? `${(value * 100).toFixed(1)}%` :
                          format === 'currency' ? new Intl.NumberFormat('en-US', { 
                            style: 'currency', 
                            currency: 'USD',
                            notation: 'compact',
                            maximumFractionDigits: 1
                          }).format(value) :
                          value.toLocaleString();

    return (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-bold">{formattedValue}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Advanced Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analysis Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : isComplete
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        isActive ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      <StepIcon className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.title}</p>
                      {isActive && (
                        <p className="text-sm text-muted-foreground">{thoughts}</p>
                      )}
                    </div>
                    {isComplete && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-2 w-2 rounded-full bg-primary"
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {marketAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {renderMetric('Total Market Size', marketAnalysis.marketSize.total, 'currency')}
              {renderMetric('Market Growth (CAGR)', marketAnalysis.metrics.cagr, 'percentage')}
              {renderMetric('Market Sentiment', marketAnalysis.sentiment.score, 'percentage')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}