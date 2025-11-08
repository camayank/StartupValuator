import { useState } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const regions = {
  us: {
    name: 'United States',
    currency: 'USD',
    minTAM: 1000000,
    benchmarks: {
      pre_seed: { avgValuation: 2000000, avgTeamSize: 3 },
      seed: { avgMRR: 25000, avgGrowth: 15 }
    }
  },
  india: {
    name: 'India',
    currency: 'INR',
    minTAM: 10000000,
    benchmarks: {
      pre_seed: { avgValuation: 15000000, avgTeamSize: 4 },
      seed: { avgMRR: 2000000, avgGrowth: 20 }
    }
  },
  eu: {
    name: 'European Union',
    currency: 'EUR',
    minTAM: 800000,
    benchmarks: {
      pre_seed: { avgValuation: 1700000, avgTeamSize: 3 },
      seed: { avgMRR: 20000, avgGrowth: 12 }
    }
  },
  asean: {
    name: 'ASEAN',
    currency: 'USD',
    minTAM: 500000,
    benchmarks: {
      pre_seed: { avgValuation: 1000000, avgTeamSize: 3 },
      seed: { avgMRR: 15000, avgGrowth: 18 }
    }
  },
  other: {
    name: 'Other Regions',
    currency: 'USD',
    minTAM: 500000,
    benchmarks: {
      pre_seed: { avgValuation: 1000000, avgTeamSize: 3 },
      seed: { avgMRR: 15000, avgGrowth: 15 }
    }
  }
} as const;

type Region = keyof typeof regions;

const stagesSchema = {
  pre_seed: z.object({
    tam: z.number().min(100000, "TAM must be at least $100,000"),
    team_score: z.number().min(0).max(1, "Team score must be between 0 and 1"),
    current_traction: z.number().min(0).optional(),
    team_size: z.number().min(1, "Team size must be at least 1"),
    ip_status: z.enum(['none', 'pending', 'granted']).optional(),
    market_validation: z.boolean().optional()
  }),
  seed: z.object({
    mrr: z.number().min(10000, "MRR must be at least $10,000"),
    mom_growth: z.number().min(-100).max(1000, "Growth rate must be between -100% and 1000%"),
    churn: z.number().min(0).max(100, "Churn rate must be between 0% and 100%"),
    cac: z.number().min(0, "CAC must be non-negative"),
    ltv: z.number().min(0, "LTV must be non-negative"),
    runway_months: z.number().min(0, "Runway must be non-negative")
  })
} as const;

const stages = ['pre_seed', 'seed'] as const;
type Stage = typeof stages[number];

type FormData = {
  tam?: number;
  team_score?: number;
  current_traction?: number;
  team_size?: number;
  ip_status?: 'none' | 'pending' | 'granted';
  market_validation?: boolean;
  mrr?: number;
  mom_growth?: number;
  churn?: number;
  cac?: number;
  ltv?: number;
  runway_months?: number;
};

const fieldDescriptions = {
  tam: "Total Addressable Market - The total market demand for your product/service",
  team_score: "Team's capability score based on experience, domain expertise, and track record",
  current_traction: "Current revenue, users, or other key metrics showing market validation",
  team_size: "Number of full-time team members",
  ip_status: "Status of your intellectual property protection",
  market_validation: "Have you validated your solution with real customers?",
  mrr: "Monthly Recurring Revenue from paying customers",
  mom_growth: "Month-over-Month growth rate percentage",
  churn: "Monthly customer churn rate percentage",
  cac: "Customer Acquisition Cost - Cost to acquire one customer",
  ltv: "Customer Lifetime Value - Total value of a typical customer",
  runway_months: "Number of months until you run out of cash at current burn rate"
};

const StageSteps = {
  pre_seed: ['Business Info', 'Team Details', 'Market Analysis'],
  seed: ['Revenue Metrics', 'Growth Metrics', 'Unit Economics']
};

