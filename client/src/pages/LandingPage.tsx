import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandHeader } from "@/components/ui/brand-header";
import { SocialShare } from "@/components/ui/social-share";
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
  PieChart,
  Zap,
  Target,
  Award,
  ArrowRight,
  Star,
  Building2,
  DollarSign,
  Sparkles,
  Gift
} from "lucide-react";
import { motion } from "framer-motion";

export function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Valuation",
      description: "Advanced machine learning algorithms analyze 200+ data points for precise startup valuations",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Real-Time Market Data",
      description: "Live market intelligence and competitor benchmarking across 50+ industries",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance with SOC 2 and GDPR standards",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: TrendingUp,
      title: "Growth Forecasting",
      description: "Predictive modeling for revenue, market share, and funding requirements",
      color: "from-purple-500 to-pink-600"
    }
  ];

  const benefits = [
    {
      icon: Building2,
      title: "For Startups",
      description: "Accelerate fundraising with professional-grade valuations",
      points: [
        "Instant AI-powered valuations with 95% accuracy",
        "Industry-specific benchmarking and analysis",
        "Investor-ready reports and presentations",
        "Growth scenario modeling and projections"
      ],
      cta: "Start Valuation",
      ctaHref: "/valuation/calculator"
    },
    {
      icon: Users,
      title: "For Investors",
      description: "Make confident decisions with comprehensive deal analysis",
      points: [
        "Due diligence automation and risk assessment",
        "Portfolio company performance tracking",
        "Market opportunity sizing and validation",
        "Comparable transaction analysis"
      ],
      cta: "View Dashboard",
      ctaHref: "/dashboard"
    },
    {
      icon: Award,
      title: "For Advisors",
      description: "Deliver expert consulting with data-driven insights",
      points: [
        "White-label valuation reports for clients",
        "Advanced analytics and market intelligence",
        "Regulatory compliance and audit trails",
        "Multi-currency and international support"
      ],
      cta: "View Analytics",
      ctaHref: "/analytics"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Startups Valued", icon: Building2 },
    { value: "$50B+", label: "Total Valuations", icon: DollarSign },
    { value: "95%", label: "Accuracy Rate", icon: Target },
    { value: "24/7", label: "Platform Uptime", icon: Shield }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-muted/20"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-green-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <motion.div 
          className="container mx-auto px-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">
                AI-Powered Startup Valuation Platform
              </span>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Professional
              </span>
              <br />
              <span className="text-foreground">Startup Valuations</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Get accurate, data-driven valuations for your startup in minutes using advanced AI and real market data.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/valuation/calculator">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Free Valuation 
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <SocialShare 
                title="ValuationPro - Get Your Startup Valued in Minutes!"
                description="I just found this amazing AI-powered startup valuation platform. Get accurate, investor-ready valuations for FREE!"
                variant="outline"
                size="lg"
              />
            </motion.div>

            <motion.div 
              className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item} className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>AI-Powered Analysis</span>
              </motion.div>
              <motion.div variants={item} className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Enterprise Security</span>
              </motion.div>
              <motion.div variants={item} className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span>Global Market Data</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={item}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Referral Banner */}
      <section className="py-4 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 border-y">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Gift className="h-6 w-6 text-primary flex-shrink-0" />
            <p className="text-sm md:text-base font-medium">
              <span className="font-bold text-primary">Share & Earn:</span> Refer friends and unlock premium features for free!
            </p>
            <SocialShare 
              title="ValuationPro - Free Startup Valuation Tool"
              description="Check out this amazing AI-powered startup valuation platform! Get your startup valued for FREE 🚀"
              size="sm"
              showLabel={false}
            />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-accent/5">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Comprehensive Valuation Features
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={item}
                className="relative p-6 rounded-lg bg-card border transition-all duration-300 hover:shadow-lg hover:scale-105"
                whileHover={{ y: -5 }}
              >
                <div className="flex flex-col items-center text-center">
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-2xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Tailored for Your Needs
            </h2>
            <p className="text-muted-foreground">
              Whether you're a startup founder or investor, we have the tools you need
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index} 
                variants={item}
                className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-2xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground mb-6">{benefit.description}</p>
                <ul className="space-y-3">
                  {benefit.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * idx }}
                      >
                        <Check className="h-5 w-5 text-primary mt-1" />
                      </motion.div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <motion.div 
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">
            Ready to Value Your Startup?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of founders making data-driven decisions with our platform
          </p>
          <Link href="/valuation/calculator">
            <Button
              size="lg"
              variant="secondary"
              className="min-w-[200px] group"
            >
              Get Started Now
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}