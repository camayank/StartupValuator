import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";

const riskAssessmentSchema = z.object({
  marketRisks: z.array(z.string()),
  financialRisks: z.array(z.string()),
  operationalRisks: z.array(z.string()),
  competitiveRisks: z.array(z.string()),
  regulatoryRisks: z.array(z.string()),
  mitigationStrategies: z.string().min(1, "Please provide mitigation strategies"),
  overallRiskLevel: z.enum(["low", "medium", "high"]),
  riskTolerance: z.number().min(1).max(10),
});

type RiskAssessmentFormData = z.infer<typeof riskAssessmentSchema>;

interface RiskAssessmentStepProps {
  onUpdate: (data: RiskAssessmentFormData) => Promise<void>;
  initialData?: Partial<RiskAssessmentFormData>;
  aiAnalysis?: any;
}

export function RiskAssessmentStep({
  onUpdate,
  initialData = {},
  aiAnalysis
}: RiskAssessmentStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RiskAssessmentFormData>({
    resolver: zodResolver(riskAssessmentSchema),
    defaultValues: {
      marketRisks: initialData.marketRisks || [],
      financialRisks: initialData.financialRisks || [],
      operationalRisks: initialData.operationalRisks || [],
      competitiveRisks: initialData.competitiveRisks || [],
      regulatoryRisks: initialData.regulatoryRisks || [],
      mitigationStrategies: initialData.mitigationStrategies || "",
      overallRiskLevel: initialData.overallRiskLevel || "medium",
      riskTolerance: initialData.riskTolerance || 5,
    },
  });

  const handleSubmit = async (values: RiskAssessmentFormData) => {
    try {
      setIsSubmitting(true);
      await onUpdate(values);
    } catch (error) {
      console.error("Error submitting risk assessment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
            name="overallRiskLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overall Risk Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mitigationStrategies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risk Mitigation Strategies</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe your strategies to mitigate identified risks..."
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default RiskAssessmentStep;
