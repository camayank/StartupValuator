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
  Building2,
  PieChart,
  Briefcase,
  Lightbulb,
} from "lucide-react";

export function LandingPage() {
  const industryCards = [
    {
      id: 'saas',
      name: 'SaaS & Technology',
      metrics: ['MRR/ARR', 'CAC', 'LTV', 'Churn Rate'],
      icon: Calculator,
    },
    {
      id: 'ecommerce',
      name: 'E-commerce & D2C',
      metrics: ['GMV', 'AOV', 'CLV', 'Inventory Turnover'],
      icon: Building2,
    },
    {
      id: 'fintech',
      name: 'Fintech',
      metrics: ['GTV', 'Take Rate', 'Unit Economics', 'CAC Payback'],
      icon: TrendingUp,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Software',
      metrics: ['ARR', 'NRR', 'Sales Cycle', 'Enterprise Value'],
      icon: Briefcase,
    },
  ];

  const valuationFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning models analyze market data, industry trends, and growth patterns",
    },
    {
      icon: Target,
      title: "Industry-Specific Models",
      description: "Tailored valuation approaches for different sectors and business models",
    },
    {
      icon: Globe,
      title: "Global Compliance",
      description: "Region-specific frameworks including 409A, IFRS, and ICAI standards",
    },
    {
      icon: Shield,
      title: "Risk Assessment",
      description: "Comprehensive risk analysis and mitigation strategies",
    },
  ];

  const roleBenefits = [
    {
      role: "Founders",
      icon: Lightbulb,
      benefits: [
        "Data-driven fundraising strategy",
        "Real-time valuation updates",
        "Investor-ready reports",
        "Growth metrics tracking",
      ],
    },
    {
      role: "Investors",
      icon: PieChart,
      benefits: [
        "Deal flow analysis",
        "Portfolio monitoring",
        "Investment thesis validation",
        "Market comparables",
      ],
    },
    {
      role: "Valuers",
      icon: BarChart3,
      benefits: [
        "Automated calculations",
        "Compliance frameworks",
        "Audit trails",
        "Professional reports",
      ],
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
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Next-Gen Valuation Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI-Powered Startup Valuations
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get precise, industry-specific valuations powered by advanced AI and real market data
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Valuation <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Demo
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
                <span>Global Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry-Specific Models */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Industry-Specific Valuation Models</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI adapts to your industry's unique metrics and valuation standards
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryCards.map((industry) => (
              <Card key={industry.id} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <industry.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-4">{industry.name}</h3>
                  <ul className="space-y-2">
                    {industry.metrics.map((metric) => (
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

      {/* Role-Based Features */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tailored for Every Stakeholder</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for founders, investors, and valuation professionals
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {roleBenefits.map((role) => (
              <Card key={role.role} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <role.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-4">{role.role}</h3>
                  <ul className="space-y-3">
                    {role.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-1 text-primary" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Valuation Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Advanced Valuation Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools powered by artificial intelligence and market data
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
            Ready to Get Your Startup Valued?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of founders and investors using our platform for accurate valuations
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