import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: number;
  name: string;
  tier: string;
  price: number;
  billingPeriod: string;
  features: {
    valuationReports: number;
    aiAnalysis: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    teamMembers: number;
    advancedAnalytics: boolean;
  };
}

interface CurrentSubscription {
  planId: number;
  status: string;
}

interface Feature {
  name: string;
  description: string;
  tiers: Record<string, boolean | number>;
}

const features: Feature[] = [
  {
    name: "Valuation Reports",
    description: "Number of reports per month",
    tiers: {
      free: 1,
      premium: -1,
      enterprise: -1
    }
  },
  {
    name: "AI Analysis",
    description: "Advanced AI-powered insights",
    tiers: {
      free: false,
      premium: true,
      enterprise: true
    }
  },
  {
    name: "Custom Branding",
    description: "Add your logo and colors",
    tiers: {
      free: false,
      premium: true,
      enterprise: true
    }
  },
  {
    name: "API Access",
    description: "Programmatic access to valuation data",
    tiers: {
      free: false,
      premium: true,
      enterprise: true
    }
  },
  {
    name: "Priority Support",
    description: "Dedicated support team",
    tiers: {
      free: false,
      premium: false,
      enterprise: true
    }
  },
  {
    name: "Team Members",
    description: "Number of team accounts",
    tiers: {
      free: 1,
      premium: 1,
      enterprise: -1
    }
  },
  {
    name: "Advanced Analytics",
    description: "Detailed metrics and insights",
    tiers: {
      free: false,
      premium: true,
      enterprise: true
    }
  }
];

export function SubscriptionPlans() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans, isLoading: isLoadingPlans } = useQuery<Plan[]>({
    queryKey: ["/api/subscription/plans"],
  });

  const { data: currentSubscription } = useQuery<CurrentSubscription>({
    queryKey: ["/api/subscription/current"],
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/current"] });
      toast({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = async (plan: Plan) => {
    if (plan.tier === "enterprise") {
      // Open contact form or redirect to sales
      window.open("/contact-sales", "_blank");
      return;
    }

    try {
      await subscribeMutation.mutateAsync(plan.id);
    } catch (error) {
      console.error("Subscription error:", error);
    }
  };

  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Pricing Plans</h1>
        <p className="text-lg text-muted-foreground mt-4">
          Choose the plan that best fits your business needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans?.map((plan) => (
          <Card key={plan.id} className={cn(
            "relative overflow-hidden",
            plan.tier === "premium" && "border-primary shadow-lg"
          )}>
            {plan.tier === "premium" && (
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rotate-45 bg-primary text-primary-foreground px-4 py-1 text-sm">
                Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.tier === "enterprise" ? (
                  "Custom pricing for teams"
                ) : (
                  <>
                    ${(plan.price / 100).toFixed(2)}
                    <span className="text-sm text-muted-foreground">/{plan.billingPeriod}</span>
                  </>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature) => (
                <div key={feature.name} className="flex items-center gap-2">
                  {typeof feature.tiers[plan.tier] === "boolean" ? (
                    feature.tiers[plan.tier] ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )
                  ) : (
                    <span className="flex items-center justify-center h-4 w-4 text-sm font-medium">
                      {feature.tiers[plan.tier] === -1 ? "∞" : feature.tiers[plan.tier]}
                    </span>
                  )}
                  <span className="text-sm">{feature.name}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.tier === "premium" ? "default" : "outline"}
                disabled={subscribeMutation.isPending || (currentSubscription && plan.id === currentSubscription.planId)}
                onClick={() => handleSubscribe(plan)}
              >
                {subscribeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : currentSubscription && plan.id === currentSubscription.planId ? (
                  "Current Plan"
                ) : plan.tier === "enterprise" ? (
                  "Contact Sales"
                ) : (
                  "Subscribe"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}