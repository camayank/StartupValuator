import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import type { ValuationFormData } from "@/lib/validations";
import { formatCurrency } from "@/lib/validations";
import { useState } from "react";
import { Link } from "wouter";
import { ValuationReport } from "./ValuationReport";
import { ValuationDashboard } from "./dashboards/ValuationDashboard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface ValuationResultProps {
  data: ValuationFormData | null;
}

export function ValuationResult({ data }: ValuationResultProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Check if data is valid for report generation
  const canGenerateReport = Boolean(
    data?.businessName &&
    data?.revenue !== undefined &&
    data?.revenue >= 0 &&
    data?.growthRate !== undefined &&
    data?.sector &&
    data?.industry &&
    data?.stage
  );

  const handleGenerateReport = async () => {
    if (!canGenerateReport || !data) return;

    try {
      setIsGenerating(true);
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a few moments.");
        }
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.businessName.toLowerCase().replace(/\s+/g, '-')}-valuation-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Valuation report has been generated and downloaded.",
      });

      setRetryCount(0);
    } catch (error) {
      console.error('Report generation error:', error);

      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Retrying...",
          description: `Attempt ${retryCount + 1} of ${MAX_RETRIES}`,
        });
        setTimeout(() => handleGenerateReport(), 1000 * (retryCount + 1));
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to generate report",
          variant: "destructive",
        });
        setRetryCount(0);
      }
    } finally {
      setIsGenerating(false);
    }
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
      color: "hsl(var(--primary))",
    },
    ...(data.details?.adjustments ?
      Object.entries(data.details.adjustments)
        .map(([key, value]) => ({
          name: key.replace(/([A-Z])/g, ' $1').trim(),
          value: Math.abs(Number(value)),
          color: Number(value) > 0 ? "hsl(var(--success))" : "hsl(var(--warning))",
          isPositive: Number(value) > 0,
        }))
      : []
    ),
  ];

  // Sample peer comparables data
  const peerComparables = [
    { name: "Company A", revenue: 1000000, valuation: 5000000, multiple: 5 },
    { name: "Company B", revenue: 2000000, valuation: 12000000, multiple: 6 },
    { name: "Company C", revenue: 1500000, valuation: 9000000, multiple: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Executive Summary</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2"
                  disabled={!canGenerateReport || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {retryCount > 0 ? `Retrying (${retryCount}/${MAX_RETRIES})...` : "Generating..."}
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Download Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary">
                  {formatCurrency(data.valuation || 0, data.currency || 'USD')}
                </h3>
                <p className="text-sm text-muted-foreground">Enterprise Value</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary">
                  {((data.valuation || 0) / (data.revenue || 1)).toFixed(1)}x
                </h3>
                <p className="text-sm text-muted-foreground">Revenue Multiple</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-primary">
                  {data.growthRate}%
                </h3>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Valuation Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Valuation Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tickFormatter={(value) => formatCurrency(value, data.currency || 'USD')}
                  />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, data.currency || 'USD')}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="value" fill="currentColor">
                    {breakdownData.map((entry, index) => (
                      <motion.rect
                        key={`bar-${index}`}
                        fill={entry.color}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Peer Comparables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Peer Comparables</CardTitle>
          </CardHeader>
          <CardContent>
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
                      {formatCurrency(company.revenue, data.currency || 'USD')}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(company.valuation, data.currency || 'USD')}
                    </TableCell>
                    <TableCell className="text-right">{company.multiple}x</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="methodology">
                <AccordionTrigger>Valuation Methodology</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    The valuation is based on a combination of revenue multiples,
                    growth-adjusted metrics, and market comparables. We've
                    considered industry standards, market conditions, and your
                    specific business characteristics.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="assumptions">
                <AccordionTrigger>Key Assumptions</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Revenue Growth Rate: {data.growthRate}%</li>
                    <li>Operating Margins: {data.margins}%</li>
                    <li>Industry: {data.industry}</li>
                    <li>Stage: {data.stage}</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="adjustments">
                <AccordionTrigger>Valuation Adjustments</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {breakdownData.slice(1).map((adjustment, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{adjustment.name}</span>
                        <span className={adjustment.isPositive ? "text-success" : "text-warning"}>
                          {adjustment.isPositive ? "+" : "-"}
                          {formatCurrency(adjustment.value, data.currency || 'USD')}
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <ValuationReport data={data} />
      </motion.div>
    </div>
  );
}