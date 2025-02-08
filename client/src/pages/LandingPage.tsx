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
import { motion } from "framer-motion";

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
      <section className="relative py-20 lg:py-32 border-b bg-gradient-to-b from-primary/5 to-background overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-6 -skew-y-12 opacity-20 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border-r border-primary/10" />
          ))}
        </div>

        <motion.div 
          className="container mx-auto px-4 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              AI-Powered Startup Valuations
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
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/auth?mode=signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Free Valuation 
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/calculator">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Try Calculator
                </Button>
              </Link>
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
          <Link href="/auth?mode=signup">
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