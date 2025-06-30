import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useValuation } from '@/hooks/useValuation';
import { Loader2 } from 'lucide-react';

const marketAnalysisSchema = z.object({
  marketSize: z.number().min(0, 'Market size cannot be negative'),
  targetMarket: z.string().min(1, 'Target market description is required'),
  competitors: z.number().min(0, 'Number of competitors cannot be negative'),
});

type MarketAnalysisData = z.infer<typeof marketAnalysisSchema>;

interface MarketAnalysisFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function MarketAnalysisForm({ onNext, onBack }: MarketAnalysisFormProps) {
  const { updateData, isLoading } = useValuation();

  const form = useForm<MarketAnalysisData>({
    resolver: zodResolver(marketAnalysisSchema),
    defaultValues: {
      marketSize: 0,
      targetMarket: '',
      competitors: 0,
    },
  });

  const onSubmit = async (data: MarketAnalysisData) => {
    try {
      updateData('marketAnalysis', data);
      onNext();
    } catch (error) {
      console.error('Failed to update market analysis:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Analysis</CardTitle>
        <CardDescription>
          Help us understand your market opportunity and competitive landscape
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="marketSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Addressable Market (TAM) in USD</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter total addressable market size"
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
              name="targetMarket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Market Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your target market and customer segments"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competitors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Direct Competitors</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Enter number of direct competitors"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                Calculate Valuation
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}