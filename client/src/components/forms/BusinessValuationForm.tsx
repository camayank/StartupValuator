import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { type ValuationFormData, valuationFormSchema } from "@/lib/validations";
import { useState } from "react";

// Form sections for step-by-step input
const formSections = [
  {
    id: "business-overview",
    title: "Business Overview",
    description: "Let's start with some basic information about your business",
    fields: ["businessName", "sector", "stage", "region", "valuationPurpose"],
  },
  {
    id: "financial-metrics",
    title: "Financial Metrics",
    description: "Tell us about your business's financial performance",
    fields: ["revenue", "currency", "growthRate", "margins", "annualProfit"],
  },
  {
    id: "market-insights",
    title: "Market Insights",
    description: "Help us understand your market position",
    fields: ["totalAddressableMarket", "activeCustomers", "competitiveDifferentiation"],
  },
  {
    id: "risk-scalability",
    title: "Risk & Scalability",
    description: "Assess your business's risks and growth potential",
    fields: ["primaryRiskFactor", "cashFlowStability", "scalabilityPotential"],
  },
  {
    id: "compliance",
    title: "Jurisdictional Compliance",
    description: "Ensure compliance with regional standards",
    fields: ["complianceStandards", "ipProtection", "taxCompliance"],
  },
  {
    id: "qualitative",
    title: "Qualitative Factors",
    description: "Tell us about your team and impact",
    fields: ["teamExperience", "founderCredentials", "esgImpact"],
  },
];

// Tooltips for form fields
const fieldTooltips: Record<string, string> = {
  businessName: "The legal or trading name of your business",
  sector: "The primary industry your business operates in",
  stage: "Current development stage of your business",
  growthRate: "Expected annual revenue growth as a percentage",
  margins: "Operating profit as a percentage of revenue",
  totalAddressableMarket: "Total market size in your target region",
  scalabilityPotential: "How easily can your business scale operations",
  teamExperience: "Combined years of relevant experience in your team",
};

export function BusinessValuationForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const progress = ((currentSection + 1) / formSections.length) * 100;

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessName: "",
      revenue: 0,
      growthRate: 0,
      margins: 0,
      scalabilityPotential: 5,
      teamExperience: 0,
    },
  });

  const onSubmit = async (data: ValuationFormData) => {
    try {
      const response = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit valuation");
      }

      // Handle successful submission
      const result = await response.json();
      console.log("Valuation result:", result);
    } catch (error) {
      console.error("Valuation error:", error);
    }
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
      <CardHeader>
        <CardTitle>{formSections[currentSection].title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formSections[currentSection].description}
        </p>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <div className="space-y-4">
              {currentFields.map((field) => (
                <div key={field} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={field}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </label>
                    {fieldTooltips[field] && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>{fieldTooltips[field]}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  {/* Add specific form controls based on field type */}
                  {/* This will be expanded in the next iteration */}
                </div>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goToPrevSection}
              disabled={currentSection === 0}
            >
              Previous
            </Button>
            {currentSection === formSections.length - 1 ? (
              <Button type="submit">Submit Valuation</Button>
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
