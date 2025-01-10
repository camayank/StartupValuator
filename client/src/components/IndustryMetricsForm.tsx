import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { industryMetrics, industryMetricsSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/validations";

interface IndustryMetricsFormProps {
  sector: string;
  industry: string;
  onMetricsUpdate: (metrics: any) => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function IndustryMetricsForm({ 
  sector, 
  industry, 
  onMetricsUpdate, 
  onNext,
  currentStep,
  totalSteps 
}: IndustryMetricsFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Determine which metrics to show based on the sector/industry
  const getIndustryMetrics = () => {
    // Map the sector to the corresponding metrics
    const sectorMapping: Record<string, keyof typeof industryMetrics> = {
      technology: "saas",
      fintech: "fintech",
      enterprise: "saas",
      ecommerce: "ecommerce",
      healthtech: "healthcare",
      industrial_tech: "manufacturing"
    };

    return industryMetrics[sectorMapping[sector] || "saas"];
  };

  const selectedMetrics = getIndustryMetrics();

  const form = useForm({
    resolver: zodResolver(industryMetricsSchema),
    defaultValues: {
      tam: 0,
      metrics: {},
      benchmarks: {},
      industrySpecificMetrics: {}
    },
  });

  const onSubmit = (data: any) => {
    onMetricsUpdate(data);
    onNext();
  };

  if (!selectedMetrics) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No specific metrics available for this industry. Please select a different industry or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">Industry-Specific Metrics</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Core Metrics Section */}
            <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {selectedMetrics.name} Metrics
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(selectedMetrics.metrics).map(([key, metric]) => {
                  const isPercentage = metric.type === 'percentage';
                  const isCurrency = metric.type === 'currency';

                  return (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`industrySpecificMetrics.${key}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{metric.label}</FormLabel>
                          <FormControl>
                            {isPercentage ? (
                              <div className="pt-2">
                                <Slider
                                  value={[field.value || 0]}
                                  onValueChange={([value]) => field.onChange(value)}
                                  max={100}
                                  step={1}
                                  className="pt-2"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                  {field.value || 0}%
                                </p>
                              </div>
                            ) : (
                              <Input
                                {...field}
                                type="number"
                                className={`transition-all duration-200 ${
                                  focusedField === key ? "ring-2 ring-primary" : ""
                                }`}
                                onFocus={() => setFocusedField(key)}
                                onBlur={() => setFocusedField(null)}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  field.onChange(value);
                                }}
                                placeholder={isCurrency ? "0.00" : "0"}
                              />
                            )}
                          </FormControl>
                          <FormDescription>
                            {isCurrency && field.value ? formatCurrency(field.value) : "Enter value"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="w-full md:w-auto">
              Continue to Next Step
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}