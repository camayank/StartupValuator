import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Brain,
  Calculator,
  FileText,
  Users,
  Lock,
  TrendingUp,
  Shield,
  Globe,
  ChevronRight,
  Check,
  LineChart,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export function LandingPage() {
  const valuationFeatures = [
    {
      icon: Brain,
      title: "Advanced AI Analysis",
      description: "Our AI analyzes 100+ data points across market trends, industry benchmarks, and growth metrics",
    },
    {
      icon: Calculator,
      title: "Multiple Valuation Methods",
      description: "DCF, Market Comparables, First Chicago Method, and more tailored to your industry",
    },
    {
      icon: Globe,
      title: "Region-Specific Standards",
      description: "Compliant with ICAI, 409A, IFRS standards for global acceptance",
    },
    {
      icon: Shield,
      title: "Comprehensive Reports",
      description: "Detailed analysis, risk assessment, and growth projections in one report",
    },
  ];

  const reportHighlights = [
    {
      icon: LineChart,
      title: "Financial Analysis",
      metrics: [
        "Revenue & Growth Metrics",
        "Cash Flow Projections",
        "Unit Economics",
        "Market Size Analysis"
      ]
    },
    {
      icon: TrendingUp,
      title: "Valuation Methods",
      metrics: [
        "Industry-Specific Models",
        "Multiple Scenarios",
        "Risk Adjustments",
        "Growth Projections"
      ]
    },
    {
      icon: Brain,
      title: "AI Insights",
      metrics: [
        "Market Comparables",
        "Growth Potential",
        "Risk Factors",
        "Success Metrics"
      ]
    },
    {
      icon: Shield,
      title: "Due Diligence Ready",
      metrics: [
        "Compliance Checks",
        "Data Validation",
        "Audit Trail",
        "Documentation"
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20">
          <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
        </div>
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered Startup Valuation</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get Your Startup Valuation Report in Minutes
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional valuation reports powered by AI. Our platform analyzes your data using industry-specific models to deliver accurate valuations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/valuation">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Generate Your Valuation Report
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sample-report">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  View Sample Report
                  <FileText className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <span>5-Minute Process</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Professional Reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Professional Valuation Reports</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive reports with detailed analysis, market insights, and growth projections
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportHighlights.map((highlight) => (
              <Card key={highlight.title} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <highlight.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-4">{highlight.title}</h3>
                  <ul className="space-y-2">
                    {highlight.metrics.map((metric) => (
                      <li key={metric} className="flex items-center text-sm text-muted-foreground">
                        <Check className="h-4 w-4 mr-2 text-primary" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced AI technology combined with industry expertise for accurate valuations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuationFeatures.map((feature) => (
              <Card key={feature.title} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready for Your Professional Valuation Report?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Get your detailed valuation report with market insights and growth projections
          </p>
          <Link href="/valuation">
            <Button size="lg" variant="secondary" className="min-w-[200px] gap-2">
              Generate Your Report Now
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}