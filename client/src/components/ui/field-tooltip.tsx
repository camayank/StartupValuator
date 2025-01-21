import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { InfoIcon } from "lucide-react";
import TooltipSystem from "@/lib/tooltip-system";
import type { ValuationFormData } from "@/lib/validations";

interface FieldTooltipProps {
  field: keyof ValuationFormData;
  industry?: string;
  className?: string;
}

export function FieldTooltip({ field, industry, className }: FieldTooltipProps) {
  const tooltip = TooltipSystem.getFieldTooltip(field);

  const getBenchmarkDisplay = (benchmarks?: Record<string, any>) => {
    if (!benchmarks) return null;

    return (
      <div className="mt-2 text-sm">
        <p className="font-medium text-muted-foreground">Benchmarks:</p>
        <ul className="mt-1 space-y-1">
          {Object.entries(benchmarks).map(([key, value]) => (
            <li key={key} className="flex justify-between">
              <span className="text-muted-foreground">{key}:</span>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center text-muted-foreground hover:text-foreground ${className}`}
        >
          <InfoIcon className="h-4 w-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <p className="text-sm">{tooltip.text}</p>
          {tooltip.example && (
            <p className="text-sm text-muted-foreground">{tooltip.example}</p>
          )}
          {tooltip.benchmarks && getBenchmarkDisplay(tooltip.benchmarks)}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function MetricTooltip({
  metric,
  industry,
  className,
}: {
  metric: string;
  industry: string;
  className?: string;
}) {
  const tooltip = TooltipSystem.getMetricTooltip(metric, industry);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center text-muted-foreground hover:text-foreground ${className}`}
        >
          <InfoIcon className="h-4 w-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <p className="text-sm">{tooltip.text}</p>
          {tooltip.example && (
            <p className="text-sm text-muted-foreground">{tooltip.example}</p>
          )}
          {tooltip.benchmarks && (
            <div className="mt-2">
              <p className="text-sm font-medium text-muted-foreground">
                Industry Benchmarks:
              </p>
              <ul className="mt-1 space-y-1">
                {Object.entries(tooltip.benchmarks).map(([key, value]) => (
                  <li key={key} className="text-sm flex justify-between">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default FieldTooltip;
