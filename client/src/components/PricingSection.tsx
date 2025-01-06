import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Rocket, Building2, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

const pricingTiers = [
  {
    name: "Free",
    description: "Perfect for early-stage startups",
    price: "0",
    features: [
      "1 valuation report per month",
      "Basic DCF and multiples analysis",
      "Standard report templates",
      "Community support",
    ],
    icon: Sparkles,
    highlight: "Start Free",
    cta: "Get Started",
  },
  {
    name: "Startup",
    description: "For growing startups and small teams",
    price: "19.99",
    features: [
      "5 valuation reports per month",
      "Scenario analysis",
      "Risk assessment tools",
      "Custom branding options",
      "Email support",
    ],
    icon: Rocket,
    highlight: "Popular",
    cta: "Start Trial",
  },
  {
    name: "Growth",
    description: "For businesses scaling operations",
    price: "99.99",
    features: [
      "Unlimited valuations",
      "Compliance-ready reports",
      "Real-time market data",
      "Team collaboration",
      "Priority support",
    ],
    icon: Building2,
    highlight: "Best Value",
    cta: "Get Access",
  },
  {
    name: "Enterprise",
    description: "For investors and financial institutions",
    price: "Custom",
    features: [
      "API access",
      "White-label options",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantees",
    ],
    icon: Globe2,
    highlight: "Custom",
    cta: "Contact Sales",
  },
];

export function PricingSection() {
  return (
    <div className="py-16 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Transparent Pricing for Every Stage</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that best fits your needs. All plans include core valuation features.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {pricingTiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative h-full">
              {tier.highlight === "Popular" && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge variant="default" className="bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <tier.icon className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                  </div>
                  <Badge variant="secondary">{tier.highlight}</Badge>
                </div>
                <p className="text-muted-foreground">{tier.description}</p>
                <div className="mt-4">
                  {tier.price === "Custom" ? (
                    <div className="text-2xl font-bold">Custom Pricing</div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={tier.price === "Custom" ? "/contact" : "/auth?mode=signup"} className="w-full">
                  <Button className="w-full">
                    {tier.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Regional pricing available for emerging markets. Contact us for details.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span>14-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span>No credit card required for free tier</span>
          </div>
        </div>
      </div>
    </div>
  );
}