export function StageWizard() {
  const [stage, setStage] = useState<Stage>('pre_seed');
  const [region, setRegion] = useState<Region>('us');
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(stagesSchema[stage]),
    defaultValues: {
      tam: undefined,
      team_score: undefined,
      current_traction: undefined,
      team_size: undefined,
      ip_status: undefined,
      market_validation: undefined,
      mrr: undefined,
      mom_growth: undefined,
      churn: undefined,
      cac: undefined,
      ltv: undefined,
      runway_months: undefined,
    }
  });

  const currentSteps = StageSteps[stage];
  const progress = ((step + 1) / currentSteps.length) * 100;

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stage, 
          region,
          ...data,
          currency: regions[region].currency 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit valuation data');
      }

      const result = await response.json();

      toast({
        title: "Valuation Complete",
        description: `Estimated valuation: ${regions[region].currency} ${result.valuation.toLocaleString()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process valuation",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (step < currentSteps.length - 1) {
      setStep(step + 1);
    } else {
      form.handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Startup Valuation Wizard</h2>
        <Alert className="bg-muted">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Follow our step-by-step process to calculate your startup's valuation.
            All monetary values are in {regions[region].currency}.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <Select value={region} onValueChange={(value: Region) => setRegion(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select Region" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(regions).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          {stages.map((s) => (
            <Button
              key={s}
              variant={stage === s ? "default" : "outline"}
              onClick={() => {
                setStage(s);
                setStep(0);
              }}
              className="flex-1"
            >
              {s === 'pre_seed' ? '🌱 Pre-Seed' : '🚀 Seed'}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {step + 1} of {currentSteps.length}: {currentSteps[step]}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{currentSteps[step]}</CardTitle>
              <CardDescription>
                {stage === 'pre_seed' ? 
                  "Early-stage startup valuation focuses on team, market, and potential." :
                  "Seed-stage valuation emphasizes traction, growth, and unit economics."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pre-seed stage fields */}
              {stage === 'pre_seed' && step === 0 && (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <span className="text-sm font-medium">Total Addressable Market (TAM)</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldDescriptions.tam}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Regional Benchmark: {regions[region].currency} {regions[region].benchmarks.pre_seed.avgValuation.toLocaleString()}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </label>
                    <Input
                      type="number"
                      {...form.register('tam', { valueAsNumber: true })}
                      placeholder={`Enter TAM in ${regions[region].currency}`}
                    />
                    {form.formState.errors.tam && (
                      <p className="text-sm text-destructive">{form.formState.errors.tam.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Market Validation</label>
                    <Select
                      {...form.register('market_validation')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Have you validated with customers?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {stage === 'pre_seed' && step === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <span className="text-sm font-medium">Team Score</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldDescriptions.team_score}</p>
                        </TooltipContent>
                      </Tooltip>
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      {...form.register('team_score', { valueAsNumber: true })}
                      placeholder="Enter team score (0-1)"
                    />
                    {form.formState.errors.team_score && (
                      <p className="text-sm text-destructive">{form.formState.errors.team_score.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Team Size</label>
                    <Input
                      type="number"
                      {...form.register('team_size', { valueAsNumber: true })}
                      placeholder="Number of full-time team members"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">IP Status</label>
                    <Select
                      {...form.register('ip_status')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select IP status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No IP Protection</SelectItem>
                        <SelectItem value="pending">Patent Pending</SelectItem>
                        <SelectItem value="granted">Patent Granted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {stage === 'pre_seed' && step === 2 && (
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
                </div>
              )}

              {/* Seed stage fields */}
              {stage === 'seed' && step === 0 && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <span className="text-sm font-medium">Monthly Recurring Revenue (MRR)</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{fieldDescriptions.mrr}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Regional Benchmark: {regions[region].currency} {regions[region].benchmarks.seed.avgMRR.toLocaleString()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </label>
                  <Input
                    type="number"
                    {...form.register('mrr', { valueAsNumber: true })}
                    placeholder={`Enter MRR in ${regions[region].currency}`}
                  />
                  {form.formState.errors.mrr && (
                    <p className="text-sm text-destructive">{form.formState.errors.mrr.message}</p>
                  )}
                </div>
              )}

              {stage === 'seed' && step === 1 && (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <span className="text-sm font-medium">Growth Rate (%)</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{fieldDescriptions.mom_growth}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Regional Benchmark: {regions[region].benchmarks.seed.avgGrowth}%
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </label>
                    <Input
                      type="number"
                      {...form.register('mom_growth', { valueAsNumber: true })}
                      placeholder="Enter month-over-month growth rate"
                    />
                    {form.formState.errors.mom_growth && (
                      <p className="text-sm text-destructive">{form.formState.errors.mom_growth.message}</p>
                    )}
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
                  </div>
                </>
              )}

              {stage === 'seed' && step === 2 && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Acquisition Cost (CAC)</label>
                    <Input
                      type="number"
                      {...form.register('cac', { valueAsNumber: true })}
                      placeholder={`Enter CAC in ${regions[region].currency}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Lifetime Value (LTV)</label>
                    <Input
                      type="number"
                      {...form.register('ltv', { valueAsNumber: true })}
                      placeholder={`Enter LTV in ${regions[region].currency}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Runway (months)</label>
                    <Input
                      type="number"
                      {...form.register('runway_months', { valueAsNumber: true })}
                      placeholder="Enter remaining runway in months"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              onClick={nextStep}
            >
              {step === currentSteps.length - 1 ? 'Calculate Valuation' : 'Next'}
              {step < currentSteps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </form>
      </Form>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Regional Insights</CardTitle>
          <CardDescription>
            Benchmarks for {regions[region].name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Pre-Seed Stage</h4>
              <p className="text-sm text-muted-foreground">
                Average Valuation: {regions[region].currency} {regions[region].benchmarks.pre_seed.avgValuation.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Average Team Size: {regions[region].benchmarks.pre_seed.avgTeamSize}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Seed Stage</h4>
              <p className="text-sm text-muted-foreground">
                Average MRR: {regions[region].currency} {regions[region].benchmarks.seed.avgMRR.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Average Growth: {regions[region].benchmarks.seed.avgGrowth}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StageWizard;