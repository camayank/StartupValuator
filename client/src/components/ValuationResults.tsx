import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle, CheckCircle, Download } from 'lucide-react';

interface ValuationResult {
  valuation: number;
  confidence: number;
  methodologies: Record<string, number>;
  analysis: {
    summary: string;
    recommendations: string[];
    risks: string[];
  };
}

interface ValuationResultsProps {
  result: ValuationResult;
  onStartOver: () => void;
}

export function ValuationResults({ result, onStartOver }: ValuationResultsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: amount >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Main Valuation Result */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {formatCurrency(result.valuation)}
          </CardTitle>
          <CardDescription>Estimated Company Valuation</CardDescription>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className={getConfidenceColor(result.confidence)}>
              {getConfidenceLabel(result.confidence)} Confidence
            </Badge>
            <Progress value={result.confidence * 100} className="w-32" />
            <span className="text-sm text-muted-foreground">
              {Math.round(result.confidence * 100)}%
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Methodology Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Valuation Methods
          </CardTitle>
          <CardDescription>
            Breakdown of different valuation methodologies used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(result.methodologies).map(([method, value]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="capitalize">{method.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-semibold">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{result.analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {result.analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {result.analysis.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.analysis.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={onStartOver} variant="outline" className="flex-1">
          Start New Valuation
        </Button>
        <Button className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          This valuation is an estimate based on the information provided and should not be used as the sole basis for investment decisions. Please consult with financial professionals for comprehensive analysis.
        </AlertDescription>
      </Alert>
    </div>
  );
}