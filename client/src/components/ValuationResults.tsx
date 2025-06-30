import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle, CheckCircle, Download, Award, BarChart3, Target, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="outline" className="mb-2">
          <Award className="mr-1 h-3 w-3" />
          Valuation Complete
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold">Your Startup Valuation</h2>
        <p className="text-lg text-muted-foreground">
          Professional AI-powered analysis with industry benchmarking
        </p>
      </div>

      {/* Main Valuation Result */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="text-4xl md:text-6xl font-bold text-primary mb-2">
                {formatCurrency(result.valuation)}
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                Estimated Company Valuation
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "px-3 py-1",
                    result.confidence >= 0.7 ? "border-green-200 bg-green-50 text-green-700" :
                    result.confidence >= 0.5 ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                    "border-red-200 bg-red-50 text-red-700"
                  )}
                >
                  <Target className="mr-1 h-3 w-3" />
                  {getConfidenceLabel(result.confidence)} Confidence
                </Badge>
                <div className="flex items-center gap-2">
                  <Progress value={result.confidence * 100} className="w-24 h-2" />
                  <span className="text-sm font-medium">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodology Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Valuation Methods
            </CardTitle>
            <CardDescription>
              Multiple approaches ensure accuracy and reliability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(result.methodologies).map(([method, value]) => {
                const percentage = (value / result.valuation) * 100;
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {method.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(value)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      {percentage.toFixed(1)}% weight
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Analysis Summary
            </CardTitle>
            <CardDescription>
              Key insights from our AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{result.analysis.summary}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations and Risks */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommendations */}
        {result.analysis.recommendations.length > 0 && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                Strategic Recommendations
              </CardTitle>
              <CardDescription>
                Actions to enhance your valuation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm text-green-800 leading-relaxed">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Risks */}
        {result.analysis.risks.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-5 w-5" />
                Risk Considerations
              </CardTitle>
              <CardDescription>
                Factors that may impact valuation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.analysis.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mt-0.5">
                      <AlertTriangle className="h-3 w-3 text-yellow-600" />
                    </div>
                    <span className="text-sm text-yellow-800 leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={onStartOver} variant="outline" className="flex-1">
              Start New Valuation
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90">
              <Download className="mr-2 h-4 w-4" />
              Download Professional Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert className="border-amber-200 bg-amber-50/50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Professional Disclaimer:</strong> This valuation is an AI-generated estimate based on the information provided and industry benchmarks. It should be used as a starting point for discussions and due diligence. For investment decisions, please consult with qualified financial professionals and conduct comprehensive analysis.
        </AlertDescription>
      </Alert>
    </div>
  );
}