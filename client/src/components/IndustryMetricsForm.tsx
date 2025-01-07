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
import { getSectorMetricsSchema } from "@/lib/validation/sectorMetrics";

interface IndustryMetricsFormProps {
  sector: string;
  industry: string;
  onMetricsUpdate: (metrics: any) => void;
}

export function IndustryMetricsForm({ sector, industry, onMetricsUpdate }: IndustryMetricsFormProps) {
  const metricsSchema = getSectorMetricsSchema(sector, industry);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(metricsSchema),
    defaultValues: {},
  });

  const onSubmit = (data: any) => {
    onMetricsUpdate(data);
  };

  if (!metricsSchema) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No specific metrics available for this sector and industry combination.
        </AlertDescription>
      </Alert>
    );
  }

  const renderMetricField = (fieldName: string, label: string, description: string) => {
    if (fieldName.toLowerCase().includes("rate")) {
      return (
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormDescription>{description}</FormDescription>
              <FormControl>
                <div className="pt-2">
                  <Slider
                    value={[field.value || 0]}
                    onValueChange={([value]) => {
                      field.onChange(value);
                    }}
                    max={100}
                    step={1}
                    className="pt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {field.value}%
                  </p>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }

    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormDescription>{description}</FormDescription>
            <FormControl>
              <Input
                {...field}
                type="number"
                className={`transition-all duration-200 ${
                  focusedField === fieldName ? "ring-2 ring-primary" : ""
                }`}
                onFocus={() => setFocusedField(fieldName)}
                onBlur={() => setFocusedField(null)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  // Get schema shape to determine what fields to render
  const shape = metricsSchema.shape;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(shape).map(([fieldName, field]) => {
            // Convert field name to label (e.g., "mrr" -> "Monthly Recurring Revenue")
            const label = fieldName
              .split(/(?=[A-Z])|_/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            // Generate description based on field validation rules
            let description = "";
            if ("min" in field && "max" in field) {
              description = `Must be between ${field.min} and ${field.max}`;
            } else if ("min" in field) {
              description = `Must be greater than ${field.min}`;
            }

            return (
              <div key={fieldName} className="col-span-1">
                {renderMetricField(fieldName, label, description)}
              </div>
            );
          })}
          {/* Risk Assessment Section */}
          {metricsSchema.shape["riskAssessment"] && (
            <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(metricsSchema.shape["riskAssessment"].shape).map(([category, factors]) => (
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
                                onValueChange={([value]) => {
                                  field.onChange(value);
                                }}
                                max={10}
                                step={1}
                                className="pt-2"
                              />
                              <p className="text-sm text-muted-foreground mt-1">
                                Level: {field.value}
                              </p>
                            </div>
                          </FormControl>
                          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                            {factors.map((factor) => (
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
          )}
        </div>
      </form>
    </Form>
  );
}