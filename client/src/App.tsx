import { Switch, Route, Link, useLocation } from "wouter";
import { Home } from "./pages/Home";
import { Documentation } from "./pages/Documentation";
import { Profile } from "./pages/Profile";
import ValuationCalculatorPage from "./pages/ValuationCalculatorPage";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  BarChart3,
  Calculator,
  FileText,
  Settings,
  Users,
  Building2,
  PieChart,
  ClipboardCheck,
  BookOpen,
  LogOut,
  Menu,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PitchDeckGenerator } from "@/components/PitchDeckGenerator";
import { ValuationWizard } from "@/components/ValuationWizard";
import { ProjectionsWizard } from "@/components/projections/ProjectionsWizard";
import { StartupHealthDashboard } from "@/components/StartupHealthDashboard";
import { ComplianceChecker } from "@/components/ComplianceChecker";
import { PricingPage } from "./pages/PricingPage";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardContainer } from "@/components/DashboardContainer";
import AuthPage from "./pages/AuthPage";
import { RoleAccessVisualization } from "@/components/RoleAccessVisualization";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { WorkflowSuggestions } from "@/components/WorkflowSuggestions";
import { TourGuide } from "@/components/TourGuide";
import { LandingPage } from "./pages/LandingPage";
import { IntegratedWorkflowController } from "@/components/IntegratedWorkflowController";
import { BusinessPlanWizard } from "@/components/BusinessPlanWizard";

// Update navigation configuration
const navigationConfig = {
  startup: {
    mainTools: [
      { href: "/calculator", label: "Quick Calculator", description: "Basic valuation estimation", icon: Calculator },
      { href: "/valuation", label: "Full Valuation", description: "Comprehensive startup valuation", icon: FileText },
      { href: "/projections", label: "Financial Projections", description: "Create detailed financial forecasts", icon: BarChart3 },
      { href: "/pitch-deck", label: "Pitch Deck", description: "Generate investor presentations", icon: FileText },
      { href: "/business-plan", label: "Business Plan", description: "Create detailed business plan", icon: FileText },
    ],
    analytics: [
      { href: "/dashboard", label: "Health Dashboard", description: "Monitor startup metrics", icon: PieChart },
      { href: "/compliance", label: "Compliance Check", description: "Regulatory compliance", icon: ClipboardCheck },
    ]
  },
  investor: {
    mainTools: [
      { href: "/valuation", label: "Full Valuation", description: "Evaluate investment opportunities", icon: Calculator },
      { href: "/calculator", label: "Quick Calculator", description: "Quick valuation estimates", icon: Calculator },
      { href: "/portfolio", label: "Portfolio", description: "Manage investments", icon: PieChart },
    ],
    analytics: [
      { href: "/dashboard", label: "Investment Dashboard", description: "Portfolio performance", icon: PieChart },
      { href: "/market-analysis", label: "Market Analysis", description: "Market trends", icon: BarChart3 },
    ]
  },
  default: {
    mainTools: [
      { href: "/valuation", label: "Full Valuation", description: "Complete valuation", icon: Calculator },
      { href: "/calculator", label: "Quick Calculator", description: "Basic calculator", icon: Calculator },
    ],
    analytics: [
      { href: "/dashboard", label: "Dashboard", description: "View analytics", icon: PieChart },
    ]
  }
} as const;

type UserRole = keyof typeof navigationConfig | string;

function getNavigation(role: UserRole) {
  if (role in navigationConfig) {
    return navigationConfig[role as keyof typeof navigationConfig];
  }
  return navigationConfig.default;
}

const resourceLinks = [
  { href: "/pricing", label: "Pricing", description: "View our subscription plans", icon: Building2 },
  { href: "/docs", label: "API Docs", description: "Access our API documentation", icon: FileText },
];

