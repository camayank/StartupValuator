import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Lightbulb, 
  HelpCircle,
  Sparkles,
  Target
} from 'lucide-react';

interface SmartFormValidationProps {
  industry: string;
  stage: string;
  region: string;
  onDataChange?: (data: any) => void;
}

interface SmartSuggestion {
  field: string;
  value: number | string;
  reason: string;
  confidence: number;
  source: string;
}

const getIndustryValidationSchema = (industry: string, stage: string) => {
  const baseSchema = {
    revenue: z.number().min(0, "Revenue must be positive"),
    employees: z.number().int().min(1, "Must have at least 1 employee"),
    burnRate: z.number().min(0, "Burn rate must be positive"),
    marketSize: z.number().min(1000000, "Market size seems too small"),
  };

  const industryRules = {
    technology: {
      revenue: stage === 'pre-seed' 
        ? z.number().min(0).max(100000, "Pre-seed tech startups typically have <$100K revenue")
        : z.number().min(10000, "Tech startups usually have some revenue at this stage"),
      employees: stage === 'pre-seed'
        ? z.number().int().min(1).max(10, "Pre-seed teams are typically 2-8 people")
        : z.number().int().min(5, "Growing tech teams need more developers"),
      burnRate: z.number().min(10000).max(200000, "Tech startup burn rates typically $10K-200K/month"),
    },
    healthcare: {
      revenue: z.number().min(0),
      employees: z.number().int().min(3, "Healthcare startups need regulatory expertise"),
      burnRate: z.number().min(20000, "Healthcare development requires higher burn"),
      marketSize: z.number().min(10000000, "Healthcare markets are typically larger"),
    }
  };

  return z.object({
    ...baseSchema,
    ...(industryRules[industry as keyof typeof industryRules] || baseSchema)
  });
};

const getIndustryBenchmarks = (industry: string, stage: string) => {
  const benchmarks = {
    technology: {
      'pre-seed': {
        revenue: { min: 0, max: 50000, suggested: 10000 },
        employees: { min: 2, max: 8, suggested: 4 },
        burnRate: { min: 5000, max: 50000, suggested: 20000 },
        marketSize: { min: 100000000, suggested: 500000000 }
      },
      'seed': {
        revenue: { min: 10000, max: 500000, suggested: 100000 },
        employees: { min: 5, max: 20, suggested: 12 },
        burnRate: { min: 20000, max: 100000, suggested: 50000 },
        marketSize: { min: 500000000, suggested: 1000000000 }
      }
    }
  };

  return benchmarks[industry as keyof typeof benchmarks]?.[stage as keyof typeof benchmarks.technology] || benchmarks.technology['pre-seed'];
};

export function SmartFormValidation({ industry, stage, region, onDataChange }: SmartFormValidationProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [completionScore, setCompletionScore] = useState(0);
  const [benchmarkData, setBenchmarkData] = useState<any>({});

  const schema = getIndustryValidationSchema(industry, stage);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      revenue: 0,
      employees: 1,
      burnRate: 0,
      marketSize: 0,
    },
    mode: 'onChange'
  });

  const { watch, formState: { errors } } = form;
  const watchedValues = watch();

  useEffect(() => {
    const benchmarks = getIndustryBenchmarks(industry, stage);
    setBenchmarkData(benchmarks);
    generateSmartSuggestions(watchedValues, benchmarks);
    calculateCompletionScore(watchedValues, benchmarks);
  }, [industry, stage, watchedValues]);

  const generateSmartSuggestions = (values: any, benchmarks: any) => {
    const newSuggestions: SmartSuggestion[] = [];

    if (values.revenue < benchmarks.revenue.suggested) {
      newSuggestions.push({
        field: 'revenue',
        value: benchmarks.revenue.suggested,
        reason: `${industry} ${stage} startups typically have ~$${benchmarks.revenue.suggested.toLocaleString()} monthly revenue`,
        confidence: 85,
        source: 'Industry Benchmarks'
      });
    }

    if (values.employees < benchmarks.employees.suggested) {
      newSuggestions.push({
        field: 'employees',
        value: benchmarks.employees.suggested,
        reason: `Optimal team size for ${stage} ${industry} startups is around ${benchmarks.employees.suggested} people`,
        confidence: 90,
        source: 'Stage Analysis'
      });
    }

    setSuggestions(newSuggestions);
  };

  const calculateCompletionScore = (values: any, benchmarks: any) => {
    let score = 0;
    
    if (values.revenue >= benchmarks.revenue.min) score += 25;
    if (values.employees >= benchmarks.employees.min && values.employees <= benchmarks.employees.max) score += 25;
    if (values.burnRate >= benchmarks.burnRate.min) score += 25;
    if (values.marketSize >= benchmarks.marketSize.min) score += 25;

    setCompletionScore(score);
  };

  const applySuggestion = (suggestion: SmartSuggestion) => {
    form.setValue(suggestion.field as keyof typeof watchedValues, suggestion.value as any);
  };

  const getFieldStatus = (fieldName: string) => {
    if (errors[fieldName as keyof typeof errors]) return 'error';
    
    const benchmark = benchmarkData[fieldName];
    const value = watchedValues[fieldName as keyof typeof watchedValues];
    
    if (!benchmark || !value) return 'incomplete';
    
    if (value >= benchmark.min && value <= (benchmark.max || Infinity)) {
      return value >= benchmark.suggested ? 'excellent' : 'good';
    }
    
    return 'warning';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'border-green-200 bg-green-50';
      case 'good': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Data Quality Score
            </CardTitle>
            <Badge variant={completionScore >= 75 ? 'default' : 'secondary'}>
              {completionScore}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionScore} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">
            {completionScore >= 75 
              ? 'Your data looks great for accurate valuation' 
              : 'Complete more fields for better accuracy'}
          </p>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <Alert key={index} className="border-blue-200 bg-blue-50">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium mb-1">
                        {suggestion.field}: {typeof suggestion.value === 'number' 
                          ? suggestion.value.toLocaleString() 
                          : suggestion.value}
                      </p>
                      <p className="text-sm">{suggestion.reason}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.confidence}% confidence
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.source}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      Apply
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={getStatusColor(getFieldStatus('revenue'))}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    Monthly Revenue
                    {getStatusIcon(getFieldStatus('revenue'))}
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Benchmark: ${benchmarkData.revenue?.suggested?.toLocaleString() || 'N/A'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className={getStatusColor(getFieldStatus('employees'))}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    Team Size
                    {getStatusIcon(getFieldStatus('employees'))}
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Benchmark: {benchmarkData.employees?.suggested || 'N/A'} people</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}