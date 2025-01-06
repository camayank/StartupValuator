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
  const currentMetrics = subsector ? sectors[sector].subsectors[subsector]?.metrics : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please provide industry-specific metrics for your {sectors[sector].name} business.
          These metrics help us calculate a more accurate valuation based on your sector's standards.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6">
            {currentMetrics?.map((metric) => (
              <FormField
                key={metric}
                control={form.control}
                name={`industryMetrics.${sector}.${metric}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{metric.toUpperCase()}</FormLabel>
                    <FormDescription>
                      {getMetricDescription(metric)}
                    </FormDescription>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Enter your ${metric}`}
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
    </motion.div>
  );
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
  };

  return descriptions[metric] || `Value for ${metric}`;
}
