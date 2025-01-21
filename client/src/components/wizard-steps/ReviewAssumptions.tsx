import { useState } from "react";
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
import ValidationEngine from "@/lib/validation-engine";
import ErrorHandler from "@/lib/error-handler";
import DebugHelper from "@/lib/debug-helper";

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

// Validation rules for the assumptions
const validationRules = {
  discountRate: { min: 0.05, max: 0.3 },
  growthRate: { min: 0, max: 1 },
  terminalGrowthRate: { min: 0.01, max: 0.05 },
  beta: { min: 0.5, max: 2.0 },
  marketRiskPremium: { min: 0.04, max: 0.08 }
};

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

  // Validate assumption values using ValidationEngine
  const validateAssumption = (field: string, value: number): boolean => {
    const rules = validationRules[field as keyof typeof validationRules];
    if (!rules) return true;
    return ValidationEngine.validateNumber(value, rules);
  };

  // Update handlers with type-safe assumption updates and validation
  const handleAssumptionUpdate = async (field: keyof typeof assumptions, value: number) => {
    try {
      // Validate the new value
      if (!validateAssumption(field, value)) {
        const error = ErrorHandler.handleValidationError({
          message: `Invalid value for ${field}. Please check the allowed range.`,
          suggestions: [`Value must be between ${validationRules[field].min} and ${validationRules[field].max}`]
        });
        error.toast();
        return;
      }

      // Track state change
      const prevAssumptions = { ...assumptions };
      const newAssumptions = { ...assumptions, [field]: value };

      DebugHelper.trackStateChange(prevAssumptions, newAssumptions);

      // Update state and notify parent
      await DebugHelper.trackAPICall(
        async () => await onUpdate({ assumptions: newAssumptions }),
        `Update ${field}`
      );

    } catch (error) {
      if (error instanceof Error) {
        ErrorHandler.logError(error, {
          context: 'handleAssumptionUpdate',
          field,
          value,
          previousValue: assumptions[field]
        });
      }
    }
  };

  const handleSubmit = async (values: Partial<ValuationFormData>) => {
    setIsRegenerating(true);
    try {
      // Track API calls with DebugHelper
      await DebugHelper.trackAPICall(
        async () => {
          await onUpdate(values);
          await onRegenerate();
        },
        'Regenerate Valuation'
      );
    } catch (error) {
      if (error instanceof Error) {
        ErrorHandler.logError(error, {
          context: 'ReviewAssumptions.handleSubmit',
          formData: values
        });
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Review and adjust the valuation assumptions below. Changes will automatically update the valuation and regenerate the report.
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
                  <FormLabel>Growth Rate (%)</FormLabel>
                  <FormDescription>
                    Expected annual revenue growth rate
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                        onUpdate({ growthRate: value });
                      }}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Margins Field */}
            <FormField
              control={form.control}
              name="margins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating Margins (%)</FormLabel>
                  <FormDescription>
                    Expected operating profit margin
                  </FormDescription>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        field.onChange(value);
                        onUpdate({ margins: value });
                      }}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount Rate Slider */}
            <div className="space-y-2">
              <FormLabel>Discount Rate (%)</FormLabel>
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
              />
            </div>

            {/* Terminal Growth Rate Slider */}
            <div className="space-y-2">
              <FormLabel>Terminal Growth Rate (%)</FormLabel>
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
              />
            </div>

            {/* Beta Slider */}
            <div className="space-y-2">
              <FormLabel>Beta (Market Risk)</FormLabel>
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
              />
            </div>

            {/* Market Risk Premium Slider */}
            <div className="space-y-2">
              <FormLabel>Market Risk Premium (%)</FormLabel>
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
              />
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