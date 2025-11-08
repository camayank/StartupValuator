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
import { Info, TrendingUp, AlertTriangle, Activity, Plus, Lightbulb } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

interface IndustryMetricsFormProps {
  sector: string;
  industry: string;
  onMetricsUpdate: (metrics: IndustryMetricsData) => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

const startupStages = [
  { value: "ideation", label: "Ideation", description: "Initial concept stage, pre-product" },
  { value: "validation", label: "Validation", description: "Testing market fit, early prototype" },
  { value: "early_growth", label: "Early Growth", description: "Initial customers and revenue" },
  { value: "scaling", label: "Scaling", description: "Proven model, focus on growth" },
];

const ideationMetrics = {
  marketResearch: {
    label: "Market Research Score",
    type: "percentage",
    description: "How thoroughly have you researched your target market?"
  },
  problemValidation: {
    label: "Problem Validation Score",
    type: "percentage",
    description: "How well have you validated the problem with potential customers?"
  },
  solutionReadiness: {
    label: "Solution Readiness",
    type: "percentage",
    description: "How developed is your solution concept?"
  },
  potentialMarketSize: {
    label: "Potential Market Size",
    type: "currency",
    description: "Estimated total addressable market size"
  },
  competitorAnalysis: {
    label: "Competitor Analysis",
    type: "text",
    description: "Brief analysis of potential competitors and market gaps"
  },
};

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
  const [startupStage, setStartupStage] = useState("ideation");

  // Get primary industry metrics
  const getIndustryMetrics = () => {
    if (startupStage === "ideation") return null;

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

  const form = useForm<IndustryMetricsData>({
    resolver: zodResolver(industryMetricsSchema),
    defaultValues: {
      coreMetrics: {},
      industrySpecificMetrics: {},
      hybridMetrics: undefined,
      benchmarks: {},
      stage: startupStage,
      ideationMetrics: {},
    },
  });

  const handleCustomMetricAdd = () => {
    setCustomMetrics([...customMetrics, { name: "", type: "number" }]);
  };

  const handleStageChange = (value: string) => {
    setStartupStage(value);
    // Reset form values when changing stages
    form.reset({
      ...form.getValues(),
      stage: value,
      industrySpecificMetrics: {},
    });
  };

  const renderMetricField = (key: string, metric: { label: string, type: string, description?: string }, category: string) => {
    const isPercentage = metric.type === 'percentage';
    const isCurrency = metric.type === 'currency';
    const isText = metric.type === 'text';

    return (
      <FormField
        key={`${category}.${key}`}
        control={form.control}
        name={`${category}.${key}`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{metric.label}</FormLabel>
            {metric.description && (
              <FormDescription>{metric.description}</FormDescription>
            )}
            <FormControl>
              {isText ? (
                <Textarea
                  {...field}
                  placeholder="Enter your analysis here..."
                  className="min-h-[100px]"
                />
              ) : isPercentage ? (
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
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const handleSubmit = (data: IndustryMetricsData) => {
    // Prepare the data based on startup stage
    const formattedData = {
      ...data,
      stage: startupStage,
      // Only include relevant metrics based on stage
      ...(startupStage === "ideation" ? {
        ideationMetrics: data.ideationMetrics,
        // Clear other metrics for ideation stage
        coreMetrics: undefined,
        industrySpecificMetrics: undefined,
      } : {
        // Include regular metrics for other stages
        coreMetrics: data.coreMetrics,
        industrySpecificMetrics: data.industrySpecificMetrics,
        // Clear ideation metrics for other stages
        ideationMetrics: undefined,
      }),
      // Always include custom metrics if any
      customMetrics: customMetrics.length > 0 ? data.customMetrics : undefined,
    };

    onMetricsUpdate(formattedData);
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Startup Stage Selector */}
          <div className="p-6 bg-card rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Startup Stage
            </h3>
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your startup's current stage</FormLabel>
                  <Select
                    value={startupStage}
                    onValueChange={handleStageChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {startupStages.map(stage => (
                        <SelectItem key={stage.value} value={stage.value}>
                          <div className="flex flex-col">
                            <span>{stage.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {stage.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This will help us adjust the metrics and analysis to your startup's stage
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          {startupStage === "ideation" ? (
            /* Ideation Stage Metrics */
            <div className="p-6 bg-card rounded-lg border shadow-sm space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Ideation Stage Metrics
              </h3>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Since your startup is in the ideation stage, we'll focus on concept validation and market potential instead of traditional metrics.
                </AlertDescription>
              </Alert>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(ideationMetrics).map(([key, metric]) =>
                  renderMetricField(key, metric, "ideationMetrics")
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Core Metrics Section */}
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
            </>
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