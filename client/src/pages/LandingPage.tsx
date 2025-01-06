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
  Target,
  LineChart,
  Sparkles,
  Building2,
  PieChart,
  Lightbulb,
  ScrollText,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

export function LandingPage() {
  const valuationFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Intelligent valuation models analyze market data, growth patterns, and industry benchmarks",
    },
    {
      icon: Target,
      title: "Industry-Specific Models",
      description: "Dynamic valuation approaches customized for your sector and business model",
    },
    {
      icon: Globe,
      title: "Global Standards",
      description: "Compliance with ICAI, 409A, IFRS standards across regions",
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Comprehensive risk evaluation with mitigation strategies",
    },
  ];

  const reportSections = [
    {
      icon: Calculator,
      title: "Intelligent Valuation",
      metrics: [
        "Multiple valuation methods",
        "Industry benchmarks",
        "Growth projections",
        "Risk adjustments"
      ]
    },
    {
      icon: PieChart,
      title: "Market Analysis",
      metrics: [
        "Competitive landscape",
        "Market size & growth",
        "Industry trends",
        "Regional factors"
      ]
    },
    {
      icon: LineChart,
      title: "Financial Insights",
      metrics: [
        "Key performance metrics",
        "Cash flow analysis",
        "Growth trajectory",
        "Margin analysis"
      ]
    },
    {
      icon: Shield,
      title: "Risk & Compliance",
      metrics: [
        "Risk assessment matrix",
        "Compliance checklist",
        "Regulatory standards",
        "Due diligence items"
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 border-b">
        <div className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20">
          <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
        </div>
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered Startup Valuations</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get Your Professional Startup Valuation Report in Minutes
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Intelligent analysis of your startup's value using industry-specific models, market data, and AI-driven insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/valuation">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Generate Valuation Report
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
                <Users className="h-5 w-5" />
                <span>10,000+ Startups Valued</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>99% Accuracy Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span>Bank-Grade Security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Sections */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Valuation Reports</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade reports with detailed analysis across key business dimensions
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportSections.map((section) => (
              <Card key={section.title} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <section.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.metrics.map((metric) => (
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

      {/* Features Section */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI-Powered Valuation Engine</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our intelligent system analyzes multiple data points to deliver accurate valuations
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
            Get Your Professional Valuation Report Today
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Make data-driven decisions with our comprehensive startup valuation analysis
          </p>
          <Link href="/valuation">
            <Button size="lg" variant="secondary" className="min-w-[200px] gap-2">
              Generate Your Report
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}