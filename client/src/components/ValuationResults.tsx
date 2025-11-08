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
  currency?: string;
  range?: {
    low: number;
    high: number;
  };
  transparency?: {
    aiEnrichmentUsed: boolean;
    methodsUsed: string[];
    dataQuality: string;
    disclaimers: string[];
  };
  metadata?: {
    isPreRevenue?: boolean;
    disclaimers?: string[];
  };
}

interface ValuationResultsProps {
  result: ValuationResult;
  onStartOver: () => void;
}

export function ValuationResults({ result, onStartOver }: ValuationResultsProps) {
  // Use the currency from the result, default to INR for India-focused platform
  const currency = result.currency || 'INR';
  
  const formatCurrency = (value: number) => {
    // Determine locale based on currency
    const locale = currency === 'INR' ? 'en-IN' : 
                   currency === 'EUR' ? 'de-DE' :
                   currency === 'GBP' ? 'en-GB' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
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
      {/* Premium Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Your Professional Valuation Report
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analyzed using methodologies from Aswath Damodaran (NYU), Sam Altman (OpenAI), and Elon Musk's first principles approach
        </p>
      </div>

      {/* Main Valuation Result */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-xl">
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
          {result.aiInsights?.valuationAnalysis && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm font-semibold text-center mb-3">Valuation Range Analysis</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Conservative</p>
                  <p className="text-base font-semibold text-orange-600">
                    {formatCurrency(result.aiInsights.valuationAnalysis.valuationRange?.conservative || result.range?.low || result.valuation * 0.7)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Base Case</p>
                  <p className="text-base font-semibold text-primary">
                    {formatCurrency(result.aiInsights.valuationAnalysis.valuationRange?.base || result.valuation)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Aggressive</p>
                  <p className="text-base font-semibold text-green-600">
                    {formatCurrency(result.aiInsights.valuationAnalysis.valuationRange?.aggressive || result.range?.high || result.valuation * 1.3)}
                  </p>
                </div>
              </div>
            </div>
          )}
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
              {(result.analysis?.recommendations || result.aiInsights?.recommendations?.nextMilestones || result.factors || ['Continue building and validating your business model']).map((rec: string, index: number) => (
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
              {(result.analysis?.risks || result.aiInsights?.marketInsights?.keyRisks || ['General market risks apply']).map((risk: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Startup Quality Scores (Musk + Altman perspective) */}
      {result.aiInsights?.startupQuality && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Startup Quality Assessment
            </CardTitle>
            <p className="text-sm text-muted-foreground">Expert analysis combining founder quality, technology moat, and scalability potential</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground mb-2">Founder Quality</p>
                <p className="text-3xl font-bold text-purple-600">{result.aiInsights.startupQuality.founderQualityScore || 'N/A'}/10</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground mb-2">Technology Moat</p>
                <p className="text-3xl font-bold text-blue-600">{result.aiInsights.startupQuality.technologyMoatScore || 'N/A'}/10</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background border">
                <p className="text-sm text-muted-foreground mb-2">Scalability</p>
                <p className="text-3xl font-bold text-green-600">{result.aiInsights.startupQuality.scalabilityScore || 'N/A'}/10</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded">
              <p className="text-sm"><span className="font-semibold">Product-Market Fit:</span> {result.aiInsights.startupQuality.productMarketFitStage || 'Assessing'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5-Year Growth Trajectory (Damodaran DCF approach) */}
      {result.aiInsights?.growthProjections && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              5-Year Growth Trajectory
            </CardTitle>
            <p className="text-sm text-muted-foreground">Revenue projections based on industry benchmarks and growth patterns</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(year => {
                const revenue = result.aiInsights.growthProjections[`year${year}Revenue`];
                return (
                  <div key={year} className="text-center p-3 rounded-lg bg-background border">
                    <p className="text-xs text-muted-foreground mb-1">Year {year}</p>
                    <p className="text-sm font-semibold">{revenue ? formatCurrency(revenue) : 'N/A'}</p>
                  </div>
                );
              })}
            </div>
            <div className="p-3 bg-muted/50 rounded">
              <p className="text-sm"><span className="font-semibold">Growth Pattern:</span> {result.aiInsights.growthProjections.growthType || 'Linear'}</p>
              {result.aiInsights.growthProjections.keyGrowthDrivers && (
                <p className="text-sm mt-1"><span className="font-semibold">Key Drivers:</span> {result.aiInsights.growthProjections.keyGrowthDrivers.join(', ')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Insights & Comparable Companies */}
      {result.aiInsights?.strategicInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Strategic Insights & Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-sm mb-2">Key Strengths:</p>
              <ul className="text-sm space-y-1">
                {result.aiInsights.strategicInsights.keyStrengths?.map((strength: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            {result.aiInsights.strategicInsights.fundingStrategy && (
              <div className="p-3 bg-primary/5 rounded-lg">
                <p className="font-semibold text-sm mb-1">Funding Strategy:</p>
                <p className="text-sm text-muted-foreground">{result.aiInsights.strategicInsights.fundingStrategy}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparable Companies (Damodaran comparative valuation) */}
      {result.aiInsights?.comparableCompanies?.similarCompanies && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Comparable Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              {result.aiInsights.comparableCompanies.similarCompanies.map((company: string, idx: number) => (
                <li key={idx} className="text-sm p-2 bg-background rounded border">
                  {company}
                </li>
              ))}
            </ul>
            {result.aiInsights.comparableCompanies.typicalValuations && (
              <div className="p-3 bg-muted/50 rounded">
                <p className="text-sm text-muted-foreground">{result.aiInsights.comparableCompanies.typicalValuations}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transparency & Disclaimers */}
      {(result.transparency || result.metadata?.disclaimers) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Data Quality Indicator */}
            {result.transparency && (
              <div className="p-3 bg-background/80 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Data Quality:</span>
                  <Badge variant={result.transparency.aiEnrichmentUsed ? "default" : "secondary"}>
                    {result.transparency.dataQuality}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.transparency.aiEnrichmentUsed ? (
                    <>✨ AI enrichment used to analyze your startup with 200+ data points</>
                  ) : (
                    <>📊 Based on industry benchmarks - connect with API key for enhanced AI analysis</>
                  )}
                </p>
              </div>
            )}
            
            {/* Methodology Used */}
            {result.transparency?.methodsUsed && (
              <div className="p-3 bg-background/80 rounded-lg border">
                <p className="text-sm font-medium mb-2">Valuation Methods Applied:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {result.transparency.methodsUsed.map((method, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      {method}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Pre-revenue indicator */}
            {result.metadata?.isPreRevenue && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Pre-Revenue Startup:</strong> Valuation based on team quality, technology maturity, and market opportunity rather than financial metrics.
                </p>
              </div>
            )}
            
            {/* Legal Disclaimers */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-amber-900">Disclaimers:</p>
              <ul className="text-xs text-amber-800 space-y-1.5">
                {(result.transparency?.disclaimers || result.metadata?.disclaimers || []).map((disclaimer, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{disclaimer}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

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