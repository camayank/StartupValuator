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
import { Info, TrendingUp, AlertTriangle, Activity, Plus } from "lucide-react";
import { 
  industryMetrics, 
  coreMetrics, 
  industryMetricsSchema,
  type IndustryMetricsData 
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/validations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IndustryMetricsFormProps {
  sector: string;
  industry: string;
  onMetricsUpdate: (metrics: IndustryMetricsData) => void;
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
  const [showCustomMetrics, setShowCustomMetrics] = useState(false);
  const [customMetrics, setCustomMetrics] = useState<Array<{
    name: string;
    type: "currency" | "percentage" | "number" | "ratio";
  }>>([]);

  // Get primary industry metrics
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

  const primaryMetrics = getIndustryMetrics();

  // Find related sectors for hybrid metrics
  const relatedSectors = primaryMetrics?.relatedSectors || [];

  const form = useForm<IndustryMetricsData>({
    resolver: zodResolver(industryMetricsSchema),
    defaultValues: {
      coreMetrics: {},
      industrySpecificMetrics: {},
      hybridMetrics: undefined,
      benchmarks: {},
    },
  });

  const handleCustomMetricAdd = () => {
    setCustomMetrics([...customMetrics, { name: "", type: "number" }]);
  };

  const renderMetricField = (key: string, metric: { label: string, type: string }, category: string) => {
    const isPercentage = metric.type === 'percentage';
    const isCurrency = metric.type === 'currency';

    return (
      <FormField
        key={`${category}.${key}`}
        control={form.control}
        name={`${category}.${key}`}
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">Industry Metrics</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onMetricsUpdate)} className="space-y-6">
          {/* Core Metrics Section */}
          <div className="grid gap-6">
            <div className="p-6 bg-card rounded-lg border shadow-sm space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Core Business Metrics
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(coreMetrics.financial).map(([key, metric]) => 
                  renderMetricField(key, metric, "coreMetrics")
                )}
              </div>
            </div>

            {/* Industry-Specific Metrics */}
            {primaryMetrics && (
              <div className="p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {primaryMetrics.name} Specific Metrics
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(primaryMetrics.metrics).map(([key, metric]) =>
                    renderMetricField(key, metric, "industrySpecificMetrics")
                  )}
                </div>
              </div>
            )}

            {/* Custom Metrics Section */}
            <div className="p-6 bg-card rounded-lg border shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Custom Metrics
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCustomMetricAdd}
                  className="text-sm"
                >
                  Add Custom Metric
                </Button>
              </div>
              {customMetrics.map((metric, index) => (
                <div key={index} className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`customMetrics.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metric Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter metric name" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`customMetrics.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metric Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select metric type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="currency">Currency</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="ratio">Ratio</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
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