import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import type { ValuationFormData } from "@/lib/validations";
import { useSmartValidation } from "@/hooks/use-smart-validation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ReviewAssumptionsProps {
  data: ValuationFormData & {
    assumptions?: {
      discountRate: number;
      growthRate: number;
      terminalGrowthRate: number;
      beta: number;
      marketRiskPremium: number;
    };
    valuation?: number;
  };
  onUpdate: (data: Partial<ValuationFormData>) => Promise<void>;
  onRegenerate: () => void;
  onBack: () => void;
}

export function ReviewAssumptions({ data, onUpdate, onRegenerate, onBack }: ReviewAssumptionsProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const assumptions = data.assumptions || {
    discountRate: 0.1,
    growthRate: 0.05,
    terminalGrowthRate: 0.02,
    beta: 1.0,
    marketRiskPremium: 0.05
  };

  const form = useForm<Partial<ValuationFormData>>({
    defaultValues: {
      ...data,
      growthRate: data.growthRate || 0,
      margins: data.margins || 0,
    },
  });

  // Use our enhanced validation hook
  const { validateField, validationState, getSmartSuggestions } = useSmartValidation({
    sector: data.businessInfo?.sector,
    stage: data.businessInfo?.productStage,
    revenue: data.financialData?.revenue
  });

  // Validate assumption values
  const handleAssumptionUpdate = async (field: keyof typeof assumptions, value: number) => {
    const isValid = validateField(field, value, data);
    if (isValid) {
      const newAssumptions = { ...assumptions, [field]: value };
      await onUpdate({ assumptions: newAssumptions });
    }
  };

  const handleSubmit = async (values: Partial<ValuationFormData>) => {
    setIsRegenerating(true);
    try {
      await onUpdate(values);
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  // Helper to render smart suggestions
  const renderSuggestions = (field: string) => {
    const suggestions = getSmartSuggestions(field, form.getValues(field));
    if (!suggestions?.length) return null;

    return (
      <div className="mt-2 space-y-1">
        {suggestions.map((suggestion, index) => (
          <Badge key={index} variant="outline" className="mr-2">
            {suggestion}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Review and adjust the valuation assumptions below. Changes will automatically update the valuation.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Growth Rate Field */}
            <FormField
              control={form.control}
              name="growthRate"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Growth Rate (%)</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Expected annual revenue growth rate
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                        validateField('growthRate', value, data);
                        onUpdate({ growthRate: value });
                      }}
                      className={validationState['growthRate']?.isValid ? '' : 'border-red-500'}
                    />
                  </FormControl>
                  <FormMessage />
                  {renderSuggestions('growthRate')}
                </FormItem>
              )}
            />

            {/* Margins Field */}
            <FormField
              control={form.control}
              name="margins"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Operating Margins (%)</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Expected operating profit margin
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                        validateField('margins', value, data);
                        onUpdate({ margins: value });
                      }}
                      className={validationState['margins']?.isValid ? '' : 'border-red-500'}
                    />
                  </FormControl>
                  <FormMessage />
                  {renderSuggestions('margins')}
                </FormItem>
              )}
            />

            {/* Discount Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Discount Rate (%)</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Required rate of return for the investment
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormDescription>
                Current value: {(assumptions.discountRate * 100).toFixed(1)}%
              </FormDescription>
              <Slider
                value={[assumptions.discountRate * 100]}
                onValueChange={([value]) => {
                  handleAssumptionUpdate('discountRate', value / 100);
                }}
                min={5}
                max={30}
                step={0.5}
                className={validationState['discountRate']?.isValid ? '' : 'border-red-500'}
              />
              {renderSuggestions('discountRate')}
            </div>

            {/* Terminal Growth Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Terminal Growth Rate (%)</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Long-term sustainable growth rate
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormDescription>
                Current value: {(assumptions.terminalGrowthRate * 100).toFixed(1)}%
              </FormDescription>
              <Slider
                value={[assumptions.terminalGrowthRate * 100]}
                onValueChange={([value]) => {
                  handleAssumptionUpdate('terminalGrowthRate', value / 100);
                }}
                min={1}
                max={5}
                step={0.1}
                className={validationState['terminalGrowthRate']?.isValid ? '' : 'border-red-500'}
              />
              {renderSuggestions('terminalGrowthRate')}
            </div>

            {/* Beta Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Beta (Market Risk)</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Measure of systematic risk
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormDescription>
                Current value: {assumptions.beta.toFixed(2)}
              </FormDescription>
              <Slider
                value={[assumptions.beta]}
                onValueChange={([value]) => {
                  handleAssumptionUpdate('beta', value);
                }}
                min={0.5}
                max={2}
                step={0.1}
                className={validationState['beta']?.isValid ? '' : 'border-red-500'}
              />
              {renderSuggestions('beta')}
            </div>

            {/* Market Risk Premium Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Market Risk Premium (%)</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Excess return of the market over the risk-free rate
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormDescription>
                Current value: {(assumptions.marketRiskPremium * 100).toFixed(1)}%
              </FormDescription>
              <Slider
                value={[assumptions.marketRiskPremium * 100]}
                onValueChange={([value]) => {
                  handleAssumptionUpdate('marketRiskPremium', value / 100);
                }}
                min={4}
                max={8}
                step={0.1}
                className={validationState['marketRiskPremium']?.isValid ? '' : 'border-red-500'}
              />
              {renderSuggestions('marketRiskPremium')}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={isRegenerating}>
              {isRegenerating ? "Regenerating..." : "Update & Regenerate"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}