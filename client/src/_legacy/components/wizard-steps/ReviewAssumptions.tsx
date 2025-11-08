import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import type { ValuationFormData, FinancialData } from "@/lib/types/shared";
import { useSmartValidation } from "@/hooks/use-smart-validation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReviewAssumptionsProps {
  data: ValuationFormData;
  onUpdate: (data: Partial<ValuationFormData>) => Promise<void>;
  onRegenerate: () => void;
  onBack: () => void;
}

export function ReviewAssumptions({ data, onUpdate, onRegenerate, onBack }: ReviewAssumptionsProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);

  const assumptions = data.financialData?.assumptions || {
    discountRate: 0.1,
    growthRate: 0.05,
    terminalGrowthRate: 0.02,
    beta: 1.0,
    marketRiskPremium: 0.05
  };

  // Generate comparison data for visualization
  const getComparisonData = () => {
    const years = Array.from({ length: 5 }, (_, i) => i + 1);
    return years.map(year => ({
      year,
      dcf: data.valuation ? (data.valuation.amount * Math.pow(1 + assumptions.growthRate, year)).toFixed(2) : 0,
      market: data.valuation ? (data.valuation.amount * Math.pow(1 + assumptions.marketRiskPremium, year)).toFixed(2) : 0,
    }));
  };

  const form = useForm<Partial<FinancialData>>({
    defaultValues: {
      ...data.financialData,
      assumptions
    },
  });

  const { validateField, validationState, getSmartSuggestions } = useSmartValidation({
    sector: data.businessInfo?.sector,
    stage: data.businessInfo?.stage,
    revenue: data.financialData?.revenue
  });

  // Validate assumption values
  const handleAssumptionUpdate = async (field: keyof typeof assumptions, value: number) => {
    const isValid = validateField(field, value, data);
    if (isValid) {
      const newAssumptions = { ...assumptions, [field]: value };
      await onUpdate({ 
        financialData: {
          ...data.financialData,
          assumptions: newAssumptions
        }
      });
    }
  };

  const handleSubmit = async (values: Partial<FinancialData>) => {
    setIsRegenerating(true);
    try {
      await onUpdate({ financialData: values });
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  const renderSuggestions = (field: string) => {
    const suggestions = getSmartSuggestions(field, form.getValues(field) as number);
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

      {/* Valuation Comparison Chart */}
      <div className="p-4 border rounded-lg bg-background/50">
        <h3 className="text-lg font-medium mb-4">Valuation Projection Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getComparisonData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: 'Years', position: 'bottom' }} />
            <YAxis label={{ value: 'Valuation ($)', angle: -90, position: 'insideLeft' }} />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="dcf" stroke="#3182ce" name="DCF Valuation" />
            <Line type="monotone" dataKey="market" stroke="#38a169" name="Market Valuation" />
          </LineChart>
        </ResponsiveContainer>
      </div>

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
                        onUpdate({ financialData: { ...data.financialData, growthRate: value } });
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
                        onUpdate({ financialData: { ...data.financialData, margins: value } });
                      }}
                      className={validationState['margins']?.isValid ? '' : 'border-red-500'}
                    />
                  </FormControl>
                  <FormMessage />
                  {renderSuggestions('margins')}
                </FormItem>
              )}
            />
          </div>

          {/* Toggle for Advanced Settings */}
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between"
            >
              <span>Advanced Settings</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Advanced Settings Section */}
          {showAdvanced && (
            <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-top duration-300">
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
          )}

          {/* Help Panel */}
          <Sheet open={helpPanelOpen} onOpenChange={setHelpPanelOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" type="button" className="w-full mt-4">
                Need Help Understanding These Values?
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Understanding Valuation Parameters</SheetTitle>
                <SheetDescription>
                  Learn about each parameter and how it affects your valuation
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-medium">Growth Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    The expected annual increase in revenue. Higher growth rates lead to higher valuations but require strong justification.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Operating Margins</h4>
                  <p className="text-sm text-muted-foreground">
                    The percentage of revenue that becomes operating profit. Higher margins indicate better operational efficiency.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Discount Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    The rate used to determine the present value of future cash flows. Higher rates reflect higher risk and uncertainty.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Terminal Growth Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    The expected long-term growth rate after the forecast period. Usually close to the economy's growth rate.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Beta</h4>
                  <p className="text-sm text-muted-foreground">
                    Measures the company's volatility compared to the market. A beta of 1 means it moves with the market.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Market Risk Premium</h4>
                  <p className="text-sm text-muted-foreground">
                    The extra return investors expect for taking on market risk. It's calculated by subtracting the risk-free rate (e.g., government bond yield) from the expected market return.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

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