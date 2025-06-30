import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BusinessInfoForm } from './forms/BusinessInfoForm';
import { FinancialMetricsForm } from './forms/FinancialMetricsForm';
import { MarketAnalysisForm } from './forms/MarketAnalysisForm';
import { ValuationResults } from './ValuationResults';
import { useValuation } from '@/hooks/useValuation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const steps = [
  { id: 0, title: 'Business Info', description: 'Company details' },
  { id: 1, title: 'Financial Metrics', description: 'Revenue and growth' },
  { id: 2, title: 'Market Analysis', description: 'Market opportunity' },
  { id: 3, title: 'Results', description: 'Valuation results' },
];

export function ValuationWizardContainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const { data, result, calculateValuation, reset, error, isLoading } = useValuation();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCalculateValuation = async () => {
    try {
      await calculateValuation();
      setCurrentStep(3); // Move to results step
    } catch (error) {
      console.error('Valuation calculation failed:', error);
    }
  };

  const handleStartOver = () => {
    reset();
    setCurrentStep(0);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Startup Valuation Calculator</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="space-y-6">
        {currentStep === 0 && (
          <BusinessInfoForm onNext={handleNext} />
        )}

        {currentStep === 1 && (
          <FinancialMetricsForm 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}

        {currentStep === 2 && (
          <MarketAnalysisForm 
            onNext={handleCalculateValuation} 
            onBack={handleBack} 
          />
        )}

        {currentStep === 3 && result && (
          <ValuationResults 
            result={result} 
            onStartOver={handleStartOver} 
          />
        )}
      </div>

      {/* Data Debug (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Debug: Current Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({ data, result }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}