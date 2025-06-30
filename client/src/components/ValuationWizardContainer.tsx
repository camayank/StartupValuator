import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useValuation } from '@/hooks/useValuation';
import { BusinessInfoForm } from './BusinessInfoForm';
import { FinancialMetricsForm } from './FinancialMetricsForm';
import { MarketAnalysisForm } from './MarketAnalysisForm';
import { ValuationResults } from './ValuationResults';

const steps = [
  { id: 'business-info', title: 'Business Information', description: 'Company details and industry' },
  { id: 'financials', title: 'Financial Metrics', description: 'Revenue and growth data' },
  { id: 'market', title: 'Market Analysis', description: 'Market size and competition' },
  { id: 'results', title: 'Valuation Results', description: 'AI-powered analysis' }
];

export function ValuationWizardContainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const { calculateValuation, reset, isLoading, error, result } = useValuation();

  const [formData, setFormData] = useState({
    businessInfo: { name: '', industry: '', stage: '', location: '' },
    financials: { revenue: 0, growth: 0, expenses: 0, teamSize: 0 },
    market: { marketSize: 0, competitors: 0, marketShare: 0 }
  });

  useEffect(() => {
    if (error) {
      console.error('Valuation error:', error);
    }
  }, [error]);

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

  const handleSubmit = async () => {
    await calculateValuation(formData);
    setCurrentStep(steps.length - 1);
  };

  const handleStartOver = () => {
    reset();
    setCurrentStep(0);
    setFormData({
      businessInfo: { name: '', industry: '', stage: '', location: '' },
      financials: { revenue: 0, growth: 0, expenses: 0, teamSize: 0 },
      market: { marketSize: 0, competitors: 0, marketShare: 0 }
    });
  };

  const updateBusinessInfo = (data: typeof formData.businessInfo) => {
    setFormData(prev => ({ ...prev, businessInfo: data }));
  };

  const updateFinancials = (data: typeof formData.financials) => {
    setFormData(prev => ({ ...prev, financials: data }));
  };

  const updateMarket = (data: typeof formData.market) => {
    setFormData(prev => ({ ...prev, market: data }));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Startup Valuation Calculator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get a professional valuation for your startup using advanced AI analysis and market data
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-lg">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center space-x-3 ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : index === currentStep ? (
                  <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground text-center text-sm">
                    {index + 1}
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Steps */}
      <Card>
        <CardContent className="p-8">
          {currentStep === 0 && (
            <BusinessInfoForm 
              data={formData.businessInfo}
              onUpdate={updateBusinessInfo}
              onNext={handleNext}
            />
          )}
          
          {currentStep === 1 && (
            <FinancialMetricsForm 
              data={formData.financials}
              onUpdate={updateFinancials}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          
          {currentStep === 2 && (
            <MarketAnalysisForm 
              data={formData.market}
              onUpdate={updateMarket}
              onSubmit={handleSubmit}
              onBack={handleBack}
              isLoading={isLoading}
            />
          )}
          
          {currentStep === 3 && result && (
            <ValuationResults 
              result={result}
              onStartOver={handleStartOver}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}