import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, ChartBar, FileText, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Quick Valuation",
    description: "Get a quick estimate of your startup's value",
    icon: Calculator,
    href: "/valuation/quick"
  },
  {
    title: "Detailed Analysis",
    description: "Deep dive into your startup's metrics",
    icon: ChartBar,
    href: "/valuation/detailed"
  },
  {
    title: "Financial Modeling",
    description: "Build comprehensive financial models",
    icon: DollarSign,
    href: "/valuation/financial"
  },
  {
    title: "Report Generation",
    description: "Generate professional valuation reports",
    icon: FileText,
    href: "/valuation/report"
  }
];

export function Home() {
  return (
    <div className="container px-4 py-12">
      {/* Hero Section */}
      <motion.div 
        className="text-center max-w-3xl mx-auto mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Startup Valuation Made Simple
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Use AI-powered analytics to understand your startup's true value
        </p>
        <Button size="lg" className="mr-4">
          Start Valuation
        </Button>
        <Button size="lg" variant="outline">
          Learn More
        </Button>
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-2">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full" asChild>
                  <a href={feature.href}>Get Started →</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Start Section */}
      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Ready to get started?</CardTitle>
            <CardDescription>
              Begin with a quick valuation or explore our detailed analysis tools
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button>Quick Valuation</Button>
            <Button variant="outline">View Demo</Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}