import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Globe2,
  Lightbulb,
  PiggyBank,
  Settings,
  Wand2,
} from "lucide-react";
import { motion } from "framer-motion";

const advantages = [
  {
    title: "Comprehensive Yet Simple",
    description: "Professional-grade analysis with an intuitive interface",
    icon: Wand2,
    highlight: "User-Friendly",
    details: [
      "Simplified data input process",
      "Interactive visualization tools",
      "Step-by-step guidance",
      "Professional-grade outputs",
    ],
  },
  {
    title: "Smart Pricing",
    description: "Affordable plans for every stage of your business",
    icon: PiggyBank,
    highlight: "Cost-Effective",
    details: [
      "Flexible subscription tiers",
      "Pay-per-use options",
      "Transparent pricing",
      "No hidden costs",
    ],
  },
  {
    title: "Global Compliance",
    description: "Built-in support for regional compliance requirements",
    icon: Globe2,
    highlight: "Compliant",
    details: [
      "ICAI compliance for India",
      "409A compliance for US",
      "International standards",
      "Automatic updates",
    ],
  },
  {
    title: "AI-Powered Intelligence",
    description: "Smart automation and real-time market insights",
    icon: Brain,
    highlight: "Intelligent",
    details: [
      "Automated assumptions",
      "Real-time data integration",
      "Risk analysis",
      "Market insights",
    ],
  },
  {
    title: "Professional Customization",
    description: "Tailored solutions for every business need",
    icon: Settings,
    highlight: "Customizable",
    details: [
      "White-label options",
      "Custom branding",
      "Multiple languages",
      "Flexible formats",
    ],
  },
  {
    title: "Innovation-First",
    description: "Cutting-edge features and continuous improvements",
    icon: Lightbulb,
    highlight: "Advanced",
    details: [
      "Regular updates",
      "Latest methodologies",
      "Industry best practices",
      "Research-backed models",
    ],
  },
];

export function CompetitiveAdvantages() {
  return (
    <div className="py-16 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience the next generation of business valuation with our
          comprehensive, AI-powered platform designed for modern businesses.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {advantages.map((advantage, index) => (
          <motion.div
            key={advantage.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <advantage.icon className="h-8 w-8 text-primary" />
                  <Badge variant="secondary">{advantage.highlight}</Badge>
                </div>
                <CardTitle className="text-xl">{advantage.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {advantage.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {advantage.details.map((detail) => (
                    <li
                      key={detail}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
