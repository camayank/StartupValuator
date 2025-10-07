import React, { useState } from 'react';
import { SimpleValuationForm } from './SimpleValuationForm';
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
        <SimpleValuationForm onResult={handleResult} />
      )}
    </div>
  );
}
