import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import type { ValuationFormData } from "@/lib/validations";
import { sectors } from "@/lib/validations";
import { Card, CardContent } from "@/components/ui/card";
import { regions } from "@/lib/regions"; // Import regions data


interface IndustryVariablesStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function IndustryVariablesStep({
  data,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: IndustryVariablesStepProps) {
  const form = useForm<Partial<ValuationFormData>>({
    defaultValues: {
      industryMetrics: data.industryMetrics || {},
      ...data,
    },
  });

  const handleSubmit = (values: Partial<ValuationFormData>) => {
    onUpdate(values);
    onNext();
  };

  const sector = data.sector || 'technology';
  const subsector = data.subsector;
  const region = data.region || 'us';

  // Get the metrics for the selected sector and subsector
  const currentMetrics = subsector && sectors[sector]?.subsectors[subsector]?.metrics || [];
  const benchmarks = subsector && sectors[sector]?.subsectors[subsector]?.benchmarks;

  // Get region-specific adjustments
  const regionData = regions[region as keyof typeof regions];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please provide industry-specific metrics for your {sectors[sector].name} business in {regionData.name}.
          These metrics are adjusted based on regional standards and will help us calculate a more accurate valuation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Industry Benchmarks</h3>
              {benchmarks && (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Revenue Multiple (Early):</span>
                      <span className="ml-2">{benchmarks.revenueMultiple.early}x</span>
                    </div>
                    <div>
                      <span className="font-medium">Revenue Multiple (Growth):</span>
                      <span className="ml-2">{benchmarks.revenueMultiple.growth}x</span>
                    </div>
                    <div>
                      <span className="font-medium">Gross Margin:</span>
                      <span className="ml-2">{(benchmarks.grossMargin * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="font-medium">Growth Rate:</span>
                      <span className="ml-2">{(benchmarks.growthRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Regional Adjustments ({regionData.name})</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Risk-Free Rate:</span>
                        <span className="ml-2">{(regionData.riskFreeRate * 100).toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Market Risk Premium:</span>
                        <span className="ml-2">{(regionData.marketRiskPremium * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-6">
              {currentMetrics?.map((metric: string) => (
                <FormField
                  key={metric}
                  control={form.control}
                  name={`industryMetrics.${sector}.${metric}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{formatMetricLabel(metric)}</FormLabel>
                      <FormDescription>
                        {getMetricDescription(metric)}
                      </FormDescription>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={`Enter your ${formatMetricLabel(metric)}`}
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
              >
                Back
              </Button>
              <Button type="submit">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}

function formatMetricLabel(metric: string): string {
  return metric
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getMetricDescription(metric: string): string {
  const descriptions: Record<string, string> = {
    arr: "Annual Recurring Revenue - Total value of recurring revenue normalized for one year",
    mrr: "Monthly Recurring Revenue - Predictable revenue generated each month",
    cac: "Customer Acquisition Cost - Average cost to acquire a new customer",
    ltv: "Customer Lifetime Value - Total revenue expected from a customer",
    churnRate: "Rate at which customers stop using your product/service",
    expansionRevenue: "Additional revenue from existing customers",
    gmv: "Gross Merchandise Value - Total value of goods sold",
    aov: "Average Order Value - Average revenue per transaction",
    inventoryTurnover: "Rate at which inventory is sold and replaced",
    repeatPurchaseRate: "Percentage of customers making repeat purchases",
    customerLifetimeValue: "Total value generated from a customer relationship",
    tcv: "Total Contract Value - Total value of a customer contract",
    bookings: "Total value of contracts signed",
    backlog: "Value of contracted work not yet delivered",
    dealCycle: "Average time to close a deal (in days)",
    contractLength: "Average length of customer contracts (in months)",
    userGrowth: "Monthly user growth rate",
    engagementRate: "User engagement metrics",
    capex: "Capital expenditure as % of revenue",
    r_and_d: "Research and development spend as % of revenue",
    patentPortfolio: "Number of patents/pending applications",
    customerRetention: "Customer retention rate",
    contentCosts: "Content acquisition/production costs",
    engagement: "User engagement metrics",
    subscribers: "Number of active subscribers",
    usage: "Platform usage metrics",
    serverCosts: "Infrastructure costs per user",
    uptime: "Service availability percentage",
  };

  return descriptions[metric] || `Value for ${formatMetricLabel(metric)}`;
}