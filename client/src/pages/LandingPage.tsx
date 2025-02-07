import { Button } from "@/components/ui/button";
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
  LineChart,
  PieChart
} from "lucide-react";

export function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms provide accurate valuations"
    },
    {
      icon: BarChart3,
      title: "Market Analytics",
      description: "Real-time market data and competitor analysis"
    },
    {
      icon: LineChart,
      title: "Growth Metrics",
      description: "Track and analyze key growth indicators"
    },
    {
      icon: PieChart,
      title: "Financial Insights",
      description: "Comprehensive financial analysis and projections"
    }
  ];

  const benefits = [
    {
      title: "For Startups",
      description: "Get accurate valuations and insights for fundraising",
      points: [
        "AI-powered valuation models",
        "Competitor analysis",
        "Growth trajectory insights",
        "Investment readiness score"
      ]
    },
    {
      title: "For Investors",
      description: "Make data-driven investment decisions",
      points: [
        "Deal flow analysis",
        "Risk assessment",
        "Market comparison",
        "Due diligence tools"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI-Powered Startup Valuations
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Get accurate, data-driven valuations for your startup in minutes using advanced AI and real market data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?mode=signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Valuation <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/calculator">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Try Calculator
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span>Global Market Data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Valuation Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative p-6 rounded-lg bg-card border transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Tailored for Your Needs
            </h2>
            <p className="text-muted-foreground">
              Whether you're a startup founder or investor, we have the tools you need
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 rounded-lg bg-card border">
                <h3 className="text-2xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground mb-6">{benefit.description}</p>
                <ul className="space-y-3">
                  {benefit.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-1" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Value Your Startup?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of founders making data-driven decisions with our platform
          </p>
          <Link href="/auth?mode=signup">
            <Button
              size="lg"
              variant="secondary"
              className="min-w-[200px]"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}