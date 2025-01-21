import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useToast } from "@/hooks/use-toast";
import { valuationFormSchema } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { CollapsibleSection } from "@/components/ui/collapsible-section";

// Define sections for grouping exactly as provided
const formSections = [
  {
    title: "Basic Information",
    fields: [
      { name: "businessName", label: "Business Name", type: "text", required: true },
      { name: "sector", label: "Business Sector", type: "dropdown", required: true },
      { name: "industry", label: "Industry", type: "dropdown", required: true }
    ]
  },
  {
    title: "Market Information",
    fields: [
      { name: "geographicMarkets", label: "Geographic Markets", type: "dropdown", required: true },
      { name: "revenueModel", label: "Revenue Model", type: "dropdown", required: true },
      { name: "productStage", label: "Product Stage", type: "dropdown", required: true }
    ]
  },
  {
    title: "Team and Operations",
    fields: [
      { name: "numberOfEmployees", label: "Number of Employees", type: "number", required: true },
      { name: "teamExperience", label: "Team Experience (years)", type: "number", required: true }
    ]
  },
  {
    title: "Additional Information",
    fields: [
      { name: "businessScalability", label: "Business Scalability", type: "dropdown", required: false },
      { name: "currentCustomerBase", label: "Current Customer Base", type: "number", required: false },
      { name: "regulatoryCompliance", label: "Regulatory Compliance", type: "dropdown", required: false },
      { name: "ipProtectionStatus", label: "IP Protection Status", type: "dropdown", required: false }
    ]
  }
];

export function ValuationForm({ onResult }: { onResult: (data: ValuationFormData) => void }) {
  const { toast } = useToast();
  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessName: "",
      sector: "",
      industry: "",
      numberOfEmployees: 0,
      teamExperience: 0,
      currentCustomerBase: 0,
      businessScalability: "moderate",
      regulatoryCompliance: "notRequired",
      ipProtectionStatus: "none"
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: ValuationFormData) => {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      onResult(data);
      toast({
        title: "Success",
        description: "Valuation has been calculated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to calculate valuation",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-6 max-w-4xl mx-auto">
        {formSections.map((section) => (
          <CollapsibleSection
            key={section.title}
            title={section.title}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as keyof ValuationFormData}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        {field.type === "text" && (
                          <Input {...formField} required={field.required} />
                        )}
                        {field.type === "number" && (
                          <Input
                            type="number"
                            {...formField}
                            required={field.required}
                            onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        )}
                        {field.type === "dropdown" && (
                          <Select
                            onValueChange={formField.onChange}
                            defaultValue={formField.value}
                            required={field.required}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${field.label}`} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {field.name === "sector" && (
                                <>
                                  <SelectItem value="technology">Technology</SelectItem>
                                  <SelectItem value="healthcare">Healthcare</SelectItem>
                                  <SelectItem value="finance">Finance</SelectItem>
                                </>
                              )}
                              {field.name === "industry" && (
                                <>
                                  <SelectItem value="software">Software</SelectItem>
                                  <SelectItem value="biotech">Biotech</SelectItem>
                                  <SelectItem value="fintech">Fintech</SelectItem>
                                </>
                              )}
                              {field.name === "geographicMarkets" && (
                                <>
                                  <SelectItem value="local">Local</SelectItem>
                                  <SelectItem value="regional">Regional</SelectItem>
                                  <SelectItem value="national">National</SelectItem>
                                  <SelectItem value="international">International</SelectItem>
                                </>
                              )}
                              {field.name === "revenueModel" && (
                                <>
                                  <SelectItem value="subscription">Subscription</SelectItem>
                                  <SelectItem value="transactional">Transactional</SelectItem>
                                  <SelectItem value="marketplace">Marketplace</SelectItem>
                                  <SelectItem value="advertising">Advertising</SelectItem>
                                </>
                              )}
                              {field.name === "productStage" && (
                                <>
                                  <SelectItem value="concept">Concept</SelectItem>
                                  <SelectItem value="mvp">MVP</SelectItem>
                                  <SelectItem value="beta">Beta</SelectItem>
                                  <SelectItem value="production">Production</SelectItem>
                                </>
                              )}
                              {field.name === "businessScalability" && (
                                <>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </>
                              )}
                              {field.name === "regulatoryCompliance" && (
                                <>
                                  <SelectItem value="notRequired">Not Required</SelectItem>
                                  <SelectItem value="inProgress">In Progress</SelectItem>
                                  <SelectItem value="compliant">Compliant</SelectItem>
                                </>
                              )}
                              {field.name === "ipProtectionStatus" && (
                                <>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="registered">Registered</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </CollapsibleSection>
        ))}

        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full md:w-auto"
          >
            {mutation.isPending ? "Calculating..." : "Calculate Valuation"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ValuationForm;