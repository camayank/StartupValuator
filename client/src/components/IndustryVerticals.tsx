import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Code2,
  ShoppingCart,
  Factory,
  Building2,
  Heart,
  Leaf,
  Hammer,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const industries = [
  {
    name: "SaaS",
    icon: Code2,
    metrics: ["MRR/ARR", "CAC", "LTV", "Churn Rate"],
    status: "live",
  },
  {
    name: "E-commerce",
    icon: ShoppingCart,
    metrics: ["GMV", "AOV", "Customer Retention", "Inventory Turnover"],
    status: "live",
  },
  {
    name: "Manufacturing",
    icon: Factory,
    metrics: ["Asset Utilization", "Operating Margin", "Working Capital", "ROIC"],
    status: "live",
  },
  {
    name: "Real Estate",
    icon: Building2,
    metrics: ["NOI", "Cap Rate", "Occupancy Rate", "Asset Value"],
    status: "coming_soon",
  },
  {
    name: "Healthcare",
    icon: Heart,
    metrics: ["Patient LTV", "Regulatory Compliance", "Operating Costs", "Revenue/Patient"],
    status: "coming_soon",
  },
  {
    name: "Renewable Energy",
    icon: Leaf,
    metrics: ["ESG Metrics", "Energy Output", "Carbon Credits", "ROI"],
    status: "coming_soon",
  },
];

export function IndustryVerticals() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Industry-Specific Valuation Models</h2>
        <p className="text-muted-foreground">
          Our AI-powered platform adapts to your industry's unique metrics and valuation standards
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map((industry, index) => (
          <motion.div
            key={industry.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <industry.icon className="h-6 w-6 text-primary" />
                    <CardTitle>{industry.name}</CardTitle>
                  </div>
                  <Badge variant={industry.status === "live" ? "default" : "secondary"}>
                    {industry.status === "live" ? "Live" : "Coming Soon"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Metrics Analyzed</h4>
                  <ul className="space-y-2">
                    {industry.metrics.map((metric, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </div>

                {industry.status === "live" && (
                  <Link href="/valuation">
                    <Button className="w-full group">
                      Start Valuation
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground mb-4">
          Don't see your industry? We're constantly expanding our coverage.
        </p>
        <Link href="/contact">
          <Button variant="outline">
            Request Your Industry
          </Button>
        </Link>
      </div>
    </div>
  );
}
