import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useValuationSocket } from "@/hooks/use-valuation-socket";
import { useToast } from "@/hooks/use-toast";

// Schema remains the same
const valuationSimulationSchema = z.object({
  method: z.enum(["DCF", "Market Comps", "Monte Carlo", "AI Recommend"]),
  expectedROI: z.number().min(0).max(1000),
  timeHorizon: z.number().min(1).max(10),
  discountRate: z.number().min(0).max(100),
  terminalGrowthRate: z.number().min(-20).max(20),
});

type ValuationSimulationFormData = z.infer<typeof valuationSimulationSchema>;

interface ValuationSimulationStepProps {
  onUpdate: (data: ValuationSimulationFormData) => Promise<void>;
  initialData?: Partial<ValuationSimulationFormData>;
  aiAnalysis?: any;
}

export function ValuationSimulationStep({
  onUpdate,
  initialData = {},
  aiAnalysis
}: ValuationSimulationStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isConnected, isReconnecting, sendMessage } = useValuationSocket();

  const form = useForm<ValuationSimulationFormData>({
    resolver: zodResolver(valuationSimulationSchema),
    defaultValues: {
      method: initialData.method || "DCF",
      expectedROI: initialData.expectedROI || 20,
      timeHorizon: initialData.timeHorizon || 5,
      discountRate: initialData.discountRate || 15,
      terminalGrowthRate: initialData.terminalGrowthRate || 2,
    },
  });

  const handleSubmit = async (values: ValuationSimulationFormData) => {
    try {
      setIsSubmitting(true);

      // Send update through WebSocket
      if (isConnected) {
        sendMessage('valuation_update', values);
      }

      await onUpdate(values);

      toast({
        title: "Success",
        description: "Valuation simulation updated successfully",
      });
    } catch (error) {
      console.error("Error submitting valuation simulation:", error);
      toast({
        title: "Error",
        description: "Failed to update valuation simulation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Connection status alert
  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <Alert variant="destructive" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {isReconnecting ? "Reconnecting to server..." : "Disconnected from server"}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {renderConnectionStatus()}

      {aiAnalysis && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{aiAnalysis.feedback}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valuation Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select valuation method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DCF">Discounted Cash Flow</SelectItem>
                    <SelectItem value="Market Comps">Market Comparables</SelectItem>
                    <SelectItem value="Monte Carlo">Monte Carlo Simulation</SelectItem>
                    <SelectItem value="AI Recommend">AI Recommended Method</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expectedROI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected ROI (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeHorizon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Horizon (years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terminalGrowthRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminal Growth Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting || !isConnected}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ValuationSimulationStep;