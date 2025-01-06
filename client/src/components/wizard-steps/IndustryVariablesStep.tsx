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
import { Card, CardContent } from "@/components/ui/card";

interface IndustryVariablesStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Industry-specific metrics configuration
const industryMetrics = {
  technology: {
    saas: {
      metrics: [
        { key: "arr", label: "Annual Recurring Revenue", description: "Total value of recurring revenue normalized for one year" },
        { key: "cac", label: "Customer Acquisition Cost", description: "Average cost to acquire a new customer" },
        { key: "ltv", label: "Customer Lifetime Value", description: "Total revenue expected from a customer" },
        { key: "churnRate", label: "Churn Rate", description: "Rate at which customers stop using your product/service" },
        { key: "expansionRevenue", label: "Expansion Revenue", description: "Additional revenue from existing customers" }
      ],
      benchmarks: {
        revenueMultiple: { early: 10, growth: 15, mature: 8 },
        grossMargin: 0.75,
        growthRate: 0.5,
      }
    },
    enterprise: {
      metrics: [
        { key: "tcv", label: "Total Contract Value", description: "Total value of customer contracts" },
        { key: "bookings", label: "Bookings", description: "Total value of contracts signed" },
        { key: "backlog", label: "Backlog", description: "Value of contracted work not yet delivered" },
        { key: "dealCycle", label: "Deal Cycle", description: "Average time to close a deal (in days)" },
        { key: "contractLength", label: "Contract Length", description: "Average length of customer contracts (in months)" }
      ],
      benchmarks: {
        revenueMultiple: { early: 8, growth: 12, mature: 6 },
        grossMargin: 0.70,
        growthRate: 0.35,
      }
    }
  },
  ecommerce: {
    d2c: {
      metrics: [
        { key: "gmv", label: "Gross Merchandise Value", description: "Total value of goods sold" },
        { key: "aov", label: "Average Order Value", description: "Average revenue per transaction" },
        { key: "inventoryTurnover", label: "Inventory Turnover", description: "Rate at which inventory is sold and replaced" },
        { key: "repeatPurchaseRate", label: "Repeat Purchase Rate", description: "Percentage of customers making repeat purchases" },
        { key: "customerLifetimeValue", label: "Customer Lifetime Value", description: "Total value generated from a customer relationship" }
      ],
      benchmarks: {
        revenueMultiple: { early: 3, growth: 5, mature: 2 },
        grossMargin: 0.45,
        growthRate: 0.40,
      }
    }
  }
};

// Regional compliance standards
const regionalStandards = {
  us: {
    name: "United States",
    standards: ["409A Compliance", "GAAP Standards"],
    riskFreeRate: 0.03,
    marketRiskPremium: 0.055
  },
  india: {
    name: "India",
    standards: ["ICAI Standards", "Companies Act Compliance"],
    riskFreeRate: 0.06,
    marketRiskPremium: 0.065
  },
  europe: {
    name: "Europe",
    standards: ["IFRS Standards", "EU Regulations"],
    riskFreeRate: 0.02,
    marketRiskPremium: 0.05
  }
};

export function IndustryVariablesStep({
  data,
  onUpdate,
  onNext,
  onBack,
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
  const subsector = data.subsector || 'saas';
  const region = data.region || 'us';

  // Get metrics for selected industry
  const currentMetrics = industryMetrics[sector]?.[subsector]?.metrics || [];
  const benchmarks = industryMetrics[sector]?.[subsector]?.benchmarks;
  const regionData = regionalStandards[region];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please provide industry-specific metrics for your {sector} business in {regionData.name}.
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
                    <h4 className="text-sm font-medium mb-2">Regional Standards ({regionData.name})</h4>
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
              {currentMetrics.map((metric) => (
                <FormField
                  key={metric.key}
                  control={form.control}
                  name={`industryMetrics.${sector}.${metric.key}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{metric.label}</FormLabel>
                      <FormDescription>
                        {metric.description}
                      </FormDescription>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={`Enter your ${metric.label}`}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
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