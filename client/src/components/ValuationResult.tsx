import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ValuationFormData } from "@/lib/validations";
import { generateReport } from "@/lib/api";
import { RiskAssessment } from "./RiskAssessment";
import { FundingTimeline } from "./FundingTimeline";
import { PotentialPredictor } from "./PotentialPredictor";
import { EcosystemNetwork } from "./EcosystemNetwork";
import { FundingReadiness } from "./FundingReadiness";
import { calculateFundingReadiness } from "@/lib/fundingReadiness";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import { ExportButton } from "./ExportButton";
import { FinancialTooltip } from "@/components/ui/financial-tooltip";

interface ValuationResultProps {
  data: ValuationFormData | null;
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
          <CardTitle>Valuation Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fill out the form to see your startup's valuation report
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the breakdown chart
  const breakdownData = [
    {
      name: "Base Valuation",
      value: data.details?.baseValuation || 0,
    },
    ...(data.details?.adjustments ? Object.entries(data.details.adjustments).map(([key, value]) => ({
      name: key.replace(/([A-Z])/g, ' $1').trim(),
      value: Math.abs(value),
      isPositive: value > 0,
    })) : []),
  ];

  // Sample peer comparables data (replace with actual data)
  const peerComparables = [
    { name: "Company A", revenue: 1000000, valuation: 5000000, multiple: 5 },
    { name: "Company B", revenue: 2000000, valuation: 12000000, multiple: 6 },
    { name: "Company C", revenue: 1500000, valuation: 9000000, multiple: 6 },
  ];

  // Calculate funding readiness
  const fundingReadiness = calculateFundingReadiness(data);

  return (
    <div className="space-y-6 font-sans">
      {/* Executive Summary Section */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Executive Summary</CardTitle>
            <ExportButton data={data} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <div className="space-y-2">
              <FinancialTooltip term="valuation" showExample>
                <h3 className="text-3xl font-bold text-primary">
                  {formatCurrency(data.valuation || 0)}
                </h3>
              </FinancialTooltip>
              <p className="text-sm text-muted-foreground">Enterprise Value</p>
            </div>
            <div className="space-y-2">
              <FinancialTooltip term="multiplier" showExample>
                <h3 className="text-3xl font-bold text-primary">
                  {data.multiplier?.toFixed(1)}x
                </h3>
              </FinancialTooltip>
              <p className="text-sm text-muted-foreground">Revenue Multiple</p>
            </div>
            <div className="space-y-2">
              <FinancialTooltip term="growthRate" showExample>
                <h3 className="text-3xl font-bold text-primary">
                  {data.growthRate}%
                </h3>
              </FinancialTooltip>
              <p className="text-sm text-muted-foreground">Growth Rate</p>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Methodology and Assumptions Section */}
      <Accordion type="single" collapsible className="bg-white shadow-lg rounded-lg">
        <AccordionItem value="methodology">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold">
            Methodology & Assumptions
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Valuation Approach</h4>
                <p className="text-muted-foreground">
                  The valuation is based on a combination of revenue multiples and growth-adjusted metrics,
                  considering industry standards and market conditions.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Key Assumptions</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    <FinancialTooltip term="growthRate">
                      Revenue Growth Rate: {data.growthRate}%
                    </FinancialTooltip>
                  </li>
                  <li>
                    <FinancialTooltip term="margins">
                      Operating Margins: {data.margins}%
                    </FinancialTooltip>
                  </li>
                  <li>Industry: {data.industry}</li>
                  <li>Stage: {data.stage}</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Interactive Charts Section */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="border-b">
          <CardTitle>Valuation Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Valuation Breakdown</h4>
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
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Peer Comparables Table */}
            <div>
              <h4 className="font-medium mb-4">Peer Comparables</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Valuation</TableHead>
                    <TableHead className="text-right">Multiple</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peerComparables.map((company) => (
                    <TableRow key={company.name}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(company.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(company.valuation)}
                      </TableCell>
                      <TableCell className="text-right">{company.multiple}x</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Analysis Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {data.riskAssessment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <RiskAssessment data={data.riskAssessment} />
          </motion.div>
        )}

        {data.potentialPrediction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <PotentialPredictor data={data.potentialPrediction} />
          </motion.div>
        )}
      </div>

      {/* Funding Readiness and Timeline */}
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
          currentValuation={data.valuation || 0}
        />
      </motion.div>

      {data.ecosystemNetwork && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <EcosystemNetwork data={data.ecosystemNetwork} />
        </motion.div>
      )}
    </div>
  );
}