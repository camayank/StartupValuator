import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ValuationData {
  businessInfo?: any;
  financialMetrics?: any;
  marketAnalysis?: any;
  riskAssessment?: any;
}

interface ValuationResult {
  valuation: number;
  confidence: number;
  methodologies: Record<string, number>;
  analysis: any;
}

export function useValuation() {
  const [data, setData] = useState<ValuationData>({});
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateData = useCallback((stepId: string, stepData: any) => {
    setData(prev => ({
      ...prev,
      [stepId]: stepData
    }));
    setError(null);
  }, []);

  const saveData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save valuation data');
      }

      const result = await response.json();
      setResult(result);
      
      toast({
        title: "Success",
        description: "Valuation data saved successfully",
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [data, toast]);

  const calculateValuation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/valuation/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate valuation');
      }

      const result = await response.json();
      setResult(result);
      
      toast({
        title: "Valuation Complete",
        description: `Estimated valuation: $${result.valuation.toLocaleString()}`,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Calculation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [data, toast]);

  const reset = useCallback(() => {
    setData({});
    setResult(null);
    setError(null);
  }, []);

  return {
    data,
    result,
    isLoading,
    error,
    updateData,
    saveData,
    calculateValuation,
    reset,
  };
}