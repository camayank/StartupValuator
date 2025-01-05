import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ValuationData } from "@/lib/validations";
import { generateReport } from "@/lib/api";
import { RiskAssessment } from "./RiskAssessment";
import { FundingTimeline } from "./FundingTimeline";
import { PotentialPredictor } from "./PotentialPredictor";
import { EcosystemNetwork } from "./EcosystemNetwork";
import { FundingReadiness } from "./FundingReadiness";
import { calculateFundingReadiness } from "@/lib/fundingReadiness";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface ValuationResultProps {
  data: ValuationData | null;
}

const currencyConfig = {
  USD: { symbol: "$", locale: "en-US" },
  INR: { symbol: "₹", locale: "en-IN" },
  EUR: { symbol: "€", locale: "de-DE" },
  GBP: { symbol: "£", locale: "en-GB" },
  JPY: { symbol: "¥", locale: "ja-JP" },
};

export function ValuationResult({ data }: ValuationResultProps) {
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!data) return;

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'startup-valuation-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    if (!data?.currency || !currencyConfig[data.currency as keyof typeof currencyConfig]) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: 'compact'
      }).format(value);
    }

    const config = currencyConfig[data.currency as keyof typeof currencyConfig];
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: data.currency,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Valuation Result</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fill out the form to see your startup's valuation
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the breakdown chart
  const breakdownData = [
    {
      name: "Base Valuation",
      value: data.details.baseValuation,
    },
    ...Object.entries(data.details.adjustments).map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      value: Math.abs(value),
      isPositive: value > 0,
    })),
  ];

  // Calculate funding readiness
  const fundingReadiness = calculateFundingReadiness(data);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Valuation Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-primary">
              {formatCurrency(data.valuation)}
            </h3>
            <p className="text-sm text-muted-foreground">Estimated Valuation ({data.currency})</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span>Revenue Multiple</span>
              <span className="font-medium">{data.multiplier.toFixed(1)}x</span>
            </div>
            <Progress value={Math.min((data.multiplier / 20) * 100, 100)} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-4"
          >
            <h4 className="font-medium">Valuation Breakdown</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={formatCurrency} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    animationDuration={1000}
                    animationBegin={200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <Button
            className="w-full"
            onClick={handleGenerateReport}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Professional Report
          </Button>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <FundingReadiness data={fundingReadiness} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <FundingTimeline
          currentStage={data.stage}
          currentValuation={data.valuation}
        />
      </motion.div>

      {data.riskAssessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <RiskAssessment data={data.riskAssessment} />
        </motion.div>
      )}

      {data.potentialPrediction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <PotentialPredictor data={data.potentialPrediction} />
        </motion.div>
      )}

      {data.ecosystemNetwork && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <EcosystemNetwork data={data.ecosystemNetwork} />
        </motion.div>
      )}
    </div>
  );
}