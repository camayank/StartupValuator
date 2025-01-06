import { Switch, Route, Link, useLocation } from "wouter";
import { Home } from "./pages/Home";
import { Documentation } from "./pages/Documentation";
import { Profile } from "./pages/Profile";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, Menu, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PitchDeckGenerator } from "@/components/PitchDeckGenerator";
import { ValuationWizard } from "@/components/ValuationWizard";
import { ProjectionsWizard } from "@/components/projections/ProjectionsWizard";
import { StartupHealthDashboard } from "@/components/StartupHealthDashboard";
import { ComplianceChecker } from "@/components/ComplianceChecker";
import { PricingPage } from "./pages/PricingPage";
import { useUser } from "@/hooks/use-user";
import { usePermissions } from "@/hooks/use-permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ValuationFormData } from "@/lib/validations";
import { useState } from "react";
import { WorkflowSuggestions } from "@/components/WorkflowSuggestions";
import { TourGuide } from "@/components/TourGuide";

const baseNavItems = [
  { href: "/", label: "Valuation", description: "Calculate your startup's value", tourId: "valuation", feature: "valuation" },
  { href: "/projections", label: "Financial Projections", description: "Create detailed financial forecasts", tourId: "projections", feature: "projections" },
  { href: "/pitch-deck", label: "Pitch Deck", description: "Generate investor-ready presentations", tourId: "pitch-deck", feature: "pitch_deck" },
];

const roleSpecificNavItems = {
  startup: [
    { href: "/dashboard", label: "Health Dashboard", description: "Monitor your startup's vital metrics", tourId: "dashboard", feature: "health_dashboard" },
    { href: "/compliance", label: "Compliance Check", description: "Ensure regulatory compliance", tourId: "compliance", feature: "compliance" },
  ],
  investor: [
    { href: "/portfolio", label: "Portfolio", description: "Manage your investment portfolio", tourId: "portfolio", feature: "portfolio_management" },
    { href: "/deal-flow", label: "Deal Flow", description: "Track and analyze potential investments", tourId: "deal-flow", feature: "deal_flow" },
  ],
  valuer: [
    { href: "/methodology", label: "Methodology", description: "Manage valuation methodologies", tourId: "methodology", feature: "methodology_management" },
    { href: "/clients", label: "Clients", description: "Manage client relationships", tourId: "clients", feature: "client_management" },
  ],
  consultant: [
    { href: "/clients", label: "Clients", description: "Manage client relationships", tourId: "clients", feature: "client_management" },
    { href: "/reports", label: "Reports", description: "Generate and manage reports", tourId: "reports", feature: "reporting" },
  ],
};

const resourceNavItems = [
  { href: "/pricing", label: "Pricing", description: "View our subscription plans" },
  { href: "/docs", label: "API Docs", description: "Access our API documentation" },
];

function App() {
  const { user, isLoading, error } = useUser();
  const { hasPermission, userRole, getRoleSpecificUIProps } = usePermissions();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const uiProps = getRoleSpecificUIProps();

  // Filter navigation items based on user role and permissions
  const mainNavItems = baseNavItems.filter(item => hasPermission(item.feature));
  const toolsNavItems = userRole ? roleSpecificNavItems[userRole as keyof typeof roleSpecificNavItems].filter(item => hasPermission(item.feature)) : [];

  const handleValuationSubmit = async (data: ValuationFormData) => {
    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Valuation result:', result);
      return result;
    } catch (error) {
      console.error('Error calculating valuation:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const NavItem = ({ href, label, description, tourId }: { href: string; label: string; description: string; tourId?: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href}>
          <span 
            className={`text-sm hover:text-primary cursor-pointer transition-colors ${
              location === href ? 'text-primary font-medium' : ''
            }`}
            data-tour={tourId}
          >
            {label}
          </span>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>{description}</p>
      </TooltipContent>
    </Tooltip>
  );

  const MobileNavItem = ({ href, label }: { href: string; label: string }) => (
    <Link href={href}>
      <span
        className={`block px-4 py-2 text-sm ${
          location === href
            ? "bg-primary/10 text-primary"
            : "hover:bg-accent"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-background ${uiProps.theme ? `theme-${uiProps.theme}` : ''}`}>
        <nav className="sticky top-0 z-50 border-b px-4 py-3 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <span className="text-xl font-bold cursor-pointer hover:text-primary transition-colors">
                  StartupValuator
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                {mainNavItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}

                {toolsNavItems.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                      Tools
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {toolsNavItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href}>
                            <span className="w-full">{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {resourceNavItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>

              <div className="flex items-center space-x-4">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <span className="text-sm font-medium">{user.username}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuItem className="text-muted-foreground">
                        Role: {user.role}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <Link href={`/profile/${user.id}`}>
                        <DropdownMenuItem className="cursor-pointer">
                          Profile Settings
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => {
                          fetch('/api/logout', { method: 'POST' })
                            .then(() => window.location.reload())
                            .catch(console.error);
                        }}
                      >
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80">
                  <div className="flex flex-col space-y-4 mt-8">
                    {[...mainNavItems, ...toolsNavItems, ...resourceNavItems].map((item) => (
                      <MobileNavItem key={item.href} {...item} />
                    ))}

                    <div className="border-t pt-4">
                      {user ? (
                        <>
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Role: {user.role}
                          </div>
                          <MobileNavItem href={`/profile/${user.id}`} label="Profile Settings" />
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent"
                            onClick={() => {
                              fetch('/api/logout', { method: 'POST' })
                                .then(() => window.location.reload())
                                .catch(console.error);
                            }}
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <MobileNavItem href="/login" label="Login" />
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>

        <main className={`min-h-[calc(100vh-4rem)] ${uiProps.dashboardLayout ? `layout-${uiProps.dashboardLayout}` : ''}`}>
          <Switch>
            <Route path="/">
              <div className="container mx-auto py-8">
                <ValuationWizard onSubmit={handleValuationSubmit} />
              </div>
            </Route>
            <Route path="/projections">
              <div className="container mx-auto py-8">
                <ProjectionsWizard />
              </div>
            </Route>
            <Route path="/pitch-deck">
              <div className="container mx-auto py-8">
                <PitchDeckGenerator />
              </div>
            </Route>
            <Route path="/dashboard">
              <div className="container mx-auto py-8">
                <StartupHealthDashboard />
              </div>
            </Route>
            <Route path="/compliance">
              <div className="container mx-auto py-8">
                <ComplianceChecker />
              </div>
            </Route>
            <Route path="/pricing" component={PricingPage} />
            <Route path="/docs" component={Documentation} />
            <Route path="/profile/:userId" component={Profile} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <WorkflowSuggestions />
        <TourGuide />
      </div>
    </TooltipProvider>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
          <Link href="/">
            <span className="mt-4 inline-block text-primary hover:underline cursor-pointer">
              Return to Home
            </span>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default App;