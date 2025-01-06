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
      collaborationTools: false,
      realTimeData: false,
      peerBenchmarking: false,
      complianceReports: false,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Startup",
    tier: "startup",
    price: 1999, // $19.99/month
    billingPeriod: "monthly",
    features: {
      valuationReports: 5,
      aiAnalysis: true,
      customBranding: true,
      apiAccess: false,
      prioritySupport: false,
      teamMembers: 2,
      advancedAnalytics: false,
      collaborationTools: false,
      realTimeData: true,
      peerBenchmarking: false,
      complianceReports: false,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: "Growth",
    tier: "growth",
    price: 9999, // $99.99/month
    billingPeriod: "monthly",
    features: {
      valuationReports: -1, // unlimited
      aiAnalysis: true,
      customBranding: true,
      apiAccess: false,
      prioritySupport: false,
      teamMembers: 5,
      advancedAnalytics: true,
      collaborationTools: true,
      realTimeData: true,
      peerBenchmarking: true,
      complianceReports: true,
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: "Enterprise",
    tier: "enterprise",
    price: 49999, // $499.99/month
    billingPeriod: "monthly",
    features: {
      valuationReports: -1, // unlimited
      aiAnalysis: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      teamMembers: 20,
      advancedAnalytics: true,
      collaborationTools: true,
      realTimeData: true,
      peerBenchmarking: true,
      complianceReports: true,
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
  collaborationTools: "Team collaboration features",
  realTimeData: "Real-time market data",
  peerBenchmarking: "Industry peer benchmarking",
  complianceReports: "Compliance-ready reports",
};

const addOnServices = [
  {
    name: "Cap Table Management",
    description: "Manage equity, ESOPs, and shareholder information",
    price: 4900, // $49/month
    type: "cap_table_management",
  },
  {
    name: "Custom Financial Projections",
    description: "AI-generated projections tailored to your business",
    price: 9900, // $99 per projection
    type: "financial_projections",
  },
  {
    name: "Compliance Reports",
    description: "Region-specific compliance validation (409A, ICAI)",
    price: 4900, // $49 per report
    type: "compliance_reports",
  },
];

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

  const handleAddOnPurchase = async (addon: typeof addOnServices[0]) => {
    try {
      const response = await fetch("/api/addons/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addonType: addon.type }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: "Success",
        description: `Successfully purchased ${addon.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to purchase add-on",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-7xl py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that best fits your needs
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative ${plan.tier === "growth" ? "border-primary" : ""}`}>
              {plan.tier === "growth" && (
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
                          <strong>{value === -1 ? "Unlimited" : value}</strong> valuation reports/month
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
                  variant={plan.tier === "growth" ? "default" : "outline"}
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

      {/* Add-on Services */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Add-on Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {addOnServices.map((addon, index) => (
            <motion.div
              key={addon.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{addon.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">
                      ${(addon.price / 100).toFixed(2)}
                    </span>
                    {addon.type === "cap_table_management" && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{addon.description}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddOnPurchase(addon)}
                  >
                    Purchase
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
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