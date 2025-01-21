import * as React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";

interface SmartSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  benchmarks?: {
    value: number;
    label: string;
    description?: string;
  }[];
  tooltip?: {
    title?: string;
    description?: string;
  };
  className?: string;
}

export function SmartSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 10,
  benchmarks = [
    { value: 25, label: "Basic" },
    { value: 50, label: "Intermediate" },
    { value: 75, label: "Advanced" },
    { value: 100, label: "Expert" },
  ],
  tooltip,
  className,
}: SmartSliderProps) {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    setLocalValue(newValue[0]);
    onChange(newValue[0]);
  };

  const getCurrentBenchmark = () => {
    return benchmarks.reduce((prev, curr) => {
      return Math.abs(curr.value - localValue) < Math.abs(prev.value - localValue)
        ? curr
        : prev;
    });
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">{label}</Label>
        {tooltip && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              {tooltip.title && (
                <h4 className="font-semibold mb-1">{tooltip.title}</h4>
              )}
              {tooltip.description && (
                <p className="text-sm text-muted-foreground">
                  {tooltip.description}
                </p>
              )}
            </HoverCardContent>
          </HoverCard>
        )}
      </div>

      <div className="pt-4 pb-2">
        <Slider
          value={[localValue]}
          min={min}
          max={max}
          step={step}
          onValueChange={handleValueChange}
          className="w-full"
        />
      </div>

      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        {benchmarks.map((benchmark, i) => (
          <div
            key={i}
            className={`text-center ${
              Math.abs(benchmark.value - localValue) < step
                ? "text-primary font-medium"
                : ""
            }`}
          >
            <div className="mb-1">{benchmark.label}</div>
            <div>{benchmark.value}</div>
          </div>
        ))}
      </div>

      {getCurrentBenchmark().description && (
        <p className="mt-2 text-sm text-muted-foreground">
          {getCurrentBenchmark().description}
        </p>
      )}
    </div>
  );
}

export default SmartSlider;
