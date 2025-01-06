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

type ValuationMethod = {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
  weightRange: [number, number];
  suitable: boolean;
  reasonForRecommendation: string;
};

export function MethodSelectionStep({ data, onUpdate, onNext, onBack }: MethodSelectionStepProps) {
  // Get recommended methods based on business profile
  const getRecommendedMethods = (): ValuationMethod[] => {
    const methods: ValuationMethod[] = [];
    const stage = data.stage ?? '';
    const sector = data.sector ?? '';
    const purpose = data.valuationPurpose ?? '';

    const isEarlyStage = stage.includes('ideation') || stage.includes('mvp');
    const hasRevenue = stage.includes('revenue') || stage.includes('established');
    const isTech = sector === 'technology' || sector === 'digital';
    const isEnterprise = sector === 'enterprise';
    const isFundraising = purpose === 'fundraising';
    const isAcquisition = purpose === 'acquisition';
    const isCompliance = purpose === 'compliance';

    // DCF Method
    methods.push({
      id: 'dcf',
      name: 'Discounted Cash Flow (DCF)',
      description: 'Projects future cash flows and discounts them to present value using a risk-adjusted rate.',
      recommended: hasRevenue,
      weightRange: hasRevenue ? [0.3, 0.5] : [0.1, 0.2],
      suitable: hasRevenue,
      reasonForRecommendation: hasRevenue 
        ? 'Recommended due to established revenue streams and growth history'
        : 'Limited applicability due to lack of historical cash flows',
    });

    // Comparable Company Analysis
    methods.push({
      id: 'comparable',
      name: 'Market Comparables',
      description: 'Values the company based on trading multiples of similar public companies.',
      recommended: !isEarlyStage || isTech,
      weightRange: [0.2, 0.4],
      suitable: true,
      reasonForRecommendation: isTech 
        ? 'Strong comparable set available in technology sector'
        : 'Provides market-based validation',
    });

    // First Chicago Method
    methods.push({
      id: 'firstChicago',
      name: 'First Chicago Method',
      description: 'Combines multiple scenarios (best, base, worst case) weighted by probability.',
      recommended: isFundraising || isAcquisition,
      weightRange: [0.1, 0.3],
      suitable: true,
      reasonForRecommendation: 'Provides comprehensive scenario analysis for investment decisions',
    });

    // Venture Capital Method
    methods.push({
      id: 'vc',
      name: 'Venture Capital Method',
      description: 'Projects exit value and applies appropriate discount rate based on stage.',
      recommended: isEarlyStage || isFundraising,
      weightRange: [0.2, 0.4],
      suitable: true,
      reasonForRecommendation: isEarlyStage 
        ? 'Particularly suitable for early-stage companies seeking investment'
        : 'Provides perspective on potential exit values',
    });

    // Scorecard Method
    methods.push({
      id: 'scorecard',
      name: 'Scorecard Method',
      description: 'Compares to similar funded companies with adjustments for key success factors.',
      recommended: isEarlyStage,
      weightRange: [0.1, 0.3],
      suitable: isEarlyStage,
      reasonForRecommendation: isEarlyStage 
        ? 'Effective for early-stage companies with limited financial history'
        : 'Less relevant for established companies',
    });

    // Asset-Based Approach
    methods.push({
      id: 'asset',
      name: 'Asset-Based Approach',
      description: 'Values the company based on its net asset value with adjustments.',
      recommended: isCompliance || isEnterprise,
      weightRange: [0.1, 0.2],
      suitable: true,
      reasonForRecommendation: isCompliance 
        ? 'Provides solid basis for compliance valuations'
        : 'Considers tangible and intangible assets',
    });

    return methods;
  };

  const methods = getRecommendedMethods();
  const recommendedMethods = methods.filter(m => m.recommended);

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
        {methods.map((method) => (
          <Card 
            key={method.id} 
            className={`transition-colors ${
              method.recommended 
                ? "border-primary bg-primary/5" 
                : "hover:border-primary/50"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {method.name}
                    {method.recommended && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p><strong>Weight Range:</strong> {method.weightRange[0] * 100}% - {method.weightRange[1] * 100}%</p>
                <p className="mt-1"><strong>Why:</strong> {method.reasonForRecommendation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between space-x-4 mt-6">
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