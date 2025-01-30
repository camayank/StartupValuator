import { useUser } from "@/hooks/use-user";
import { StartupDashboard } from "./dashboards/StartupDashboard";
import { InvestorDashboard } from "./dashboards/InvestorDashboard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function DashboardContainer() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please login to access your dashboard
        </AlertDescription>
      </Alert>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "startup":
        return "bg-blue-100 text-blue-800";
      case "investor":
        return "bg-green-100 text-green-800";
      case "valuer":
        return "bg-purple-100 text-purple-800";
      case "consultant":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "startup":
        return "Access your startup metrics, valuation tools, and growth tracking";
      case "investor":
        return "Monitor your investment portfolio and analyze opportunities";
      case "valuer":
        return "Access professional valuation tools and client management";
      case "consultant":
        return "Manage client portfolios and advisory services";
      default:
        return "Welcome to your dashboard";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Welcome, {user.username}</CardTitle>
              <CardDescription>{getRoleDescription(user.role)}</CardDescription>
            </div>
            <Badge className={`${getRoleBadgeColor(user.role)} capitalize`}>
              {user.role}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Role-specific dashboards */}
      <div>
        {user.role === "startup" ? (
          <StartupDashboard />
        ) : user.role === "investor" ? (
          <InvestorDashboard />
        ) : user.role === "valuer" ? (
          <div className="p-6 bg-background border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Valuer Dashboard</h2>
            <p className="text-muted-foreground">
              Professional valuation tools and features coming soon.
            </p>
          </div>
        ) : user.role === "consultant" ? (
          <div className="p-6 bg-background border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Consultant Dashboard</h2>
            <p className="text-muted-foreground">
              Consultant features and client management tools coming soon.
            </p>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unknown user role. Please contact support.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}