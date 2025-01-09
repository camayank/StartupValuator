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
import { Info, Building2, TrendingUp, Globe2, DollarSign, AlertCircle } from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { getIndustryMetrics } from "@/lib/services/openai";
import { useToast } from "@/hooks/use-toast";
import { MarketAnalyzer } from "@/components/MarketAnalyzer";
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
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showAnalyzer, setShowAnalyzer] = useState(false);

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
        setShowAnalyzer(true);

        const metricsData = await getIndustryMetrics(
          data.sector,
          data.industry,
          data.region
        );

        if (!metricsData || !metricsData.benchmarks || Object.keys(metricsData.benchmarks).length === 0) {
          throw new Error("No metrics available for the selected industry");
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
        setShowAnalyzer(false);
      }
    };

    fetchMetrics();
  }, [data.sector, data.industry, data.region, retryCount]);

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

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (showAnalyzer) {
    return (
      <div className="space-y-6 p-4 bg-background min-h-[calc(100vh-4rem)] md:min-h-0">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">Industry Analysis</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Based on your selection of {data.sector} ({data.industry}) in {data.region},
            we're analyzing the market. Please wait...
          </AlertDescription>
        </Alert>
        <MarketAnalyzer
          sector={data.sector!}
          industry={data.industry!}
          region={data.region!}
          onAnalysisComplete={(analysisData) => {
            setMetrics(analysisData);
          }}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 bg-background min-h-[calc(100vh-4rem)] md:min-h-0">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 bg-background min-h-[calc(100vh-4rem)] md:min-h-0">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            Go Back
          </Button>
          <Button onClick={handleRetry} className="w-full sm:w-auto">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 bg-background min-h-[calc(100vh-4rem)] md:min-h-0"
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">Industry Metrics</span>
        </div>
        <Progress
          value={(currentStep / totalSteps) * 100}
          className="h-2"
        />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Based on your selection of {data.sector} ({data.industry}) in {data.region},
          we've calculated the following metrics and market size information.
        </AlertDescription>
      </Alert>

      <AnimatePresence>
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5" />
                  Market Size Analysis
                </CardTitle>
                <CardDescription>
                  Total Addressable Market (TAM) and key metrics for your industry
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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {metrics && Object.entries(metrics.benchmarks).map(([key, benchmark]: [string, any]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <FormField
                        control={form.control}
                        name={`industryMetrics.${key}`}
                        render={({ field }) => (
                          <FormItem className="bg-card p-4 rounded-lg">
                            <FormLabel className="text-base">{key.split(/(?=[A-Z])|_/).map(word =>
                              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            ).join(" ")}</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="text-right"
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
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
                  <Button variant="outline" onClick={onBack} type="button" className="w-full sm:w-auto">
                    Back
                  </Button>
                  <Button type="submit" disabled={!metrics} className="w-full sm:w-auto">
                    Continue
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}