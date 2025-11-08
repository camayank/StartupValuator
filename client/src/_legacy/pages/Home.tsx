import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, ChartBar, FileText, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const features = [
  {
    title: "Quick Valuation",
    description: "Get a quick estimate of your startup's value in minutes using our AI-powered analytics",
    icon: Calculator,
    href: "/valuation/quick",
    color: "text-blue-500",
    gradient: "from-blue-500/20 to-transparent"
  },
  {
    title: "Detailed Analysis",
    description: "Deep dive into your metrics with comprehensive market analysis and performance tracking",
    icon: ChartBar,
    href: "/valuation/detailed",
    color: "text-green-500",
    gradient: "from-green-500/20 to-transparent"
  },
  {
    title: "Financial Modeling",
    description: "Build sophisticated financial models with AI assistance and real-time validation",
    icon: DollarSign,
    href: "/valuation/financial",
    color: "text-purple-500",
    gradient: "from-purple-500/20 to-transparent"
  },
  {
    title: "Report Generation",
    description: "Generate professional valuation reports with customizable templates and insights",
    icon: FileText,
    href: "/valuation/report",
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-transparent"
  }
];

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with improved gradient and animations */}
      <motion.section 
        className="relative overflow-hidden py-20 md:py-32 bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container relative px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Make Data-Driven Startup Valuations Simple
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground mb-8 leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Use AI-powered analytics and industry benchmarks to understand your startup's true value 
              and make informed decisions backed by data.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/valuation/quick">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Valuation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Documentation
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid with improved cards and hover effects */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={feature.href}>
                  <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer relative overflow-hidden group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <CardHeader className="relative">
                      <div className={`p-3 rounded-lg ${feature.color} bg-opacity-10 w-fit mb-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-2 transition-transform duration-200">
                        Get Started <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="container px-4 mx-auto">
          <Card className="max-w-2xl mx-auto border-2 hover:border-primary/50 transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Ready to value your startup?</CardTitle>
              <CardDescription className="text-lg">
                Begin with a quick valuation or explore our detailed analysis tools
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-center gap-4 p-6">
              <Link href="/valuation/quick">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Quick Valuation
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Watch Demo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </div>
  );
}