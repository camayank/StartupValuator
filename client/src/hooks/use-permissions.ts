import { useUser } from "./use-user";
import type { SelectUser } from "@db/schema";

type PermissionMap = {
  [K in "startup" | "investor" | "valuer" | "consultant"]: {
    routes: string[];
    features: string[];
    tools: string[];
  };
};

const rolePermissions: PermissionMap = {
  startup: {
    routes: ["/", "/projections", "/pitch-deck", "/dashboard", "/compliance"],
    features: ["valuation", "projections", "pitch_deck", "compliance"],
    tools: ["health_dashboard", "compliance_checker"],
  },
  investor: {
    routes: ["/", "/projections", "/pitch-deck", "/dashboard", "/portfolio"],
    features: ["valuation", "projections", "portfolio_management", "deal_flow"],
    tools: ["portfolio_analytics", "deal_tracker"],
  },
  valuer: {
    routes: ["/", "/projections", "/methodology", "/clients", "/reports"],
    features: ["valuation", "projections", "methodology_management", "client_management"],
    tools: ["valuation_tools", "report_generator"],
  },
  consultant: {
    routes: ["/", "/projections", "/pitch-deck", "/clients", "/reports"],
    features: ["valuation", "projections", "client_management", "reporting"],
    tools: ["consulting_toolkit", "report_generator"],
  },
};

export function usePermissions() {
  const { user } = useUser();

  const hasPermission = (feature: string) => {
    if (!user) return false;
    return rolePermissions[user.role as keyof PermissionMap].features.includes(feature);
  };

  const hasRouteAccess = (route: string) => {
    if (!user) return false;
    return rolePermissions[user.role as keyof PermissionMap].routes.includes(route);
  };

  const hasToolAccess = (tool: string) => {
    if (!user) return false;
    return rolePermissions[user.role as keyof PermissionMap].tools.includes(tool);
  };

  const getRoleSpecificUIProps = () => {
    if (!user) return {};

    const roleUIConfig = {
      startup: {
        theme: "startup",
        dashboardLayout: "growth_focused",
        primaryActions: ["start_valuation", "create_pitch_deck"],
      },
      investor: {
        theme: "investor",
        dashboardLayout: "portfolio_focused",
        primaryActions: ["review_deals", "portfolio_analysis"],
      },
      valuer: {
        theme: "valuer",
        dashboardLayout: "methodology_focused",
        primaryActions: ["new_valuation", "methodology_setup"],
      },
      consultant: {
        theme: "consultant",
        dashboardLayout: "client_focused",
        primaryActions: ["client_overview", "create_report"],
      },
    };

    return roleUIConfig[user.role as keyof typeof roleUIConfig] || {};
  };

  return {
    hasPermission,
    hasRouteAccess,
    hasToolAccess,
    getRoleSpecificUIProps,
    userRole: user?.role,
  };
}
