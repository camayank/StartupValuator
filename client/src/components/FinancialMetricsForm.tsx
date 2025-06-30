import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useValuation } from '@/hooks/useValuation';
import { Loader2 } from 'lucide-react';

const financialMetricsSchema = z.object({
  revenue: z.number().min(0, 'Revenue cannot be negative'),
  growth: z.number().min(-100).max(1000, 'Growth rate must be between -100% and 1000%'),
  expenses: z.number().min(0, 'Expenses cannot be negative'),
  runway: z.number().min(0, 'Runway cannot be negative'),
});

type FinancialMetricsData = z.infer<typeof financialMetricsSchema>;

interface FinancialMetricsFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function FinancialMetricsForm({ onNext, onBack }: FinancialMetricsFormProps) {
  const { updateData, isLoading } = useValuation();

  const form = useForm<FinancialMetricsData>({
    resolver: zodResolver(financialMetricsSchema),
    defaultValues: {
      revenue: 0,
      growth: 0,
      expenses: 0,
      runway: 12,
    },
  });

  const onSubmit = async (data: FinancialMetricsData) => {
    try {
      updateData('financialMetrics', data);
      onNext();
    } catch (error) {
      console.error('Failed to update financial metrics:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Metrics</CardTitle>
        <CardDescription>
          Provide your key financial information for accurate valuation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="revenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Revenue (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter annual revenue"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="growth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Growth Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="-100"
                      max="1000"
                      placeholder="Enter monthly growth rate"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <FormLabel>Monthly Expenses (USD)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter monthly expenses"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <FormLabel>Runway (Months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter runway in months"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue to Market Analysis
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}