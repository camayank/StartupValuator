import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Building2, TrendingUp, Globe2, DollarSign } from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { getIndustryMetrics } from "@/lib/services/openai";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface IndustryMetricsStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function IndustryMetricsStep({
  data,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: IndustryMetricsStepProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Partial<ValuationFormData>>({
    defaultValues: {
      ...data,
      industryMetrics: data.industryMetrics || {},
    },
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!data.sector || !data.industry || !data.region) {
        setError("Please complete the business information step first with sector, industry, and region.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const metricsData = await getIndustryMetrics(
          data.sector,
          data.industry,
          data.region
        );

        if (!metricsData) {
          throw new Error("Failed to fetch industry metrics");
        }

        setMetrics(metricsData);
        form.reset({
          ...data,
          industryMetrics: {
            ...data.industryMetrics,
            ...metricsData.metrics,
          },
        });
      } catch (error: any) {
        console.error("Error fetching metrics:", error);
        setError(error.message || "Failed to fetch industry metrics");
        toast({
          title: "Error",
          description: "Failed to fetch industry metrics. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [data.sector, data.industry, data.region]);

  const handleSubmit = async (values: Partial<ValuationFormData>) => {
    if (!metrics) {
      toast({
        title: "Error",
        description: "Please wait for metrics to load before proceeding",
        variant: "destructive",
      });
      return;
    }

    onUpdate(values);
    onNext();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 bg-background min-h-screen md:min-h-0">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-2 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 bg-background min-h-screen md:min-h-0">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={onBack} className="w-full">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 bg-background min-h-screen md:min-h-0"
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">Industry Metrics</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Based on your selection of {data.sector} ({data.industry}) in {data.region}, 
          we've calculated the following metrics and market size information.
        </AlertDescription>
      </Alert>

      {metrics && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5" />
              Market Size Analysis
            </CardTitle>
            <CardDescription>
              Total Addressable Market (TAM) and market metrics for your industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  ${(metrics.tam / 1000000000).toFixed(2)}B
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Addressable Market
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {metrics && Object.entries(metrics.benchmarks).map(([key, benchmark]: [string, any]) => (
              <FormField
                key={key}
                control={form.control}
                name={`industryMetrics.${key}`}
                render={({ field }) => (
                  <FormItem className="bg-card p-4 rounded-lg">
                    <FormLabel>{key.split(/(?=[A-Z])|_/).map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(" ")}</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Low: {benchmark.low}</span>
                            <span>Median: {benchmark.median}</span>
                            <span>High: {benchmark.high}</span>
                          </div>
                          <Progress 
                            value={((field.value || benchmark.median) - benchmark.low) / 
                              (benchmark.high - benchmark.low) * 100} 
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Industry benchmark: {benchmark.median} (median)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button variant="outline" onClick={onBack} type="button">
              Back
            </Button>
            <Button type="submit" disabled={!metrics}>
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}