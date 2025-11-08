import { type Metric } from "@/lib/metrics-config";
import { useDynamicMetrics } from "@/hooks/use-dynamic-metrics";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface DynamicMetricsFormProps {
  industry: string;
  stage: string;
  onSubmit: (data: Record<string, number>) => void;
  defaultValues?: Record<string, number>;
}

export function DynamicMetricsForm({ 
  industry, 
  stage, 
  onSubmit,
  defaultValues = {} 
}: DynamicMetricsFormProps) {
  const { metrics, form, shouldShowMetric } = useDynamicMetrics(industry, stage);

  const handleSubmit = form.handleSubmit((data) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    );
    onSubmit(cleanedData);
  });

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  const renderMetricInput = (metric: Metric) => {
    if (!shouldShowMetric(metric)) return null;

    const fieldName = metric.id as keyof typeof form.formState.errors;
    const error = form.formState.errors[fieldName]?.message as string;

    return (
      <div key={metric.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={metric.id} className="font-medium">
            {metric.label}
            {metric.required && <span className="text-destructive">*</span>}
          </Label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <Info className="h-3 w-3" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="text-sm">{metric.description}</p>
              {metric.unit && (
                <p className="text-sm text-muted-foreground mt-1">
                  Unit: {metric.unit}
                </p>
              )}
            </HoverCardContent>
          </HoverCard>
        </div>
        <Input
          id={metric.id}
          type="number"
          {...form.register(metric.id)}
          defaultValue={defaultValues[metric.id] ?? metric.defaultValue ?? ''}
          className="w-full"
          step={metric.type === "percentage" ? "0.01" : "1"}
          min={metric.min}
          max={metric.max}
        />
        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {hasErrors && (
          <Alert variant="destructive">
            <AlertDescription>
              Please complete all required fields before proceeding.
            </AlertDescription>
          </Alert>
        )}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map(renderMetricInput)}
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="min-w-[120px]"
            >
              {form.formState.isSubmitting ? "Saving..." : "Save Metrics"}
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  );
}