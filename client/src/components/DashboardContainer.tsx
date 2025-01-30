import { useUser } from "@/hooks/use-user";
import { StartupDashboard } from "./dashboards/StartupDashboard";
import { InvestorDashboard } from "./dashboards/InvestorDashboard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardContainer() {
  const { user, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard: {error.message}
        </AlertDescription>
      </Alert>
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

  const getLastLoginText = () => {
    if (!user.last_login_at) return null;
    const lastLogin = new Date(user.last_login_at);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - lastLogin.getTime()) / 36e5;

    if (diffInHours < 24) {
      return `Last login: Today at ${lastLogin.toLocaleTimeString()}`;
    }
    return `Last login: ${lastLogin.toLocaleDateString()}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Welcome back, {user.username}</CardTitle>
              <CardDescription>
                {getRoleDescription(user.role)}
                {getLastLoginText() && (
                  <span className="block text-sm mt-1">{getLastLoginText()}</span>
                )}
              </CardDescription>
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
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Valuation Tools</CardTitle>
                <CardDescription>
                  Professional valuation tools and features for accurate startup assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  Advanced valuation features coming soon. You'll be able to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Access industry-specific valuation models</li>
                    <li>Generate detailed valuation reports</li>
                    <li>Compare with market benchmarks</li>
                    <li>Collaborate with team members</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : user.role === "consultant" ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Advisory Dashboard</CardTitle>
                <CardDescription>
                  Manage your client portfolio and advisory services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">
                  Consultant features coming soon. You'll be able to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Manage multiple client accounts</li>
                    <li>Track client progress and metrics</li>
                    <li>Generate advisory reports</li>
                    <li>Schedule consultations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
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