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
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Info, Percent, Calculator } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";

const financialMetricsSchema = z.object({
  revenue: z.object({
    current: z.number({
      required_error: "Current revenue is required",
      invalid_type_error: "Please enter a valid number",
    }).min(0, "Revenue must be positive"),
    projected: z.number().min(0, "Projected revenue must be positive").optional(),
  }),
  expenses: z.object({
    fixed: z.number().min(0, "Fixed expenses must be positive"),
    variable: z.number().min(0, "Variable expenses must be positive"),
    rnd: z.number().min(0, "R&D expenses must be positive").optional(),
  }),
  margins: z.object({
    gross: z.number().min(-100).max(100, "Gross margin must be between -100% and 100%"),
    operating: z.number().min(-100).max(100, "Operating margin must be between -100% and 100%"),
  }),
  growth: z.object({
    historical: z.number(),
    projected: z.number(),
  }),
  metrics: z.object({
    burnRate: z.number().min(0, "Burn rate must be positive"),
    runway: z.number().min(0, "Runway must be positive"),
    cac: z.number().min(0, "CAC must be positive").optional(),
    ltv: z.number().min(0, "LTV must be positive").optional(),
  }),
});

type FinancialMetricsFormData = z.infer<typeof financialMetricsSchema>;

interface FinancialMetricsStepProps {
  onUpdate: (data: FinancialMetricsFormData) => Promise<void>;
  initialData?: Partial<FinancialMetricsFormData>;
}

export function FinancialMetricsStep({
  onUpdate,
  initialData = {},
}: FinancialMetricsStepProps) {
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FinancialMetricsFormData>({
    resolver: zodResolver(financialMetricsSchema),
    defaultValues: {
      revenue: {
        current: initialData.revenue?.current || 0,
        projected: initialData.revenue?.projected || 0,
      },
      expenses: {
        fixed: initialData.expenses?.fixed || 0,
        variable: initialData.expenses?.variable || 0,
        rnd: initialData.expenses?.rnd || 0,
      },
      margins: {
        gross: initialData.margins?.gross || 0,
        operating: initialData.margins?.operating || 0,
      },
      growth: {
        historical: initialData.growth?.historical || 0,
        projected: initialData.growth?.projected || 0,
      },
      metrics: {
        burnRate: initialData.metrics?.burnRate || 0,
        runway: initialData.metrics?.runway || 0,
        cac: initialData.metrics?.cac || 0,
        ltv: initialData.metrics?.ltv || 0,
      },
    },
  });

  const handleSubmit = async (values: FinancialMetricsFormData) => {
    try {
      setIsCalculating(true);

      // Calculate derived metrics
      const totalExpenses = values.expenses.fixed + values.expenses.variable + (values.expenses.rnd || 0);
      values.metrics.burnRate = totalExpenses / 12;

      if (values.revenue.current > 0) {
        values.metrics.runway = (values.revenue.current - totalExpenses) / values.metrics.burnRate;
      }

      await onUpdate(values);
    } catch (error) {
      console.error("Error submitting financial metrics:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Provide your key financial metrics to help us calculate an accurate valuation.
          We'll automatically calculate some derived metrics for you.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Revenue Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Revenue</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="revenue.current"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Annual Revenue</FormLabel>
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
                        placeholder="Enter current revenue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="revenue.projected"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projected Annual Revenue</FormLabel>
                    <FormDescription>
                      Expected revenue for the next 12 months
                    </FormDescription>
                    <FormControl>
                      <NumericInput
                        {...field}
                        onValueChange={field.onChange}
                        prefix="$"
                        thousandSeparator=","
                        decimalScale={0}
                        placeholder="Enter projected revenue"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Expenses Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Expenses</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="expenses.fixed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fixed Expenses</FormLabel>
                    <FormDescription>
                      Monthly fixed costs (rent, salaries, etc.)
                    </FormDescription>
                    <FormControl>
                      <NumericInput
                        {...field}
                        onValueChange={field.onChange}
                        prefix="$"
                        thousandSeparator=","
                        decimalScale={0}
                        placeholder="Enter fixed expenses"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expenses.variable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variable Expenses</FormLabel>
                    <FormDescription>
                      Monthly variable costs (materials, commissions, etc.)
                    </FormDescription>
                    <FormControl>
                      <NumericInput
                        {...field}
                        onValueChange={field.onChange}
                        prefix="$"
                        thousandSeparator=","
                        decimalScale={0}
                        placeholder="Enter variable expenses"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          {/* Growth & Metrics Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Growth & Metrics</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="growth.historical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Growth Rate</FormLabel>
                    <FormDescription>
                      Past 12 months growth rate
                    </FormDescription>
                    <FormControl>
                      <NumericInput
                        {...field}
                        onValueChange={field.onChange}
                        suffix="%"
                        decimalScale={1}
                        allowNegative
                        placeholder="Enter historical growth"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="growth.projected"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projected Growth Rate</FormLabel>
                    <FormDescription>
                      Expected annual growth rate
                    </FormDescription>
                    <FormControl>
                      <NumericInput
                        {...field}
                        onValueChange={field.onChange}
                        suffix="%"
                        decimalScale={1}
                        allowNegative
                        placeholder="Enter projected growth"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isCalculating}>
              {isCalculating ? "Calculating..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default FinancialMetricsStep;