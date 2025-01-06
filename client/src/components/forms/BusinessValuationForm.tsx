import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { type ValuationFormData, valuationFormSchema } from "@/lib/validations";
import { useState, useEffect } from "react";
import * as Fields from "./FormFields";
import { Loader2 } from "lucide-react";

// Form sections with color coding
const formSections = [
  {
    id: "business-overview",
    title: "Business Overview",
    description: "Let's start with some basic information about your business",
    fields: ["businessName", "sector", "stage", "region", "valuationPurpose"],
    color: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "financial-metrics",
    title: "Financial Metrics",
    description: "Tell us about your business's financial performance",
    fields: ["revenue", "currency", "growthRate", "margins", "annualProfit"],
    color: "bg-green-50 dark:bg-green-950",
  },
  {
    id: "market-insights",
    title: "Market Insights",
    description: "Help us understand your market position",
    fields: ["totalAddressableMarket", "activeCustomers", "competitiveDifferentiation"],
    color: "bg-purple-50 dark:bg-purple-950",
  },
  {
    id: "risk-scalability",
    title: "Risk & Scalability",
    description: "Assess your business's risks and growth potential",
    fields: ["primaryRiskFactor", "cashFlowStability", "scalabilityPotential"],
    color: "bg-orange-50 dark:bg-orange-950",
  },
  {
    id: "compliance",
    title: "Jurisdictional Compliance",
    description: "Ensure compliance with regional standards",
    fields: ["complianceStandards", "ipProtection", "taxCompliance"],
    color: "bg-red-50 dark:bg-red-950",
  },
  {
    id: "qualitative",
    title: "Qualitative Factors",
    description: "Tell us about your team and impact",
    fields: ["teamExperience", "founderCredentials", "esgImpact"],
    color: "bg-teal-50 dark:bg-teal-950",
  },
];

const AUTOSAVE_DELAY = 1000; // 1 second

export function BusinessValuationForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const progress = ((currentSection + 1) / formSections.length) * 100;

  // Initialize form with stored data or defaults
  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: () => {
      const stored = localStorage.getItem('valuationFormData');
      return stored ? JSON.parse(stored) : {
        businessName: "",
        revenue: 0,
        growthRate: 0,
        margins: 0,
        scalabilityPotential: 5,
        teamExperience: 0,
      };
    },
  });

  // Auto-save functionality
  useEffect(() => {
    const values = form.getValues();
    const timeoutId = setTimeout(() => {
      localStorage.setItem('valuationFormData', JSON.stringify(values));
      setLastSaved(new Date());
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [form.watch()]);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: ValuationFormData) => {
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your valuation has been submitted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ValuationFormData) => {
    submitMutation.mutate(data);
  };

  const currentFields = formSections[currentSection].fields;

  const goToNextSection = () => {
    const isValid = currentFields.every((field) => {
      const fieldValue = form.getValues(field as any);
      return fieldValue !== undefined && fieldValue !== "";
    });

    if (isValid) {
      setCurrentSection((prev) => Math.min(prev + 1, formSections.length - 1));
    } else {
      form.trigger(currentFields as any[]);
    }
  };

  const goToPrevSection = () => {
    setCurrentSection((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className={formSections[currentSection].color}>
        <CardTitle>{formSections[currentSection].title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formSections[currentSection].description}
        </p>
        <Progress value={progress} className="mt-2" />
        {lastSaved && (
          <p className="text-xs text-muted-foreground mt-1">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-6">
            <div className="space-y-6">
              {currentFields.map((field) => {
                // Render appropriate field component based on field name
                const Component = Fields[`${field.charAt(0).toUpperCase()}${field.slice(1)}Field`];
                return Component ? (
                  <Component key={field} form={form} />
                ) : (
                  <Fields.TextFormField
                    key={field}
                    form={form}
                    name={field}
                    label={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  />
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between p-6">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevSection}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            {currentSection === formSections.length - 1 ? (
              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                className="min-w-[100px]"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            ) : (
              <Button type="button" onClick={goToNextSection}>
                Next
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}