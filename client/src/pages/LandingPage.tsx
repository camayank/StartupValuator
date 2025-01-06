import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  BarChart3,
  Calculator,
  FileText,
  Users,
  Lock,
  TrendingUp,
  Shield,
  Globe,
  ChevronRight,
  Check,
  Brain,
  Target,
  LineChart,
  Sparkles,
} from "lucide-react";

export function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Driven Analysis",
      description: "Get accurate valuations powered by advanced machine learning models",
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Real-time market data and industry benchmarks",
    },
    {
      icon: Target,
      title: "Industry-Specific Models",
      description: "Tailored valuation models for your sector",
    },
    {
      icon: Shield,
      title: "Compliance Ready",
      description: "Region-specific compliance (409A, IFRS, ICAI)",
    },
  ];

  const valuationBenefits = [
    "Dynamic Industry Benchmarks",
    "Regional Compliance Standards",
    "Real-time Market Multiples",
    "Growth Potential Analysis",
    "Risk Assessment Metrics",
    "AI-Powered Projections",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Valuation Focus */}
      <section className="relative overflow-hidden bg-primary/5 border-b">
        <div className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20">
          <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700"></div>
          <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
        </div>
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Powered by Advanced AI</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI-Powered Startup Valuation Platform
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get precise, data-driven valuations for your startup in minutes. Trusted by over 10,000 founders and investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Value Your Startup <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Pricing
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
                <span>99.9% Accuracy Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span>Global Market Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valuation Benefits Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              The Most Advanced Startup Valuation Platform
            </h2>
            <p className="text-muted-foreground">
              Get comprehensive valuations backed by real market data and AI-powered analytics
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-6">
              {valuationBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Why Choose Our Platform?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <span className="font-semibold">AI-Powered Precision</span>
                    <p className="text-sm text-muted-foreground">
                      Our AI models analyze vast market data to provide accurate valuations
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <span className="font-semibold">Secure & Confidential</span>
                    <p className="text-sm text-muted-foreground">
                      Enterprise-grade security for your sensitive financial data
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <LineChart className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <span className="font-semibold">Real-time Market Data</span>
                    <p className="text-sm text-muted-foreground">
                      Access to latest market multiples and industry benchmarks
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-accent/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Advanced Valuation Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-none bg-transparent">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <feature.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
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
            Ready to Know Your Startup's True Value?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of founders making data-driven decisions with our valuation platform
          </p>
          <Link href="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="min-w-[200px]">
              Start Free Valuation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}