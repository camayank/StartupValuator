import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BusinessInfoForm } from '@/components/BusinessInfoForm';
import { FinancialMetricsForm } from '@/components/FinancialMetricsForm';
import { MarketAnalysisForm } from '@/components/MarketAnalysisForm';
import { ValuationResults } from './ValuationResults';
import { useValuation } from '@/hooks/useValuation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock, TrendingUp, BarChart3, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { 
    id: 0, 
    title: 'Business Information', 
    description: 'Company details and stage',
    icon: CheckCircle
  },
  { 
    id: 1, 
    title: 'Financial Metrics', 
    description: 'Revenue, growth, and expenses',
    icon: TrendingUp
  },
  { 
    id: 2, 
    title: 'Market Analysis', 
    description: 'Market size and competition',
    icon: BarChart3
  },
  { 
    id: 3, 
    title: 'Valuation Results', 
    description: 'AI-powered valuation analysis',
    icon: Target
  },
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-4">
            Professional Valuation
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            AI-Powered Startup Valuation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get accurate, professional-grade valuations in minutes with our advanced AI platform
          </p>
        </div>

        {/* Step Progress */}
        <Card className="border-0 bg-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Progress</span>
                <Badge variant="secondary">{Math.round(progress)}% Complete</Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            <Progress value={progress} className="h-2 mb-6" />
            
            {/* Steps Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div 
                    key={step.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                      isCurrent ? "bg-primary text-primary-foreground" : "bg-background",
                      isCompleted ? "opacity-75" : ""
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      isCurrent ? "bg-primary-foreground text-primary" : "bg-muted",
                      isCompleted ? "bg-green-100 text-green-600" : ""
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-sm font-medium",
                        isCurrent ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {step.title}
                      </p>
                      <p className={cn(
                        "text-xs",
                        isCurrent ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

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