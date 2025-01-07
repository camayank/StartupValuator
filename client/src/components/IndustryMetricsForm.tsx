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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import { getIndustryMetricsSchema, industryRiskFactors } from "@/lib/validation/industryMetrics";

interface IndustryMetricsFormProps {
  industry: string;
  onMetricsUpdate: (metrics: any) => void;
}

export function IndustryMetricsForm({ industry, onMetricsUpdate }: IndustryMetricsFormProps) {
  const metricsSchema = getIndustryMetricsSchema(industry);
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
          No specific metrics available for this industry type.
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

  // Get risk factors for the current industry
  const riskFactors = industryRiskFactors[industry as keyof typeof industryRiskFactors];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* SaaS Metrics */}
          {industry.includes("saas") && (
            <>
              <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Metrics
                </h3>
                {renderMetricField("mrr", "Monthly Recurring Revenue", "Current MRR in your selected currency")}
                {renderMetricField("ltv", "Customer Lifetime Value", "Average LTV per customer")}
                {renderMetricField("cac", "Customer Acquisition Cost", "Average cost to acquire a customer")}
                {renderMetricField("retentionRate", "Customer Retention Rate", "Monthly retention rate in percentage")}
              </div>
            </>
          )}

          {/* E-commerce Metrics */}
          {industry.includes("commerce") && (
            <>
              <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Sales Metrics
                </h3>
                {renderMetricField("aov", "Average Order Value", "Average value per order")}
                {renderMetricField("inventoryTurnover", "Inventory Turnover", "Number of times inventory is sold per year")}
                {renderMetricField("conversionRate", "Conversion Rate", "Percentage of visitors who make a purchase")}
                {renderMetricField("cartAbandonmentRate", "Cart Abandonment Rate", "Percentage of abandoned carts")}
              </div>
            </>
          )}

          {/* Healthcare Metrics */}
          {industry.includes("health") && (
            <>
              <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Healthcare Development Metrics
                </h3>
                {renderMetricField("rdSpending", "R&D Spending", "Annual R&D expenditure")}
                {renderMetricField("pipelineProgress", "Pipeline Progress", "Overall progress of product pipeline")}
              </div>
            </>
          )}

          {/* Fintech Metrics */}
          {industry.includes("fintech") && (
            <>
              <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Fintech Metrics
                </h3>
                {renderMetricField("transactionVolume", "Transaction Volume", "Monthly transaction volume")}
                {renderMetricField("avgTransactionValue", "Average Transaction Value", "Average value per transaction")}
                {renderMetricField("userAcquisitionCost", "User Acquisition Cost", "Cost to acquire new users")}
              </div>
            </>
          )}

          {/* Manufacturing Metrics */}
          {industry.includes("manufacturing") && (
            <>
              <div className="col-span-2 p-6 bg-card rounded-lg border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Manufacturing Metrics
                </h3>
                {renderMetricField("fixedCosts", "Fixed Costs", "Monthly fixed operational costs")}
                {renderMetricField("variableCosts", "Variable Costs", "Average variable costs per unit")}
                {renderMetricField("productionEfficiency", "Production Efficiency", "Overall equipment effectiveness")}
              </div>
            </>
          )}


          {/* Risk Assessment Section */}
          {riskFactors && (
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