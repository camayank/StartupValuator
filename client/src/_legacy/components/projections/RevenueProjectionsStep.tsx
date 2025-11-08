import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Info, TrendingUp, DollarSign } from "lucide-react";
import type { FinancialProjectionData } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { revenueProjectionsSchema } from "@/lib/validations";
import { motion } from "framer-motion";

interface RevenueProjectionsStepProps {
  data: Partial<FinancialProjectionData>;
  onUpdate: (data: Partial<FinancialProjectionData>) => void;
  onNext: () => void;
}

export function RevenueProjectionsStep({
  data,
  onUpdate,
  onNext,
}: RevenueProjectionsStepProps) {
  const form = useForm({
    resolver: zodResolver(revenueProjectionsSchema),
    defaultValues: {
      baseRevenue: data.baseRevenue,
      projectionPeriod: data.projectionPeriod || 3,
      growthRate: data.growthRate,
      revenueAssumptions: data.revenueAssumptions || [],
    },
  });

  const onSubmit = (values: any) => {
    onUpdate(values);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Let's start by understanding your revenue projections. Please provide your current revenue
          and expected growth rates for accurate financial forecasting.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="baseRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Annual Revenue</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                          type="number"
                          placeholder="Enter current revenue"
                          className="pl-9"
                          {...field}
                          value={field.value === undefined || field.value === null ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectionPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projection Period (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        placeholder="Enter period (1-5 years)"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="growthRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Annual Growth Rate (%)</FormLabel>
                    <FormDescription>Enter your projected annual growth rate</FormDescription>
                    <FormControl>
                      <div className="relative">
                        <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                          type="number"
                          placeholder="Enter growth rate"
                          className="pl-9"
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="w-32">
              Next
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}