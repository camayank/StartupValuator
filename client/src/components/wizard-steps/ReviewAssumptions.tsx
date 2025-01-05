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

interface ReviewAssumptionsProps {
  data: ValuationFormData & {
    assumptions: {
      discountRate: number;
      growthRate: number;
      terminalGrowthRate: number;
      beta: number;
      marketRiskPremium: number;
    };
    valuation: number;
  };
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onRegenerate: () => void;
  onBack: () => void;
}

export function ReviewAssumptions({ data, onUpdate, onRegenerate, onBack }: ReviewAssumptionsProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const form = useForm<Partial<ValuationFormData>>({
    defaultValues: {
      ...data,
      growthRate: data.assumptions.growthRate * 100,
      margins: data.margins || 0,
    },
  });

  const handleSubmit = async (values: Partial<ValuationFormData>) => {
    setIsRegenerating(true);
    try {
      await onUpdate(values);
      await onRegenerate();
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Discount Rate</FormLabel>
              <FormDescription>
                Current value: {(data.assumptions.discountRate * 100).toFixed(1)}%
              </FormDescription>
              <Slider
                value={[data.assumptions.discountRate * 100]}
                onValueChange={([value]) => {
                  onUpdate({ assumptions: { ...data.assumptions, discountRate: value / 100 } });
                }}
                min={5}
                max={30}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Terminal Growth Rate</FormLabel>
              <FormDescription>
                Current value: {(data.assumptions.terminalGrowthRate * 100).toFixed(1)}%
              </FormDescription>
              <Slider
                value={[data.assumptions.terminalGrowthRate * 100]}
                onValueChange={([value]) => {
                  onUpdate({ assumptions: { ...data.assumptions, terminalGrowthRate: value / 100 } });
                }}
                min={1}
                max={5}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Beta (Market Risk)</FormLabel>
              <FormDescription>
                Current value: {data.assumptions.beta.toFixed(2)}
              </FormDescription>
              <Slider
                value={[data.assumptions.beta]}
                onValueChange={([value]) => {
                  onUpdate({ assumptions: { ...data.assumptions, beta: value } });
                }}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Market Risk Premium</FormLabel>
              <FormDescription>
                Current value: {(data.assumptions.marketRiskPremium * 100).toFixed(1)}%
              </FormDescription>
              <Slider
                value={[data.assumptions.marketRiskPremium * 100]}
                onValueChange={([value]) => {
                  onUpdate({ assumptions: { ...data.assumptions, marketRiskPremium: value / 100 } });
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
