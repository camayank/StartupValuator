import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { valuationFormSchema, type ValuationFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Steps } from "./Steps";
import { BusinessInfoStep } from "./steps/BusinessInfoStep";
import { FinancialMetricsStep } from "./steps/FinancialMetricsStep";
import { MarketMetricsStep } from "./steps/MarketMetricsStep";
import { RiskAssessmentStep } from "./steps/RiskAssessmentStep";
import { ValuationResultsStep } from "./steps/ValuationResultsStep";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  "Business Information",
  "Financial Metrics",
  "Market Analysis",
  "Risk Assessment",
  "Results"
] as const;

export default function ValuationWizard() {
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  const form = useForm<ValuationFormData>({
    resolver: zodResolver(valuationFormSchema),
    defaultValues: {
      businessName: "",
      sector: "technology",
      stage: "early_revenue",
      region: "us",
      currency: "USD",
      valuationPurpose: "fundraising",
      revenue: 0,
      growthRate: 0,
      margins: 0,
      teamExperience: 0,
      intellectualProperty: "none",
      customerBase: 0,
      competitiveDifferentiation: "low",
      regulatoryCompliance: "notRequired",
      scalability: "limited",
      complianceStandard: "409a",
      totalAddressableMarket: 0,
      marketShare: 0,
      competitors: [],
    }
  });

  const { mutate: submitValuation, isLoading } = useMutation({
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
    onSuccess: (data) => {
      toast({
        title: "Valuation Complete",
        description: "Your startup valuation has been calculated successfully.",
      });
      // Update form with results
      form.setValue("valuation", data.valuation);
      form.setValue("details", data.details);
      // Move to results step
      setStep(STEPS.length - 1);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ValuationFormData) {
    if (step === STEPS.length - 2) {
      submitValuation(data);
    } else {
      setStep((prev) => prev + 1);
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Startup Valuation Wizard</CardTitle>
        </CardHeader>
        <CardContent>
          <Steps currentStep={step} steps={STEPS} />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 0 && <BusinessInfoStep />}
              {step === 1 && <FinancialMetricsStep />}
              {step === 2 && <MarketMetricsStep />}
              {step === 3 && <RiskAssessmentStep />}
              {step === 4 && <ValuationResultsStep />}

              <div className="flex justify-between">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((prev) => prev - 1)}
                  >
                    Previous
                  </Button>
                )}
                
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {step === STEPS.length - 2 ? "Calculate Valuation" : "Next"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
