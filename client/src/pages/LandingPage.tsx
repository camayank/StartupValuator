import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Brain,
  Calculator,
  FileText,
  Shield,
  Globe,
  ChevronRight,
  Check,
  LineChart,
  ArrowUpRight,
  Building2,
  Sparkles,
  Gauge,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

export function LandingPage() {
  const valuationFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning models analyze 100+ data points across market trends, industry benchmarks, and growth metrics for accurate valuations",
    },
    {
      icon: Calculator,
      title: "Multiple Valuation Methods",
      description: "Comprehensive analysis using DCF, Market Comparables, First Chicago Method, and industry-specific approaches",
    },
    {
      icon: Shield,
      title: "Global Compliance",
      description: "Adherence to international standards including ICAI, 409A, IFRS, and regional compliance frameworks",
    },
    {
      icon: Gauge,
      title: "Real-Time Insights",
      description: "Dynamic updates based on market conditions, industry trends, and company performance metrics",
    },
  ];

  const reportHighlights = [
    {
      icon: LineChart,
      title: "Financial Analysis",
      metrics: [
        "Industry-Specific Metrics",
        "Growth Rate Analysis",
        "Margin Comparisons",
        "Cash Flow Projections"
      ]
    },
    {
      icon: Target,
      title: "Market Analysis",
      metrics: [
        "TAM/SAM/SOM Analysis",
        "Competitor Benchmarking",
        "Market Positioning",
        "Growth Opportunities"
      ]
    },
    {
      icon: Award,
      title: "Risk Assessment",
      metrics: [
        "Risk Factor Analysis",
        "Mitigation Strategies",
        "Scenario Planning",
        "Sensitivity Analysis"
      ]
    },
    {
      icon: Brain,
      title: "AI Insights",
      metrics: [
        "Growth Predictions",
        "Investment Readiness",
        "Strategic Recommendations",
        "Valuation Drivers"
      ]
    },
  ];

  const testimonials = [
    {
      quote: "The AI-powered insights helped us secure our Series A funding with confidence.",
      author: "Sarah Chen",
      role: "Founder, TechStack AI",
    },
    {
      quote: "Professional-grade valuations that meet compliance standards across regions.",
      author: "Michael Rodriguez",
      role: "Investment Director, Global Ventures",
    },
    {
      quote: "Game-changing platform for startup valuations. Saved us weeks of work.",
      author: "David Park",
      role: "CEO, HealthTech Solutions",
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Intelligent Startup Valuation Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              AI-Powered Startup Valuations in Minutes
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get professional-grade valuation reports powered by AI and industry-specific insights. Trusted by founders, investors, and advisors globally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/valuation">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90">
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
                <Check className="h-5 w-5 text-primary" />
                <span>5-Minute Process</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Industry-Specific Models</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Global Compliance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Intelligent Valuation Engine</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform combines multiple valuation methods with real-time market data to deliver accurate and compliant valuations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuationFeatures.map((feature) => (
              <Card key={feature.title} className="relative overflow-hidden hover:shadow-lg transition-shadow">
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

      {/* Report Components */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Valuation Reports</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade reports with detailed analysis, market insights, and growth projections
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportHighlights.map((highlight) => (
              <Card key={highlight.title} className="relative overflow-hidden hover:shadow-lg transition-shadow">
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

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Startups Globally</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of founders and investors who trust our platform for accurate valuations
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 text-primary">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
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
            Ready to Get Your Startup Valued?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Generate your comprehensive valuation report with industry-specific insights and compliance standards
          </p>
          <Link href="/valuation">
            <Button size="lg" variant="secondary" className="min-w-[200px] gap-2">
              Start Your Valuation Now
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}