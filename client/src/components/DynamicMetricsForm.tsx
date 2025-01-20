import { type Metric } from "@/lib/metrics-config";
import { useDynamicMetrics } from "@/hooks/use-dynamic-metrics";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
}

export function DynamicMetricsForm({ industry, stage, onSubmit }: DynamicMetricsFormProps) {
  const { metrics, form, shouldShowMetric } = useDynamicMetrics(industry, stage);
  
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  const renderMetricInput = (metric: Metric) => {
    if (!shouldShowMetric(metric)) return null;

    return (
      <div key={metric.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={metric.id}>{metric.label}</Label>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4">
                <Info className="h-3 w-3" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>{metric.description}</HoverCardContent>
          </HoverCard>
        </div>
        <Input
          id={metric.id}
          type="number"
          {...form.register(metric.id, { valueAsNumber: true })}
          className="w-full"
          step={metric.type === "percentage" ? "0.01" : "1"}
        />
        {form.formState.errors[metric.id] && (
          <p className="text-sm text-destructive">
            {form.formState.errors[metric.id]?.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map(renderMetricInput)}
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="submit">Save Metrics</Button>
          </div>
        </Card>
      </form>
    </Form>
  );
}
