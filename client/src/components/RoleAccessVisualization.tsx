import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Check, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AccessFeature {
  name: string;
  description: string;
  available: boolean;
}

const roleFeatures: Record<string, AccessFeature[]> = {
  startup: [
    { name: "Valuation Tool", description: "Calculate your startup's value", available: true },
    { name: "Health Dashboard", description: "Monitor startup metrics", available: true },
    { name: "Compliance Check", description: "Regulatory compliance tools", available: true },
    { name: "Pitch Deck", description: "Generate pitch decks", available: true },
    { name: "Financial Projections", description: "Create financial forecasts", available: true },
  ],
  investor: [
    { name: "Valuation Tool", description: "Evaluate investment opportunities", available: true },
    { name: "Portfolio Management", description: "Track investments", available: true },
    { name: "Deal Flow", description: "Monitor potential deals", available: true },
    { name: "Due Diligence", description: "Comprehensive analysis tools", available: true },
    { name: "Market Analysis", description: "Industry insights", available: true },
  ],
  valuer: [
    { name: "Valuation Tool", description: "Professional valuation tools", available: true },
    { name: "Methodology Management", description: "Custom valuation methods", available: true },
    { name: "Client Management", description: "Handle client accounts", available: true },
    { name: "Report Generation", description: "Create detailed reports", available: true },
    { name: "Benchmark Analysis", description: "Industry comparisons", available: true },
  ],
  consultant: [
    { name: "Valuation Tool", description: "Advisory focused tools", available: true },
    { name: "Client Management", description: "Manage client relationships", available: true },
    { name: "Strategy Planning", description: "Strategic recommendations", available: true },
    { name: "Report Generation", description: "Create client reports", available: true },
    { name: "Resource Library", description: "Access knowledge base", available: true },
  ],
};

interface RoleAccessVisualizationProps {
  role: "startup" | "investor" | "valuer" | "consultant";
  tier?: "free" | "basic" | "premium" | "enterprise";
}

const tierMultipliers = {
  free: 0.4,
  basic: 0.6,
  premium: 0.8,
  enterprise: 1,
};

export function RoleAccessVisualization({ role, tier = "free" }: RoleAccessVisualizationProps) {
  const features = roleFeatures[role];
  const multiplier = tierMultipliers[tier];

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Access Level</CardTitle>
            <Badge variant="outline" className="capitalize">
              {role}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {tier} Plan
            </Badge>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your current subscription tier affects feature availability</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature, index) => {
              const isAvailable = index < features.length * multiplier;
              return (
                <div
                  key={feature.name}
                  className="flex items-center justify-between p-2 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-2">
                          {isAvailable ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={!isAvailable ? "text-muted-foreground" : ""}>
                            {feature.name}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{feature.description}</p>
                        {!isAvailable && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Upgrade your plan to access this feature
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
