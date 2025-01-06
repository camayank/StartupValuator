import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Brain,
  Calculator,
  FileText,
  Shield,
  Clock,
  ChevronRight,
  Check,
  LineChart,
  ArrowUpRight,
  Building2,
  Sparkles,
  Gauge,
  Target,
  Award,
  Globe,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export function LandingPage() {
  const valuationFeatures = [
    {
      icon: Clock,
      title: "5-Minute Valuation",
      description: "Go from zero to professional valuation report in just 5 minutes - faster than brewing your coffee",
    },
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Our advanced AI analyzes 100+ market signals, benchmarks, and growth metrics for unmatched accuracy",
    },
    {
      icon: Globe,
      title: "Global Standards",
      description: "Built-in compliance with ICAI, 409A, IFRS standards - trusted by regulators worldwide",
    },
    {
      icon: Zap,
      title: "Dynamic Updates",
      description: "Real-time market data integration keeps your valuation current and actionable",
    },
  ];

  const reportHighlights = [
    {
      icon: LineChart,
      title: "Professional Valuation",
      metrics: [
        "Multiple Valuation Methods",
        "Industry-Specific Models",
        "Growth Rate Analysis",
        "Real-Time Market Data"
      ]
    },
    {
      icon: Target,
      title: "Market Intelligence",
      metrics: [
        "TAM/SAM/SOM Analysis",
        "Competitive Positioning",
        "Market Opportunity Size",
        "Growth Trajectory"
      ]
    },
    {
      icon: Award,
      title: "Risk & Compliance",
      metrics: [
        "Regulatory Compliance",
        "Risk Factor Analysis",
        "Scenario Planning",
        "Audit-Ready Reports"
      ]
    },
    {
      icon: Brain,
      title: "AI-Driven Insights",
      metrics: [
        "Growth Predictions",
        "Investment Readiness",
        "Strategic Guidance",
        "Value Optimization"
      ]
    },
  ];

  const testimonials = [
    {
      quote: "This tool saved us weeks of work and helped us raise our Series A with confidence. The AI insights were spot-on.",
      author: "Sarah Chen",
      role: "Founder, TechStack AI",
      amount: "$12M Raised"
    },
    {
      quote: "Finally, a valuation platform that combines speed with institutional-grade analysis. Perfect for due diligence.",
      author: "Michael Rodriguez",
      role: "Investment Director, Global Ventures",
      amount: "50+ Deals Analyzed"
    },
    {
      quote: "The compliance features are a game-changer. Helps us meet standards across different jurisdictions effortlessly.",
      author: "David Park",
      role: "CEO, HealthTech Solutions",
      amount: "409A Compliant"
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6"
            >
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Zero to Valuation in 5 Minutes</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
            >
              Professional-Grade Startup Valuations, Powered by AI
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Transform your startup valuation process with institutional-grade analysis, real-time market data, and AI-driven insights. Trusted by founders, VCs, and advisors globally.
            </motion.p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/valuation">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90">
                  Start Your Valuation Now
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
                <span>VC-Grade Analysis</span>
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
            <h2 className="text-3xl font-bold mb-4">Revolutionary Valuation Engine</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combines advanced AI, real-time market data, and multiple valuation methodologies for unmatched accuracy
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuationFeatures.map((feature) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                key={feature.title}
              >
                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <feature.icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Components */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Institutional-Grade Reports</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every report includes comprehensive analysis, market insights, and actionable recommendations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportHighlights.map((highlight) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                key={highlight.title}
              >
                <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Industry Leaders</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of successful startups and investors who rely on our platform
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={index}
              >
                <Card className="relative overflow-hidden h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 text-primary">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                    <div className="mt-auto">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-sm text-primary mt-2 font-medium">{testimonial.amount}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to Transform Your Valuation Process?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Get your professional-grade valuation report in just 5 minutes. No complex spreadsheets. No waiting.
            </p>
            <Link href="/valuation">
              <Button size="lg" variant="secondary" className="min-w-[200px] gap-2">
                Start Your Valuation Now
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}