function App() {
  const { user, isLoading, error, logout } = useUser();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: "There was a problem loading your account. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Show loading state for max 5 seconds
  const [showLoadingError, setShowLoadingError] = useState(false);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setShowLoadingError(true);
      }, 5000);
    } else {
      setShowLoadingError(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {showLoadingError
              ? "Taking longer than expected... Please refresh the page."
              : "Loading your workspace..."}
          </p>
          {showLoadingError && (
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Refresh Page
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Public routes - show landing page or calculator
  if (!user && !location.startsWith('/auth')) {
    if (location === '/calculator') {
      return (
        <div className="min-h-screen bg-background">
          <header className="border-b bg-card/80 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 container mx-auto">
              <Link href="/">
                <span className="text-xl font-bold">StartupValuator</span>
              </Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link href="/auth?mode=login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth?mode=signup">
                  <Button>Get Started</Button>
                </Link>
              </div>
            </div>
          </header>
          <ValuationCalculatorPage />
        </div>
      );
    }
    return <LandingPage />;
  }

  // Show auth page if not logged in and on auth page
  if (!user && location.startsWith('/auth')) {
    return <AuthPage />;
  }

  // If we get here, user must be logged in
  if (!user) return null;

  // Get navigation config based on user role with fallback
  const userNavigation = user ? getNavigation(user.role) : navigationConfig.default;

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const NavLink = ({ href, label, description, icon: Icon }: {
    href: string;
    label: string;
    description: string;
    icon: any;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href}>
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              location === href
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-accent text-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{description}</p>
      </TooltipContent>
    </Tooltip>
  );

  const MobileNavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-4 py-2 ${
          location === href
            ? "bg-primary/10 text-primary"
            : "hover:bg-accent"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </div>
    </Link>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-card lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b p-4 flex items-center justify-between">
              <Link href="/">
                <span className="text-xl font-bold cursor-pointer hover:text-primary transition-colors">
                  StartupValuator
                </span>
              </Link>
              <ThemeToggle />
            </div>

            <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
              <div>
                <h2 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Main Tools</h2>
                <div className="space-y-1">
                  {userNavigation.mainTools.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Analytics</h2>
                <div className="space-y-1">
                  {userNavigation.analytics.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Resources</h2>
                <div className="space-y-1">
                  {resourceLinks.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </div>
              </div>
            </nav>

            <div className="border-t p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <Settings className="h-5 w-5" />
                    <span className="flex-1 text-left">{user.username}</span>
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
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/">
              <span className="text-xl font-bold">StartupValuator</span>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <nav className="mt-8 space-y-6">
                    <div>
                      <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Main Tools</h2>
                      {userNavigation.mainTools.map((item) => (
                        <MobileNavItem key={item.href} {...item} />
                      ))}
                    </div>

                    <div>
                      <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Analytics</h2>
                      {userNavigation.analytics.map((item) => (
                        <MobileNavItem key={item.href} {...item} />
                      ))}
                    </div>

                    <div>
                      <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Resources</h2>
                      {resourceLinks.map((item) => (
                        <MobileNavItem key={item.href} {...item} />
                      ))}
                    </div>

                    <div className="border-t pt-6">
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        Signed in as: {user.username}
                      </div>
                      <MobileNavItem
                        href={`/profile/${user.id}`}
                        label="Profile Settings"
                        icon={Settings}
                      />
                      <button
                        className="flex w-full items-center gap-3 px-4 py-2 text-destructive hover:bg-accent"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="lg:pl-64">
          <div className="min-h-[calc(100vh-4rem)] p-4 lg:p-8">
            <Switch>
              <Route path="/auth">
                <AuthPage />
              </Route>
              <Route path="/calculator">
                <ValuationCalculatorPage />
              </Route>
              <Route path="/valuation">
                <ValuationWizard
                  onSubmit={(data) => {
                    console.log('Valuation data submitted:', data);
                  }}
                />
              </Route>
              <Route path="/projections">
                <ProjectionsWizard />
              </Route>
              <Route path="/pitch-deck">
                <PitchDeckGenerator />
              </Route>
              <Route path="/dashboard">
                <DashboardContainer />
              </Route>
              <Route path="/compliance">
                <ComplianceChecker />
              </Route>
              <Route path="/pricing">
                <PricingPage />
              </Route>
              <Route path="/docs">
                <Documentation />
              </Route>
              <Route path="/profile/:userId">
                <Profile />
              </Route>
              <Route path="/integrated-workflow">
                <IntegratedWorkflowController />
              </Route>
              <Route path="/business-plan">
                <BusinessPlanWizard />
              </Route>
              <Route path="/">
                <ValuationWizard
                  onSubmit={(data) => {
                    console.log('Valuation data submitted:', data);
                  }}
                />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </div>
        </main>

        <WorkflowSuggestions />
        <TourGuide />
      </div>
    </TooltipProvider>
  );
}

// fallback 404 not found page
function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
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