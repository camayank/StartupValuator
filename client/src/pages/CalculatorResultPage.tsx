import { useEffect, useState } from "react";
import { useNavigate, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  TrendingUp,
  Lightbulb,
  FileText,
  Share2,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { SocialShare } from "@/components/ui/social-share";

interface ValuationResult {
  valuation: {
    conservative: number;
    recommended: number;
    optimistic: number;
  };
  method: string;
  methodName: string;
  confidence: {
    level: 'low' | 'moderate' | 'high';
    percentage: number;
    description: string;
  };
  breakdown: Record<string, any>;
  improvementTips: Array<{
    tip: string;
    impact: string;
    estimatedIncrease: string;
  }>;
  nextSteps: Array<{
    title: string;
    description: string;
    price: string;
    benefit: string;
  }>;
}

export function CalculatorResultPage() {
  const [, navigate] = useNavigate();
  const [result, setResult] = useState<ValuationResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('quickCalculatorResult');
    if (!stored) {
      navigate('/');
      return;
    }

    try {
      setResult(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to parse result:', error);
      navigate('/');
    }
  }, [navigate]);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(0)} Lakhs`;
  };

  const confidenceColor = {
    low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    moderate: 'bg-blue-100 text-blue-800 border-blue-200',
    high: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Calculator
            </Button>
            <Link href="/auth/signup">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Valuation Result Card */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary-600 to-purple-600 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6" />
                <CardTitle className="text-2xl">Your Estimated Valuation</CardTitle>
              </div>
              <CardDescription className="text-primary-100">
                Based on {result.methodName}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              {/* Main Valuation */}
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {formatCurrency(result.valuation.recommended)}
                </div>
                <p className="text-gray-600">Recommended Valuation</p>
              </div>

              {/* Valuation Range */}
              <div className="mb-8">
                <div className="flex justify-between mb-2 text-sm font-medium">
                  <span className="text-gray-600">Conservative</span>
                  <span className="text-gray-600">Recommended</span>
                  <span className="text-gray-600">Optimistic</span>
                </div>
                <div className="relative h-3 bg-gradient-to-r from-yellow-200 via-green-200 to-blue-200 rounded-full">
                  <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex justify-between mt-2 text-sm font-semibold">
                  <span>{formatCurrency(result.valuation.conservative)}</span>
                  <span className="text-primary-600">{formatCurrency(result.valuation.recommended)}</span>
                  <span>{formatCurrency(result.valuation.optimistic)}</span>
                </div>
              </div>

              {/* Confidence Level */}
              <div className={`p-4 rounded-lg border-2 ${confidenceColor[result.confidence.level]}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.confidence.level === 'high' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-semibold">
                      Confidence Level: {result.confidence.level.charAt(0).toUpperCase() + result.confidence.level.slice(1)}
                    </span>
                  </div>
                  <Badge variant="outline">{result.confidence.percentage}%</Badge>
                </div>
                <Progress value={result.confidence.percentage} className="mb-2" />
                <p className="text-sm">{result.confidence.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Important Note */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-lg text-orange-900">Important Note</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-orange-800">
              <p className="mb-4">
                This is a rough estimate based on limited information. For investor-grade valuation,
                create a detailed report with comprehensive analysis.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {result.nextSteps.map((step, index) => (
                  <Card key={index} className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-primary-600">{step.price}</div>
                          <div className="text-sm text-gray-600">{step.benefit}</div>
                        </div>
                        <Link href={step.price === 'Free' ? '/auth/signup' : '/auth/signup'}>
                          <Button>
                            {step.price === 'Free' ? 'Sign Up' : 'Get Started'}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Tips */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <CardTitle>How to Improve Your Valuation</CardTitle>
              </div>
              <CardDescription>
                Actionable steps to increase your startup's value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.improvementTips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-900 mb-1">{tip.tip}</h4>
                      <p className="text-sm text-gray-600 mb-2">{tip.impact}</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {tip.estimatedIncrease}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Share Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                <CardTitle>Share Your Results</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Email Results
                </Button>
                <SocialShare
                  url={window.location.href}
                  title={`My startup valuation: ${formatCurrency(result.valuation.recommended)}`}
                  description="Get your free startup valuation estimate"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                sessionStorage.removeItem('quickCalculatorResult');
                navigate('/');
              }}
            >
              Calculate Again
            </Button>
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                <FileText className="w-5 h-5" />
                Get Detailed Report
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
