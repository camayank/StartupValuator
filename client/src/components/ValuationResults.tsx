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
  RefreshCw,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Sparkles,
  Target,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

  const formatCompact = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    return formatCurrency(value);
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

  // Prepare chart data
  const methodologyData = Object.entries(result.methodologies).map(([name, value]) => ({
    name: name.replace(' Method', '').replace(' Valuation', ''),
    value: value,
    percentage: ((value / result.valuation) * 100).toFixed(1)
  }));

  const rangeData = [
    {
      name: 'Conservative',
      value: result.aiInsights?.valuationAnalysis?.valuationRange?.conservative || result.range?.low || result.valuation * 0.7,
      fill: '#f59e0b'
    },
    {
      name: 'Base Case',
      value: result.valuation,
      fill: '#3b82f6'
    },
    {
      name: 'Aggressive',
      value: result.aiInsights?.valuationAnalysis?.valuationRange?.aggressive || result.range?.high || result.valuation * 1.3,
      fill: '#10b981'
    }
  ];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* AI Failure Warning Banner */}
      {result.transparency && !result.transparency.aiEnrichmentUsed && (
        <motion.div
          className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                ⚠️ AI Analysis Unavailable
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                We're using industry benchmarks only. Your valuation may be less accurate without AI-powered market analysis and financial projections.
              </p>
              <p className="text-xs text-yellow-700">
                <strong>Recommendation:</strong> Connect your Anthropic API key for 200+ data point analysis and enhanced accuracy.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Premium Header */}
      <motion.div
        className="text-center space-y-4 mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="h-4 w-4 text-primary mr-2" />
          <span className="text-sm font-medium text-primary">
            AI-Powered Professional Analysis
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
          Your Valuation Report
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analyzed using methodologies from <span className="font-semibold text-primary">Aswath Damodaran (NYU)</span>, <span className="font-semibold text-primary">Sam Altman (OpenAI)</span>, and <span className="font-semibold text-primary">Elon Musk's</span> first principles approach
        </p>
      </motion.div>

      {/* Main Valuation Result with Animation */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
              Estimated Valuation
            </CardTitle>
            <motion.div
              className="text-6xl md:text-7xl font-bold text-primary mb-6"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
            >
              {formatCurrency(result.valuation)}
            </motion.div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className={`text-sm px-4 py-2 ${getConfidenceColor(result.confidence)}`}
              >
                <Target className="h-4 w-4 mr-2" />
                {getConfidenceLabel(result.confidence)} ({Math.round(result.confidence * 100)}%)
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
                <Award className="h-4 w-4 mr-2" />
                Professional Grade
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Valuation Range Visualization */}
            <div className="p-6 bg-gradient-to-r from-muted/30 to-muted/50 rounded-xl border border-primary/10">
              <p className="text-sm font-semibold text-center mb-4">📊 Valuation Range Analysis</p>
              <div className="grid grid-cols-3 gap-6 text-center mb-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-xs text-muted-foreground mb-2">Conservative</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCompact(result.aiInsights?.valuationAnalysis?.valuationRange?.conservative || result.range?.low || result.valuation * 0.7)}
                  </p>
                  <p className="text-xs text-orange-500 mt-1">70% of base</p>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-xs text-muted-foreground mb-2">Base Case</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCompact(result.valuation)}
                  </p>
                  <p className="text-xs text-primary mt-1">Recommended</p>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <p className="text-xs text-muted-foreground mb-2">Aggressive</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCompact(result.aiInsights?.valuationAnalysis?.valuationRange?.aggressive || result.range?.high || result.valuation * 1.3)}
                  </p>
                  <p className="text-xs text-green-500 mt-1">130% of base</p>
                </motion.div>
              </div>
              {/* Bar Chart for Range Visualization */}
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={rangeData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip formatter={(value) => formatCompact(Number(value))} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {rangeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Confidence Progress */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Confidence Score</span>
                <span className="font-bold text-primary">{Math.round(result.confidence * 100)}%</span>
              </div>
              <Progress value={result.confidence * 100} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Based on data quality, industry benchmarks, and AI analysis depth
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Methodology Breakdown with Pie Chart */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Valuation Methodologies Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={methodologyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {methodologyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* List View */}
              <div className="space-y-4">
                {Object.entries(result.methodologies).map(([method, value], index) => (
                  <motion.div
                    key={method}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-sm">{method}</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{formatCompact(value)}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analysis Summary */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              AI Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {result.analysis?.summary || result.aiInsights?.marketInsights?.positioning || "Your startup valuation has been calculated using industry benchmarks and AI-powered analysis tailored to your business stage and market position."}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendations */}
      {result.analysis?.recommendations && result.analysis.recommendations.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.analysis.recommendations.map((rec, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Risks */}
      {result.analysis?.risks && result.analysis.risks.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.analysis.risks.map((risk, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{risk}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          size="lg"
          onClick={onStartOver}
          className="gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Start New Valuation
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="gap-2"
          onClick={() => window.print()}
        >
          <Download className="h-5 w-5" />
          Download Report
        </Button>
      </motion.div>

      {/* Disclaimers */}
      {result.transparency?.disclaimers && result.transparency.disclaimers.length > 0 && (
        <motion.div
          className="text-xs text-muted-foreground space-y-2 border-t pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="font-semibold">Disclaimers:</p>
          {result.transparency.disclaimers.map((disclaimer, i) => (
            <p key={i}>• {disclaimer}</p>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
