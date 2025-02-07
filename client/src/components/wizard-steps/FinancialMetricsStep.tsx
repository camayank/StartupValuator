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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const financialMetricsSchema = z.object({
  revenue: z.number().min(0, "Revenue must be positive"),
  expenses: z.number().min(0, "Expenses must be positive"),
  grossMargin: z.number().min(-100).max(100, "Margin must be between -100 and 100"),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100 and 1000"),
  runway: z.number().min(0, "Runway must be positive"),
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
      revenue: initialData.revenue || 0,
      expenses: initialData.expenses || 0,
      grossMargin: initialData.grossMargin || 0,
      growthRate: initialData.growthRate || 0,
      runway: initialData.runway || 0,
      burnRate: initialData.burnRate || 0,
    },
  });

  const handleSubmit = async (values: FinancialMetricsFormData) => {
    try {
      setIsSubmitting(true);
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
              name="revenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Revenue ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Expenses ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
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
                  <FormLabel>Gross Margin (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
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
                  <FormLabel>Growth Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="runway"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Runway (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
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
                  <FormLabel>Monthly Burn Rate ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
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
