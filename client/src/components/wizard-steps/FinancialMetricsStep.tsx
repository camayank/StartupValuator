import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, DollarSign, TrendingUp, Percent } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";

const financialMetricsSchema = z.object({
  annualRevenue: z.number().min(0, "Revenue must be positive"),
  annualExpenses: z.number().min(0, "Expenses must be positive"),
  grossMargin: z.number().min(-100).max(100, "Margin must be between -100 and 100"),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100 and 1000"),
  runwayMonths: z.number().min(0, "Runway must be positive"),
  burnRate: z.number().min(0, "Burn rate must be positive"),
});

type FinancialMetricsFormData = z.infer<typeof financialMetricsSchema>;

interface FinancialMetricsStepProps {
  onUpdate: (data: FinancialMetricsFormData) => Promise<void>;
  initialData?: Partial<FinancialMetricsFormData>;
  aiAnalysis?: any;
}

export function FinancialMetricsStep({
  onUpdate,
  initialData = {},
  aiAnalysis
}: FinancialMetricsStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FinancialMetricsFormData>({
    resolver: zodResolver(financialMetricsSchema),
    defaultValues: {
      annualRevenue: initialData.annualRevenue || 0,
      annualExpenses: initialData.annualExpenses || 0,
      grossMargin: initialData.grossMargin || 0,
      growthRate: initialData.growthRate || 0,
      runwayMonths: initialData.runwayMonths || 0,
      burnRate: initialData.burnRate || 0,
    },
  });

  const handleSubmit = async (values: FinancialMetricsFormData) => {
    try {
      setIsSubmitting(true);
      // Calculate burn rate if not provided
      if (!values.burnRate && values.annualExpenses) {
        values.burnRate = values.annualExpenses / 12;
      }
      // Calculate runway if not provided
      if (!values.runwayMonths && values.annualRevenue && values.burnRate) {
        values.runwayMonths = (values.annualRevenue / 12) / values.burnRate;
      }
      await onUpdate(values);
    } catch (error) {
      console.error('Error submitting financial metrics:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {aiAnalysis && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{aiAnalysis.feedback}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="annualRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Annual Revenue
                  </FormLabel>
                  <FormDescription>
                    Total revenue for the last 12 months
                  </FormDescription>
                  <FormControl>
                    <NumericInput
                      {...field}
                      onValueChange={field.onChange}
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={0}
                      placeholder="Enter annual revenue"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annualExpenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Annual Expenses
                  </FormLabel>
                  <FormDescription>
                    Total expenses for the last 12 months
                  </FormDescription>
                  <FormControl>
                    <NumericInput
                      {...field}
                      onValueChange={field.onChange}
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={0}
                      placeholder="Enter annual expenses"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grossMargin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Gross Margin
                  </FormLabel>
                  <FormDescription>
                    Gross profit as a percentage of revenue
                  </FormDescription>
                  <FormControl>
                    <NumericInput
                      {...field}
                      onValueChange={field.onChange}
                      suffix="%"
                      decimalScale={1}
                      allowNegative
                      placeholder="Enter gross margin"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="growthRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Growth Rate
                  </FormLabel>
                  <FormDescription>
                    Year-over-year revenue growth rate
                  </FormDescription>
                  <FormControl>
                    <NumericInput
                      {...field}
                      onValueChange={field.onChange}
                      suffix="%"
                      decimalScale={1}
                      allowNegative
                      placeholder="Enter growth rate"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="burnRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Monthly Burn Rate
                  </FormLabel>
                  <FormDescription>
                    Net monthly cash outflow
                  </FormDescription>
                  <FormControl>
                    <NumericInput
                      {...field}
                      onValueChange={field.onChange}
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={0}
                      placeholder="Enter monthly burn rate"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="runwayMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Runway (months)</FormLabel>
                  <FormDescription>
                    Months of operation at current burn rate
                  </FormDescription>
                  <FormControl>
                    <NumericInput
                      {...field}
                      onValueChange={field.onChange}
                      decimalScale={1}
                      min={0}
                      placeholder="Enter runway in months"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default FinancialMetricsStep;