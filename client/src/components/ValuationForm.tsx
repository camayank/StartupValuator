import { useState, useEffect } from "react";
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
import { valuationFormSchema, sectors, revenueModels, productStages, geographicMarkets } from "@/lib/validations";
import type { ValuationFormData } from "@/lib/validations";
import { useFormAutoSave } from "@/hooks/use-form-autosave";
import { ErrorDisplay } from "@/components/ui/error-display";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import BusinessRulesEngine from "@/lib/business-rules-engine";

// Define form sections with field configurations
const formSections = [
  {
    title: "Basic Information",
    description: "Core details about your business",
    fields: [
      { name: "businessName", label: "Business Name", type: "text", required: true },
      { name: "sector", label: "Business Sector", type: "dropdown", required: true, options: Object.entries(sectors).map(([key, value]) => ({ value: key, label: value.name })) },
      { name: "industry", label: "Industry", type: "dropdown", required: true, depends: "sector", getOptions: (sector: string) => 
        Object.entries(sectors[sector]?.subsectors || {}).map(([key, label]) => ({ value: key, label }))
      }
    ]
  },
  {
    title: "Market Information",
    description: "Your market presence and business model",
    fields: [
      { 
        name: "geographicMarkets", 
        label: "Geographic Markets", 
        type: "dropdown", 
        required: true,
        options: Object.entries(geographicMarkets).map(([key, label]) => ({ value: key, label }))
      },
      { 
        name: "revenueModel", 
        label: "Revenue Model", 
        type: "dropdown", 
        required: true,
        options: Object.entries(revenueModels).map(([key, label]) => ({ value: key, label }))
      },
      { 
        name: "productStage", 
        label: "Product Stage", 
        type: "dropdown", 
        required: true,
        options: Object.entries(productStages).map(([key, label]) => ({ value: key, label }))
      }
    ]
  },
  {
    title: "Team and Operations",
    description: "Details about your team and operational scale",
    fields: [
      { name: "employeeCount", label: "Number of Employees", type: "number", required: true, min: 1 },
      { name: "teamExperience", label: "Team Experience", type: "slider", required: true }
    ]
  },
  {
    title: "Financial Metrics",
    description: "Key financial indicators",
    fields: [
      { name: "revenue", label: "Annual Revenue", type: "number", required: true, min: 0 },
      { name: "growthRate", label: "Growth Rate", type: "slider", required: true },
      { name: "margins", label: "Profit Margins", type: "slider", required: true }
    ]
  }
];

export function ValuationForm({ onResult }: { onResult: (data: ValuationFormData) => void }) {
  const { toast } = useToast();
  const [validations, setValidations] = useState<Map<string, BusinessRulesEngine.ValidationResult>>(new Map());

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessName: "",
      sector: "technology",
      industry: "software_enterprise",
      stage: "ideation_validated",
      employeeCount: 1,
      fundingHistory: {
        rounds: [],
        totalRaised: 0
      },
      revenueModel: "subscription",
      geographicMarkets: ["local"],
      productStage: "concept",
      intellectualProperty: "none",
      revenue: 0,
      teamExperience: 0,
      customerBase: 0,
      competitiveDifferentiation: "medium",
      regulatoryCompliance: "notRequired",
      scalability: "moderate",
      currency: "USD",
      growthRate: 0,
      margins: 0,
      region: "global",
      valuationPurpose: "fundraising",
      complianceStandard: "",
    },
  });

  // Watch form values for validation
  const formValues = form.watch();
  useEffect(() => {
    const validationResults = BusinessRulesEngine.validateForm(formValues);
    setValidations(validationResults);
  }, [formValues]);

  // Initialize auto-save functionality
  const { loadSavedData, clearSavedData } = useFormAutoSave(formValues);

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadSavedData();
    if (savedData) {
      try {
        const parsedData = valuationFormSchema.parse(savedData);
        Object.keys(parsedData).forEach((key) => {
          form.setValue(key as keyof ValuationFormData, parsedData[key as keyof ValuationFormData]);
        });
      } catch (error) {
        console.error('Invalid saved form data:', error);
        clearSavedData();
      }
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: ValuationFormData) => {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      clearSavedData();
      onResult(data);
      toast({
        title: "Success",
        description: "Your startup valuation has been calculated.",
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

  // Render field based on its type
  const renderField = (field: any) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as keyof ValuationFormData}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {field.type === "text" && (
                <Input {...formField} />
              )}
              {field.type === "number" && (
                <Input
                  type="number"
                  {...formField}
                  onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : 0)}
                  min={field.min}
                />
              )}
              {field.type === "dropdown" && (
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === "slider" && (
                <SmartSlider
                  label={field.label}
                  value={formField.value}
                  onChange={value => formField.onChange(value)}
                  min={field.name === "growthRate" ? 0 : -50}
                  max={field.name === "growthRate" ? 200 : 100}
                  step={5}
                  className="mb-6"
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-4 max-w-4xl mx-auto">
        <ErrorDisplay
          validations={validations}
          onDismiss={() => setValidations(new Map())}
        />

        {formSections.map((section) => (
          <CollapsibleSection
            key={section.title}
            title={section.title}
            description={section.description}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map(renderField)}
            </div>
          </CollapsibleSection>
        ))}

        <div className="flex justify-end gap-4 mt-6">
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};