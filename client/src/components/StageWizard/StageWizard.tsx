import { useState } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

const stagesSchema = {
  pre_seed: z.object({
    tam: z.number().min(100000, "TAM must be at least $100,000"),
    team_score: z.number().min(0).max(1, "Team score must be between 0 and 1"),
    current_traction: z.number().min(0).optional(),
  }),
  seed: z.object({
    mrr: z.number().min(10000, "MRR must be at least $10,000"),
    mom_growth: z.number().min(-100).max(1000, "Growth rate must be between -100% and 1000%"),
    churn: z.number().min(0).max(100, "Churn rate must be between 0% and 100%"),
  })
} as const;

const stages = ['pre_seed', 'seed'] as const;
type Stage = typeof stages[number];

type FormData = {
  tam?: number;
  team_score?: number;
  current_traction?: number;
  mrr?: number;
  mom_growth?: number;
  churn?: number;
};

const fieldDescriptions = {
  tam: "Total Addressable Market - The total market demand for your product or service",
  team_score: "A measure of your team's experience and capability (0-1)",
  current_traction: "Current revenue or user base metrics",
  mrr: "Monthly Recurring Revenue",
  mom_growth: "Month-over-Month growth rate in percentage",
  churn: "Monthly customer churn rate in percentage"
};

export function StageWizard() {
  const [stage, setStage] = useState<Stage>('pre_seed');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(stagesSchema[stage]),
    defaultValues: {
      tam: undefined,
      team_score: undefined,
      current_traction: undefined,
      mrr: undefined,
      mom_growth: undefined,
      churn: undefined,
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, ...data })
      });

      if (!response.ok) {
        throw new Error('Failed to submit valuation data');
      }

      const result = await response.json();

      toast({
        title: "Valuation Complete",
        description: `Estimated valuation: $${result.valuation.toLocaleString()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process valuation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Startup Valuation Wizard</h2>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select your startup stage and provide the required information for an accurate valuation.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex gap-4 mb-8">
        {stages.map((s) => (
          <Button
            key={s}
            variant={stage === s ? "default" : "outline"}
            onClick={() => setStage(s)}
            className="flex-1"
          >
            {s === 'pre_seed' ? '🌱 Pre-Seed' : '🚀 Seed'}
          </Button>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{stage === 'pre_seed' ? 'Pre-Seed Stage Metrics' : 'Seed Stage Metrics'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stage === 'pre_seed' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Addressable Market (TAM)</label>
                    <Input
                      type="number"
                      {...form.register('tam', { valueAsNumber: true })}
                      placeholder="Enter TAM in USD"
                    />
                    {form.formState.errors.tam && (
                      <p className="text-sm text-destructive">{form.formState.errors.tam.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{fieldDescriptions.tam}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Team Score</label>
                    <Input
                      type="number"
                      step="0.1"
                      {...form.register('team_score', { valueAsNumber: true })}
                      placeholder="Enter team score (0-1)"
                    />
                    {form.formState.errors.team_score && (
                      <p className="text-sm text-destructive">{form.formState.errors.team_score.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{fieldDescriptions.team_score}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Traction</label>
                    <Input
                      type="number"
                      {...form.register('current_traction', { valueAsNumber: true })}
                      placeholder="Enter current traction metrics"
                    />
                    {form.formState.errors.current_traction && (
                      <p className="text-sm text-destructive">{form.formState.errors.current_traction.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{fieldDescriptions.current_traction}</p>
                  </div>
                </>
              )}

              {stage === 'seed' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Recurring Revenue (MRR)</label>
                    <Input
                      type="number"
                      {...form.register('mrr', { valueAsNumber: true })}
                      placeholder="Enter MRR in USD"
                    />
                    {form.formState.errors.mrr && (
                      <p className="text-sm text-destructive">{form.formState.errors.mrr.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{fieldDescriptions.mrr}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Growth Rate (%)</label>
                    <Input
                      type="number"
                      {...form.register('mom_growth', { valueAsNumber: true })}
                      placeholder="Enter month-over-month growth rate"
                    />
                    {form.formState.errors.mom_growth && (
                      <p className="text-sm text-destructive">{form.formState.errors.mom_growth.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{fieldDescriptions.mom_growth}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Churn Rate (%)</label>
                    <Input
                      type="number"
                      {...form.register('churn', { valueAsNumber: true })}
                      placeholder="Enter monthly churn rate"
                    />
                    {form.formState.errors.churn && (
                      <p className="text-sm text-destructive">{form.formState.errors.churn.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{fieldDescriptions.churn}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button type="submit">Calculate Valuation</Button>
          </div>
        </form>
      </Form>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Real-time Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
            {JSON.stringify(form.watch(), null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export default StageWizard;