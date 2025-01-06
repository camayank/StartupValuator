import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Calculator,
  Users,
  Building2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "wouter";

const segments = [
  {
    role: "Startup Founders",
    icon: Rocket,
    description: "An affordable, easy-to-use tool designed for startup founders",
    painPoints: ["High valuation service costs", "Complex valuation methods"],
    features: [
      "AI-driven insights with minimal inputs",
      "Step-by-step guidance",
      "Affordable subscription plans",
      "Simple, intuitive interface"
    ],
    cta: "Start Valuing Your Startup"
  },
  {
    role: "Valuers & Financial Pros",
    icon: Calculator,
    description: "Professional-grade reports at a fraction of the cost",
    painPoints: ["Manual report preparation", "High tool subscription costs"],
    features: [
      "Compliance-ready reports",
      "API access for automation",
      "White-label options",
      "Advanced valuation methods"
    ],
    cta: "Access Professional Tools"
  },
  {
    role: "Investors",
    icon: Users,
    description: "Streamline your investment decisions with automated valuations",
    painPoints: ["Time-consuming due diligence", "Inconsistent valuations"],
    features: [
      "Real-time data integration",
      "Peer benchmarking",
      "Portfolio analytics",
      "Deal flow management"
    ],
    cta: "Enhance Due Diligence"
  },
  {
    role: "SME Owners",
    icon: Building2,
    description: "A fast and cost-effective solution for all your valuation needs",
    painPoints: ["Limited valuation resources", "High professional fees"],
    features: [
      "Pay-per-use options",
      "Compliance-ready reports",
      "Easy data input",
      "Clear methodology"
    ],
    cta: "Value Your Business"
  }
];

export function RoleBasedFeatures() {
  return (
    <div className="py-16 space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          Tailored Solutions for Every Need
        </h2>
        <p className="text-muted-foreground">
          Whether you're a startup founder, professional valuer, investor, or SME owner,
          our platform adapts to your specific valuation needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {segments.map((segment, index) => (
          <motion.div
            key={segment.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <segment.icon className="h-6 w-6 text-primary" />
                    <CardTitle>{segment.role}</CardTitle>
                  </div>
                  <Badge variant="secondary">Tailored</Badge>
                </div>
                <p className="text-muted-foreground">{segment.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Common Pain Points</h4>
                  <ul className="space-y-2">
                    {segment.painPoints.map((point, i) => (
                      <li
                        key={i}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Our Solution</h4>
                  <ul className="space-y-2">
                    {segment.features.map((feature, i) => (
                      <li
                        key={i}
                        className="text-sm flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/auth?mode=signup">
                  <Button className="w-full group">
                    {segment.cta}
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
