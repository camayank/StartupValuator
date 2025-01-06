import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { CompetitiveAdvantages } from "@/components/CompetitiveAdvantages";
import { RoleBasedFeatures } from "@/components/RoleBasedFeatures";
import { EnterpriseSolutions } from "@/components/EnterpriseSolutions";
import { PricingSection } from "@/components/PricingSection";
import { LaunchTimeline } from "@/components/LaunchTimeline";
import { IndustryVerticals } from "@/components/IndustryVerticals";
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
} from "lucide-react";

export function LandingPage() {
  const features = [
    {
      icon: Calculator,
      title: "AI-Powered Valuation",
      description: "Get accurate startup valuations using advanced machine learning algorithms",
    },
    {
      icon: BarChart3,
      title: "Financial Analytics",
      description: "Deep insights into your metrics and growth potential",
    },
    {
      icon: FileText,
      title: "Detailed Reports",
      description: "Comprehensive valuation reports with market analysis",
    },
    {
      icon: Users,
      title: "Expert Network",
      description: "Connect with investors and financial advisors",
    },
  ];

  const valuationBenefits = [
    "Industry-specific valuation models",
    "Real-time market comparables",
    "Growth potential analysis",
    "Risk assessment metrics",
    "Future cash flow projections",
    "Cap table modeling",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Valuation Focus */}
      <section className="relative overflow-hidden bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI-Powered Startup Valuation
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get an accurate, data-driven valuation for your startup in minutes. Trusted by over 10,000 founders and investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/valuation">
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

      {/* Benefits Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              The Most Advanced Startup Valuation Platform
            </h2>
            <p className="text-muted-foreground">
              Get a comprehensive valuation backed by real market data and AI-powered analytics
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
                  <TrendingUp className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <span className="font-semibold">Data-Driven Accuracy</span>
                    <p className="text-sm text-muted-foreground">
                      Our valuations are based on real market data and industry benchmarks
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
                  <Users className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <span className="font-semibold">Expert Support</span>
                    <p className="text-sm text-muted-foreground">
                      Get guidance from financial experts and valuation specialists
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Add CompetitiveAdvantages section */}
      <section className="bg-accent/5 border-y">
        <div className="container mx-auto px-4">
          <CompetitiveAdvantages />
        </div>
      </section>

      {/* Role-based Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <RoleBasedFeatures />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-accent/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Valuation Features
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

      {/* Industry Verticals section */}
      <section className="py-20 bg-accent/5 border-y">
        <div className="container mx-auto px-4">
          <IndustryVerticals />
        </div>
      </section>

      {/* Launch Timeline section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <LaunchTimeline />
        </div>
      </section>

      {/* Enterprise Solutions section */}
      <section className="py-20 bg-accent/5 border-y">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Enterprise-Grade Solutions
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Powerful tools for financial institutions and consulting firms with advanced integration capabilities
          </p>
          <EnterpriseSolutions />
        </div>
      </section>

      {/* Add Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <PricingSection />
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
          <Link href="/valuation">
            <Button size="lg" variant="secondary" className="min-w-[200px]">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}