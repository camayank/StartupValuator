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
      [metric.id]: metric.required 
        ? createMetricSchema(metric)
        : createMetricSchema(metric).optional()
    }), {})
  );

  type ValidationSchema = z.infer<typeof validationSchema>;

  // Create form with dynamic validation
  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    defaultValues: metrics.reduce((acc, metric) => ({
      ...acc,
      [metric.id]: metric.defaultValue || undefined
    }), {}),
  });

  // Helper function to check if a metric should be shown based on business rules
  const shouldShowMetric = (metric: Metric) => {
    // Add any conditional logic here, for example:
    if (metric.id === "marketShare" && !stage.includes("scaling")) {
      return false;
    }
    return true;
  };

  return {
    metrics: metrics.filter(shouldShowMetric),
    form,
    shouldShowMetric,
    validationSchema,
  };
}