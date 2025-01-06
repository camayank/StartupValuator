import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Building2, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const whiteLabelFeatures = [
  "Custom branding and domain",
  "API access for integration",
  "Dedicated support team",
  "Custom feature development",
  "SLA guarantees",
];

const analyticsFeatures = [
  "Industry-wide valuation trends",
  "Sector-specific insights",
  "Investment patterns analysis",
  "Regional market dynamics",
  "Custom report generation",
];

export function EnterpriseSolutions() {
  const handleContact = () => {
    // TODO: Implement contact sales functionality
    window.location.href = "mailto:sales@example.com";
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* White Label Solution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                White-Label License
              </h3>
              <Badge variant="secondary">Custom Pricing</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">Starting at $10,000/year</div>
              <p className="text-sm text-muted-foreground">
                For financial institutions and consulting firms
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {whiteLabelFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={handleContact} className="w-full">
              Contact Sales
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Analytics Marketplace */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Analytics Marketplace
              </h3>
              <Badge variant="secondary">Enterprise</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">$1,000/month</div>
              <p className="text-sm text-muted-foreground">
                Access to premium analytics and insights
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analyticsFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-secondary rounded-lg">
              <p className="text-sm font-medium">Custom Reports Available</p>
              <p className="text-sm text-muted-foreground">
                Starting at $500 per report
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleContact} className="w-full">
              Get Access
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
