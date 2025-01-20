import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCombinedMetrics, createMetricSchema, type Metric } from "@/lib/metrics-config";

export function useDynamicMetrics(industry: string, stage: string) {
  const metrics = getCombinedMetrics(industry, stage);
  
  // Create dynamic validation schema based on metrics
  const validationSchema = z.object(
    metrics.reduce((acc, metric) => ({
      ...acc,
      [metric.id]: createMetricSchema(metric)
    }), {})
  );

  type ValidationSchema = z.infer<typeof validationSchema>;

  // Create form with dynamic validation
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: metrics.reduce((acc, metric) => ({
      ...acc,
      [metric.id]: metric.defaultValue || 0
    }), {})
  });

  // Helper function to check if a metric should be shown
  const shouldShowMetric = (metric: Metric) => {
    return true; // Can be extended with more complex logic
  };

  return {
    metrics,
    form,
    shouldShowMetric,
  };
}
