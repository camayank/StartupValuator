import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ValuationFormData } from "@/lib/validations";

interface MethodSelectionStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function MethodSelectionStep({ data, onUpdate, onNext, onBack }: MethodSelectionStepProps) {
  // Determine recommended methods based on business profile
  const getRecommendedMethods = () => {
    const methods = [];

    // Early stage startups
    if (data.stage?.includes('ideation') || data.stage?.includes('mvp')) {
      methods.push({
        id: 'scorecard',
        name: 'Scorecard Method',
        description: 'Compares your startup to similar funded companies, adjusting the average valuation based on key criteria.',
        recommended: true,
      });
    }

    // Revenue generating companies
    if (data.stage?.includes('revenue')) {
      methods.push({
        id: 'dcf',
        name: 'Discounted Cash Flow (DCF)',
        description: 'Projects future cash flows and discounts them to present value, ideal for companies with predictable revenue.',
        recommended: true,
      });
    }

    // Technology or IP-heavy companies
    if (data.sector === 'technology' || data.intellectualProperty === 'registered') {
      methods.push({
        id: 'riskfactor',
        name: 'Risk Factor Summation',
        description: 'Evaluates various risk factors affecting the business, particularly suitable for tech startups.',
        recommended: data.sector === 'technology',
      });
    }

    // Companies with clear market comparables
    if (data.stage?.includes('established')) {
      methods.push({
        id: 'comparable',
        name: 'Market Comparables',
        description: 'Uses valuation multiples from similar companies in your industry.',
        recommended: true,
      });
    }

    // Always include venture capital method as a baseline
    methods.push({
      id: 'vc',
      name: 'Venture Capital Method',
      description: 'Estimates future value and applies discount rate based on investment stage.',
      recommended: true,
    });

    return methods;
  };

  const recommendedMethods = getRecommendedMethods();

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Based on your business profile, we've identified the most suitable valuation methods.
          Each method considers different aspects of your business to provide a comprehensive valuation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {recommendedMethods.map((method) => (
          <Card key={method.id} className={method.recommended ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{method.name}</CardTitle>
                {method.recommended && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <CardDescription>{method.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}