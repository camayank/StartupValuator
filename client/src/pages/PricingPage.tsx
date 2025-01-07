import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import type { SelectSubscriptionPlan } from "@db/schema";

const pricingPlans: SelectSubscriptionPlan[] = [
  {
    id: 1,
    name: "Free",
    tier: "free",
    price: 0,
    billingPeriod: "monthly",
    features: {
      valuationReports: 1,
      aiAnalysis: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      teamMembers: 1,
      advancedAnalytics: false,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Basic",
    tier: "basic",
    price: 2900, // $29/month
    billingPeriod: "monthly",
    features: {
      valuationReports: 5,
      aiAnalysis: true,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      teamMembers: 2,
      advancedAnalytics: false,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Premium",
    tier: "premium",
    price: 7900, // $79/month
    billingPeriod: "monthly",
    features: {
      valuationReports: 20,
      aiAnalysis: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      teamMembers: 5,
      advancedAnalytics: true,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Enterprise",
    tier: "enterprise",
    price: 19900, // $199/month
    billingPeriod: "monthly",
    features: {
      valuationReports: 100,
      aiAnalysis: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      teamMembers: 20,
      advancedAnalytics: true,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const featureDescriptions = {
  valuationReports: "Monthly valuation reports",
  aiAnalysis: "AI-powered market analysis",
  customBranding: "Custom branding on reports",
  apiAccess: "API access for integration",
  prioritySupport: "Priority customer support",
  teamMembers: "Team member seats",
  advancedAnalytics: "Advanced analytics dashboard",
};

export function PricingPage() {
  const { user } = useUser();
  const { toast } = useToast();

  const handleUpgrade = async (plan: SelectSubscriptionPlan) => {
    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: plan.id }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: `You've been upgraded to ${plan.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upgrade plan",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-6xl py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative ${plan.tier === "premium" ? "border-primary" : ""}`}>
              {plan.tier === "premium" && (
                <Badge
                  variant="secondary"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {plan.tier === user?.subscriptionTier && (
                    <Badge variant="outline">Current Plan</Badge>
                  )}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">
                    ${(plan.price / 100).toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {Object.entries(plan.features).map(([key, value]) => (
                    <li
                      key={key}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-primary" />
                      {key === "valuationReports" ? (
                        <span>
                          <strong>{value}</strong> valuation reports/month
                        </span>
                      ) : key === "teamMembers" ? (
                        <span>
                          Up to <strong>{value}</strong> team members
                        </span>
                      ) : (
                        <span>{featureDescriptions[key as keyof typeof featureDescriptions]}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.tier === "premium" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleUpgrade(plan)}
                  disabled={plan.tier === user?.subscriptionTier}
                >
                  {plan.tier === user?.subscriptionTier ? (
                    "Current Plan"
                  ) : plan.tier === "enterprise" ? (
                    "Contact Sales"
                  ) : (
                    <>
                      Upgrade
                      <Zap className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Enterprise Solutions</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Need a custom solution? Our enterprise plan includes custom features,
          dedicated support, and flexible pricing based on your needs.
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
      </div>
    </div>
  );
}
