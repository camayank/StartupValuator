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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, TrendingUp, Info } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";

// Schema with helpful error messages
const financialMetricsSchema = z.object({
  annualRevenue: z.number({
    required_error: "Annual revenue is required",
    invalid_type_error: "Please enter a valid number",
  }).min(0, "Revenue must be positive"),

  annualExpenses: z.number({
    required_error: "Annual expenses are required",
    invalid_type_error: "Please enter a valid number",
  }).min(0, "Expenses must be positive"),

  burnRate: z.number({
    required_error: "Monthly burn rate is required",
    invalid_type_error: "Please enter a valid number",
  }).min(0, "Burn rate must be positive"),

  growthRate: z.number({
    required_error: "Growth rate is required",
    invalid_type_error: "Please enter a valid number",
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FinancialMetricsFormData>({
    resolver: zodResolver(financialMetricsSchema),
    defaultValues: {
      annualRevenue: initialData.annualRevenue || 0,
      annualExpenses: initialData.annualExpenses || 0,
      burnRate: initialData.burnRate || 0,
      growthRate: initialData.growthRate || 0,
    },
  });

  const handleSubmit = async (values: FinancialMetricsFormData) => {
    try {
      setIsSubmitting(true);
      // Calculate burn rate if not provided
      if (!values.burnRate && values.annualExpenses) {
        values.burnRate = values.annualExpenses / 12;
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
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Enter your company's financial metrics. These numbers help us calculate an accurate valuation.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid gap-6">
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
                      className="text-lg"
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
                      className="text-lg"
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
                    Average monthly cash spent (expenses minus revenue)
                  </FormDescription>
                  <FormControl>
                    <NumericInput
                      {...field}
                      onValueChange={field.onChange}
                      prefix="$"
                      thousandSeparator=","
                      decimalScale={0}
                      placeholder="Enter monthly burn rate"
                      className="text-lg"
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
                    Growth Rate (%)
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
                      className="text-lg"
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