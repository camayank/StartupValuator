import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3,
  Download,
  RefreshCw 
} from 'lucide-react';

interface ValuationResult {
  valuation: number;
  confidence: number;
  methodologies: Record<string, number>;
  analysis?: {
    summary: string;
    recommendations: string[];
    risks: string[];
  };
  aiInsights?: any;
  factors?: string[];
}

interface ValuationResultsProps {
  result: ValuationResult;
  onStartOver: () => void;
}

export function ValuationResults({ result, onStartOver }: ValuationResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="space-y-8">
      {/* Main Valuation Result */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl mb-4">
            <DollarSign className="h-8 w-8 text-primary" />
            Estimated Valuation
          </CardTitle>
          <div className="text-5xl md:text-6xl font-bold text-primary mb-4">
            {formatCurrency(result.valuation)}
          </div>
          <Badge 
            variant="outline" 
            className={`text-sm px-3 py-1 ${getConfidenceColor(result.confidence)}`}
          >
            {getConfidenceLabel(result.confidence)} ({Math.round(result.confidence * 100)}%)
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Confidence Score</span>
                <span>{Math.round(result.confidence * 100)}%</span>
              </div>
              <Progress value={result.confidence * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Methodology Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Valuation Methodologies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(result.methodologies).map(([method, value]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="font-medium">{method}</span>
                <span className="text-lg font-semibold">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {result.analysis?.summary || result.aiInsights?.marketInsights?.positioning || "Your startup valuation has been calculated using industry benchmarks and AI-powered analysis."}
          </p>
        </CardContent>
      </Card>

      {/* Recommendations & Risks */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(result.analysis?.recommendations || result.aiInsights?.recommendations?.nextMilestones || result.factors || ['Continue building and validating your business model']).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {(result.analysis?.risks || result.aiInsights?.marketInsights?.keyRisks || ['General market risks apply']).map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          onClick={onStartOver}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          New Valuation
        </Button>
        
        <Button 
          className="flex items-center gap-2"
          onClick={() => {
            // Generate and download report
            const reportData = {
              valuation: result.valuation,
              confidence: result.confidence,
              methodologies: result.methodologies,
              analysis: result.analysis,
              timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(reportData, null, 2)], {
              type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'valuation-report.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>
    </div>
  );
}