import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FinancialProjectionData } from "@/lib/validations";

interface MarketValidationStepProps {
  data: Partial<FinancialProjectionData>;
  onUpdate: (data: Partial<FinancialProjectionData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function MarketValidationStep({ data, onUpdate, onNext, onBack }: MarketValidationStepProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    status: 'success' | 'warning' | 'error';
    message: string;
    details?: {
      marketSize?: string;
      growthRate?: string;
      competitorAnalysis?: string;
      recommendations?: string[];
    };
  } | null>(null);
  const { toast } = useToast();

  const handleValidate = async () => {
    try {
      setIsValidating(true);
      
      // Call the market validation API
      const response = await fetch('/api/market/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projections: data,
          industry: data.industry,
          region: data.region
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const results = await response.json();
      setValidationResults(results);

      // Update the data with validation results
      onUpdate({
        ...data,
        marketValidation: results
      });

      toast({
        title: "Validation Complete",
        description: "Market validation analysis has been completed successfully.",
      });

    } catch (error) {
      console.error('Market validation failed:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Failed to validate market data",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Market Data Validation</h3>
                <Button
                  onClick={handleValidate}
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating
                    </>
                  ) : (
                    'Validate Projections'
                  )}
                </Button>
              </div>

              {validationResults && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  validationResults.status === 'success' ? 'bg-green-50 border-green-200' :
                  validationResults.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {validationResults.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    )}
                    <div className="space-y-2">
                      <p className="font-medium">{validationResults.message}</p>
                      {validationResults.details && (
                        <div className="space-y-3 text-sm">
                          {validationResults.details.marketSize && (
                            <div>
                              <Label>Market Size Analysis</Label>
                              <p className="text-muted-foreground">{validationResults.details.marketSize}</p>
                            </div>
                          )}
                          {validationResults.details.growthRate && (
                            <div>
                              <Label>Growth Rate Analysis</Label>
                              <p className="text-muted-foreground">{validationResults.details.growthRate}</p>
                            </div>
                          )}
                          {validationResults.details.competitorAnalysis && (
                            <div>
                              <Label>Competitor Analysis</Label>
                              <p className="text-muted-foreground">{validationResults.details.competitorAnalysis}</p>
                            </div>
                          )}
                          {validationResults.details.recommendations && (
                            <div>
                              <Label>Recommendations</Label>
                              <ul className="list-disc list-inside text-muted-foreground">
                                {validationResults.details.recommendations.map((rec, index) => (
                                  <li key={index}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!validationResults}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
