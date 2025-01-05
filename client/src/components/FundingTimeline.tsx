import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

interface TimelineStage {
  stage: string;
  typical_valuation: number;
  typical_investment: number;
  current?: boolean;
}

interface FundingTimelineProps {
  currentStage: string;
  currentValuation: number;
}

export function FundingTimeline({ currentStage = 'seed', currentValuation = 0 }: FundingTimelineProps) {
  const timelineData: TimelineStage[] = [
    {
      stage: "Pre-seed",
      typical_valuation: 1000000,
      typical_investment: 200000,
      current: currentStage === "pre-seed",
    },
    {
      stage: "Seed",
      typical_valuation: 4000000,
      typical_investment: 1000000,
      current: currentStage === "seed",
    },
    {
      stage: "Series A",
      typical_valuation: 15000000,
      typical_investment: 5000000,
      current: currentStage === "seriesA",
    },
    {
      stage: "Series B",
      typical_valuation: 40000000,
      typical_investment: 15000000,
      current: currentStage === "seriesB",
    },
    {
      stage: "Growth",
      typical_valuation: 100000000,
      typical_investment: 30000000,
      current: currentStage === "growth",
    },
  ];

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const formatStageDisplay = (stage: string) => {
    if (!stage) return 'N/A';
    return stage
      .replace(/([A-Z])/g, ' $1')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background border rounded-lg shadow-lg p-3"
        >
          <p className="font-medium">{label} Stage</p>
          <p className="text-sm text-muted-foreground">
            Typical Valuation: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Typical Investment: {formatCurrency(payload[1].value)}
          </p>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Funding Timeline
          <Badge variant="outline">
            Current Stage: {formatStageDisplay(currentStage)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timelineData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="stage" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="typical_valuation" 
                fill="hsl(var(--primary))" 
                opacity={0.6}
                animationDuration={1000}
                animationBegin={200}
              />
              <Bar 
                dataKey="typical_investment" 
                fill="hsl(var(--primary))"
                animationDuration={1000}
                animationBegin={400}
              />
              {typeof currentValuation === 'number' && !isNaN(currentValuation) && (
                <ReferenceLine
                  y={currentValuation}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="3 3"
                  label={{
                    value: "Current Valuation",
                    position: "right",
                    fill: "hsl(var(--destructive))",
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 space-y-2"
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-primary opacity-60 rounded-sm" />
            <span>Typical Valuation Range</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span>Typical Investment Size</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-0.5 border-t-2 border-destructive border-dashed" />
            <span>Your Current Valuation</span>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}