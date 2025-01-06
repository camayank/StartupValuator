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
} from "lucide-react";

export function LandingPage() {
  const features = [
    {
      icon: Calculator,
      title: "Smart Valuation",
      description: "AI-powered valuation tools for accurate business assessments",
    },
    {
      icon: BarChart3,
      title: "Financial Analytics",
      description: "Deep insights into your business metrics and performance",
    },
    {
      icon: FileText,
      title: "Pitch Perfect",
      description: "Generate compelling pitch decks with proven templates",
    },
    {
      icon: Users,
      title: "Expert Network",
      description: "Connect with investors, valuers, and consultants",
    },
    {
      icon: Lock,
      title: "Secure Platform",
      description: "Enterprise-grade security for your sensitive data",
    },
    {
      icon: TrendingUp,
      title: "Growth Insights",
      description: "Predictive analytics for business growth",
    },
    {
      icon: Shield,
      title: "Compliance Ready",
      description: "Stay compliant with regulatory requirements",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Access international markets and opportunities",
    },
  ];

  const roles = [
    {
      title: "Startups",
      description: "Value your startup, create pitch decks, and track growth metrics",
      cta: "Start Growing",
    },
    {
      title: "Investors",
      description: "Evaluate opportunities, manage portfolio, and track performance",
      cta: "Start Investing",
    },
    {
      title: "Valuers",
      description: "Professional tools for accurate business valuations",
      cta: "Start Valuing",
    },
    {
      title: "Consultants",
      description: "Comprehensive tools for client advisory services",
      cta: "Start Advising",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Financial Intelligence for Modern Business
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Empower your business decisions with AI-driven valuation tools and comprehensive financial analytics
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth?mode=login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-accent/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powerful Features for Every Need
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

      {/* Role-specific Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tailored Solutions for Every Role
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <Card key={index} className="relative group hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center h-full">
                    <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                    <p className="text-muted-foreground mb-6">{role.description}</p>
                    <Link href="/auth?mode=signup" className="mt-auto">
                      <Button className="w-full group-hover:bg-primary/90">
                        {role.cta}
                      </Button>
                    </Link>
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
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses making smarter financial decisions with our platform
          </p>
          <Link href="/auth?mode=signup">
            <Button size="lg" variant="secondary">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
