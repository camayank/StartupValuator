import { useState } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ValuationPDFDocument, generateValuationPDF } from '@/lib/services/pdf-export';

const stagesSchema = {
  pre_seed: z.object({
    tam: z.number().min(100000, "TAM must be at least $100,000"),
    team_score: z.number().min(1, "Team score must be at least 1"),
  }),
  seed: z.object({
    revenue: z.number().optional(),
    churn_rate: z.number().min(0).max(100).optional(),
    growth_rate: z.number().min(-100).max(1000).optional(),
  })
};

const stages = ['pre_seed', 'seed'] as const;
type Stage = typeof stages[number];

const fieldDescriptions = {
  tam: "Total Addressable Market - The total market demand for your product or service",
  team_score: "A measure of your team's experience and capability",
  revenue: "Current monthly or annual revenue",
  churn_rate: "The rate at which customers stop using your product",
  growth_rate: "Your month-over-month or year-over-year growth rate"
};

export function StageWizard() {
  const [stage, setStage] = useState<Stage>('pre_seed');
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(stagesSchema[stage]),
    defaultValues: {
      tam: 0,
      team_score: 0,
      revenue: 0,
      churn_rate: 0,
      growth_rate: 0,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      console.log('Form data:', data);

      // Generate valuation report
      const report = generateValuationPDF(data);

      toast({
        title: "Success",
        description: "Data submitted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Valuation Stage Wizard</h2>
        <div className="flex gap-2 mb-4">
          {stages.map((s) => (
            <Button
              key={s}
              variant={stage === s ? "default" : "outline"}
              onClick={() => setStage(s)}
            >
              {s.replace('_', ' ').toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {stage === 'pre_seed' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Total Addressable Market (TAM)
                </label>
                <Input
                  type="number"
                  {...form.register('tam', { valueAsNumber: true })}
                  placeholder="Enter TAM in USD"
                />
                {form.formState.errors.tam && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.tam.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {fieldDescriptions.tam}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Team Score
                </label>
                <Input
                  type="number"
                  {...form.register('team_score', { valueAsNumber: true })}
                  placeholder="Enter team score (1-10)"
                />
                {form.formState.errors.team_score && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.team_score.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {fieldDescriptions.team_score}
                </p>
              </div>
            </>
          )}

          {stage === 'seed' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Current Revenue
                </label>
                <Input
                  type="number"
                  {...form.register('revenue', { valueAsNumber: true })}
                  placeholder="Enter current revenue"
                />
                {form.formState.errors.revenue && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.revenue.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {fieldDescriptions.revenue}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Churn Rate (%)
                </label>
                <Input
                  type="number"
                  {...form.register('churn_rate', { valueAsNumber: true })}
                  placeholder="Enter churn rate"
                />
                {form.formState.errors.churn_rate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.churn_rate.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {fieldDescriptions.churn_rate}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Growth Rate (%)
                </label>
                <Input
                  type="number"
                  {...form.register('growth_rate', { valueAsNumber: true })}
                  placeholder="Enter growth rate"
                />
                {form.formState.errors.growth_rate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.growth_rate.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {fieldDescriptions.growth_rate}
                </p>
              </div>
            </>
          )}

          <div className="pt-4">
            <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
              Submit
            </Button>
          </div>
        </form>
      </Form>

      <div className="flex justify-between mt-6">

        {form.formState.isSubmitSuccessful && (
          <PDFDownloadLink
            document={<ValuationPDFDocument data={form.getValues()} />}
            fileName="valuation-report.pdf"
          >
            {({ loading }) => (
              <Button variant="outline" disabled={loading}>
                {loading ? 'Generating PDF...' : 'Download Report'}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </div>

      <div className="mt-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold mb-2">Real-time Preview</h3>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(form.watch(), null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default StageWizard;