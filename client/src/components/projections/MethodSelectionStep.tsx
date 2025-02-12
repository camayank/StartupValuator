import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { ValuationData } from "@/lib/types";

interface ValuationMethod {
  name: string;
  description: string;
  suitableFor: string[];
  weightRange: string;
  icon: string;
}

const valuationMethods: Record<string, ValuationMethod> = {
  dcf: {
    name: "Discounted Cash Flow (DCF)",
    description: "Values a company based on projected future cash flows",
    suitableFor: ["revenue_growth", "established", "predictable_cash_flow"],
    weightRange: "30-50%",
    icon: "📈"
  },
  marketComparables: {
    name: "Market Comparables",
    description: "Values based on similar companies' metrics",
    suitableFor: ["public_comps", "industry_standard", "established"],
    weightRange: "20-40%",
    icon: "🔍"
  },
  firstChicago: {
    name: "First Chicago Method",
    description: "Combines multiple scenarios for early-stage valuations",
    suitableFor: ["early_stage", "high_uncertainty", "multiple_scenarios"],
    weightRange: "15-30%",
    icon: "🎯"
  },
  ventureCapital: {
    name: "Venture Capital Method",
    description: "Based on expected exit value and required ROI",
    suitableFor: ["startup", "high_growth", "pre_revenue"],
    weightRange: "25-45%",
    icon: "🚀"
  },
  scorecard: {
    name: "Scorecard Method",
    description: "Compares to similar startups with adjustments",
    suitableFor: ["early_stage", "limited_financials", "qualitative"],
    weightRange: "10-25%",
    icon: "📊"
  },
  assetBased: {
    name: "Asset-Based Valuation",
    description: "Values based on company's net asset value",
    suitableFor: ["asset_heavy", "stable", "low_growth"],
    weightRange: "5-15%",
    icon: "💰"
  }
};

interface MethodSelectionStepProps {
  data: Partial<ValuationData>;
  onUpdate: (data: Partial<ValuationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function MethodSelectionStep({
  data,
  onUpdate,
  onNext,
  onBack
}: MethodSelectionStepProps) {
  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    data.selectedMethods?.methods || []
  );

  const form = useForm<Partial<ValuationData>>({
    defaultValues: {
      selectedMethods: {
        methods: data.selectedMethods?.methods || [],
        weights: data.selectedMethods?.weights || {},
        justification: data.selectedMethods?.justification || ""
      }
    },
  });

  // Calculate recommended methods based on business profile
  const getRecommendedMethods = () => {
    const recommendations: string[] = [];
    const businessInfo = data.businessInfo;
    const financialData = data.financialData;

    if (!businessInfo || !financialData) return recommendations;

    if (financialData.revenue > 1000000) {
      recommendations.push("dcf");
    }

    if (businessInfo.productStage === "growth" || businessInfo.productStage === "expansion") {
      recommendations.push("marketComparables", "ventureCapital");
    }

    if (businessInfo.productStage === "concept" || businessInfo.productStage === "prototype") {
      recommendations.push("scorecard", "firstChicago");
    }

    if (businessInfo.sector === "manufacturing" || businessInfo.sector === "real_estate") {
      recommendations.push("assetBased");
    }

    return recommendations;
  };

  const recommendedMethods = getRecommendedMethods();

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev => {
      const newSelection = prev.includes(methodId)
        ? prev.filter(m => m !== methodId)
        : [...prev, methodId];

      form.setValue("selectedMethods", {
        ...data.selectedMethods,
        methods: newSelection,
      });
      return newSelection;
    });
  };

  const handleSubmit = (values: Partial<ValuationData>) => {
    if (selectedMethods.length === 0) {
      form.setError("selectedMethods", {
        type: "manual",
        message: "Please select at least one valuation method"
      });
      return;
    }

    onUpdate({
      ...values,
      selectedMethods: {
        ...values.selectedMethods,
        methods: selectedMethods,
      },
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Select the valuation methods most appropriate for your business.
          Recommended methods are highlighted based on your profile.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(valuationMethods).map(([id, method]) => (
              <Card
                key={id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedMethods.includes(id) && "ring-2 ring-primary",
                  "relative"
                )}
                onClick={() => handleMethodToggle(id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{method.icon}</span>
                      <CardTitle className="text-lg">
                        {method.name}
                      </CardTitle>
                    </div>
                    {recommendedMethods.includes(id) && (
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Weight Range: {method.weightRange}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {method.suitableFor.map((trait) => (
                        <Badge key={trait} variant="outline">
                          {trait.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedMethods.includes(id) && (
                    <CheckCircle2 className="absolute bottom-2 right-2 h-5 w-5 text-primary" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {form.formState.errors.selectedMethods && (
            <p className="text-sm text-destructive mt-2">
              {form.formState.errors.selectedMethods.message}
            </p>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}