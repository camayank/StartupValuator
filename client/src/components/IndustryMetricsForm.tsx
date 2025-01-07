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
import { getIndustryMetricsSchema, industryRiskFactors } from "@/lib/validation/industryMetrics";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  const metricsSchema = getIndustryMetricsSchema(industry);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(metricsSchema || {}),
    defaultValues: {},
  });

  const onSubmit = (data: any) => {
    onMetricsUpdate(data);
    onNext();
  };

  if (!metricsSchema) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No specific metrics available for this industry. Please select a different industry or contact support.
        </AlertDescription>
      </Alert>
    );
  }

  // Get risk factors for the current sector
  const riskFactors = industryRiskFactors[sector as keyof typeof industryRiskFactors] || {};

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
                Core Performance Metrics
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(metricsSchema.shape)
                  .filter(([key]) => !['riskAssessment'].includes(key))
                  .map(([fieldName, field]: [string, any]) => {
                    const isPercentage = fieldName.toLowerCase().includes('rate') || 
                                     fieldName.toLowerCase().includes('margin') ||
                                     fieldName.toLowerCase().includes('efficiency');

                    const label = fieldName
                      .split(/(?=[A-Z])|_/)
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ");

                    return (
                      <FormField
                        key={fieldName}
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{label}</FormLabel>
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
                                    focusedField === fieldName ? "ring-2 ring-primary" : ""
                                  }`}
                                  onFocus={() => setFocusedField(fieldName)}
                                  onBlur={() => setFocusedField(null)}
                                />
                              )}
                            </FormControl>
                            <FormDescription>
                              Enter your {label.toLowerCase()}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                })}
              </div>
            </div>

            {/* Risk Assessment Section */}
            <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(riskFactors).map(([category, factors]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium capitalize">{category} Risks</h4>
                    <FormField
                      control={form.control}
                      name={`riskAssessment.${category}Risk`}
                      render={({ field }) => (
                        <FormItem>
                          <FormDescription>
                            Rate the impact level (1-10)
                          </FormDescription>
                          <FormControl>
                            <div className="pt-2">
                              <Slider
                                value={[field.value || 1]}
                                onValueChange={([value]) => field.onChange(value)}
                                max={10}
                                step={1}
                                className="pt-2"
                              />
                              <p className="text-sm text-muted-foreground mt-1">
                                Level: {field.value || 1}
                              </p>
                            </div>
                          </FormControl>
                          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                            {(factors as string[]).map((factor) => (
                              <li key={factor}>{factor}</li>
                            ))}
                          </ul>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
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