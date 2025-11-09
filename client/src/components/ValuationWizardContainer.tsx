import React, { useState } from 'react';
import { EnhancedValuationWizard } from './valuation/EnhancedValuationWizard';
import { ValuationResults } from './ValuationResults';

export function ValuationWizardContainer() {
  const [valuationResult, setValuationResult] = useState<any>(null);

  const handleResult = (result: any) => {
    setValuationResult(result);
  };

  const handleStartOver = () => {
    setValuationResult(null);
  };

  return (
    <div className="py-8">
      {valuationResult ? (
        <ValuationResults
          result={valuationResult}
          onStartOver={handleStartOver}
        />
      ) : (
        <EnhancedValuationWizard onResult={handleResult} />
      )}
    </div>
  );
}
