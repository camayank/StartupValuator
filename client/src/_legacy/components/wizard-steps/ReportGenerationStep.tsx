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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";

const reportGenerationSchema = z.object({
  format: z.enum(["pdf", "excel", "html"]),
  sections: z.array(z.string()),
  includeCharts: z.boolean(),
  includeAppendix: z.boolean(),
  executiveSummary: z.boolean(),
  detailedAnalysis: z.boolean(),
});

type ReportGenerationFormData = z.infer<typeof reportGenerationSchema>;

interface ReportGenerationStepProps {
  onUpdate: (data: ReportGenerationFormData) => Promise<void>;
  initialData?: Partial<ReportGenerationFormData>;
  aiAnalysis?: any;
}

export function ReportGenerationStep({
  onUpdate,
  initialData = {},
  aiAnalysis
}: ReportGenerationStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportGenerationFormData>({
    resolver: zodResolver(reportGenerationSchema),
    defaultValues: {
      format: initialData.format || "pdf",
      sections: initialData.sections || [],
      includeCharts: initialData.includeCharts ?? true,
      includeAppendix: initialData.includeAppendix ?? true,
      executiveSummary: initialData.executiveSummary ?? true,
      detailedAnalysis: initialData.detailedAnalysis ?? true,
    },
  });

  const handleSubmit = async (values: ReportGenerationFormData) => {
    try {
      setIsSubmitting(true);
      await onUpdate(values);
    } catch (error) {
      console.error("Error generating report:", error);
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
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Format</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report format" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="html">HTML Report</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="executiveSummary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Executive Summary</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="detailedAnalysis"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Detailed Analysis</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includeCharts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Charts and Graphs</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="includeAppendix"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Include Appendix</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ReportGenerationStep;
