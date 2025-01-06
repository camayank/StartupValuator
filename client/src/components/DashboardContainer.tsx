import { useUser } from "@/hooks/use-user";
import { StartupDashboard } from "./dashboards/StartupDashboard";
import { InvestorDashboard } from "./dashboards/InvestorDashboard";
import { Loader2 } from "lucide-react";

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
    return null;
  }

  switch (user.role) {
    case "startup":
      return <StartupDashboard />;
    case "investor":
      return <InvestorDashboard />;
    case "valuer":
      // TODO: Implement ValuerDashboard
      return <div>Valuer Dashboard Coming Soon</div>;
    case "consultant":
      // TODO: Implement ConsultantDashboard
      return <div>Consultant Dashboard Coming Soon</div>;
    default:
      return null;
  }
}
