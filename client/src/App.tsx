import { Switch, Route, Link, useLocation } from "wouter";
import { Home } from "./pages/Home";
import { Documentation } from "./pages/Documentation";
import { Profile } from "./pages/Profile";
import ValuationPage from "./pages/ValuationPage";
import ValuationCalculatorPage from "./pages/ValuationCalculatorPage";
import SAFECalculatorPage from "./pages/SAFECalculatorPage";
import MarketAnalysisPage from "./pages/MarketAnalysisPage";
import MetricsPage from "./pages/MetricsPage";
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
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PitchDeckGenerator } from "@/components/PitchDeckGenerator";
import { ValuationWizard } from "@/components/ValuationWizard";
import { ProjectionsWizard } from "@/components/projections/ProjectionsWizard";
import { StartupHealthDashboard } from "@/components/StartupHealthDashboard";
import { ComplianceChecker } from "@/components/ComplianceChecker";
import { PricingPage } from "./pages/PricingPage";
import { useUser } from "@/hooks/use-user";
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
import { useState } from "react";
import { WorkflowSuggestions } from "@/components/WorkflowSuggestions";
import { TourGuide } from "@/components/TourGuide";
import { LandingPage } from "./pages/LandingPage";
import { StartupJourneyDashboard } from "@/components/StartupJourneyDashboard";

// Update navigationConfig to include YC-focused features
const navigationConfig = {
  startup: {
    mainTools: [
      { href: "/valuation", label: "Smart Valuation", description: "AI-powered company valuation", icon: Calculator },
      { href: "/metrics", label: "Growth Metrics", description: "Track key startup metrics", icon: BarChart3 },
      { href: "/pitch-deck", label: "Pitch Deck AI", description: "Generate investor-ready pitch decks", icon: FileText },
      { href: "/projections", label: "Financial Projections", description: "AI-driven financial forecasting", icon: BarChart3 },
    ],
    analytics: [
      { href: "/journey", label: "Startup Journey", description: "Track your growth journey", icon: PieChart },
      { href: "/compliance", label: "Global Compliance", description: "Multi-region compliance checks", icon: ClipboardCheck },
      { href: "/market", label: "Market Analysis", description: "Real-time market insights", icon: BarChart3 },
    ]
  },
  investor: {
    mainTools: [
      { href: "/valuation", label: "Full Valuation", description: "Evaluate investment opportunities", icon: Calculator },
      { href: "/safe-calculator", label: "SAFE Calculator", description: "Analyze SAFE terms", icon: Calculator },
      { href: "/calculator", label: "Interactive Calculator", description: "Quick valuation estimates", icon: Calculator },
      { href: "/portfolio", label: "Portfolio", description: "Manage your investment portfolio", icon: PieChart },
      { href: "/deal-flow", label: "Deal Flow", description: "Track and analyze potential investments", icon: BarChart3 },
    ],
    analytics: [
      { href: "/dashboard", label: "Investment Dashboard", description: "Monitor your portfolio performance", icon: PieChart },
      { href: "/market-analysis", label: "Market Analysis", description: "Analyze market trends", icon: BarChart3 },
    ]
  },
  valuer: {
    mainTools: [
      { href: "/valuation", label: "Full Valuation", description: "Professional valuation tools", icon: Calculator },
      { href: "/calculator", label: "Interactive Calculator", description: "Quick scenario analysis", icon: Calculator },
      { href: "/methodology", label: "Methodology", description: "Manage valuation methodologies", icon: BookOpen },
      { href: "/clients", label: "Clients", description: "Manage client relationships", icon: Users },
    ],
    analytics: [
      { href: "/dashboard", label: "Valuation Dashboard", description: "Track valuation projects", icon: PieChart },
      { href: "/benchmarks", label: "Benchmark Analysis", description: "Industry comparisons", icon: BarChart3 },
    ]
  },
  consultant: {
    mainTools: [
      { href: "/valuation", label: "Full Valuation", description: "Advisory focused tools", icon: Calculator },
      { href: "/calculator", label: "Interactive Calculator", description: "Client scenario modeling", icon: Calculator },
      { href: "/clients", label: "Clients", description: "Manage client relationships", icon: Users },
      { href: "/reports", label: "Reports", description: "Generate and manage reports", icon: FileText },
    ],
    analytics: [
      { href: "/dashboard", label: "Advisory Dashboard", description: "Track client projects", icon: PieChart },
      { href: "/resources", label: "Resource Library", description: "Access knowledge base", icon: BookOpen },
    ]
  }
};

const resourceLinks = [
  { href: "/pricing", label: "Pricing", description: "View our subscription plans", icon: Building2 },
  { href: "/docs", label: "API Docs", description: "Access our API documentation", icon: FileText },
];

function App() {
  const { user, isLoading, logout } = useUser();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Update the landing page component to be more YC-focused
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
                <Link href="/auth?mode=login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth?mode=signup">
                  <Button>Start Free Trial</Button>
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

  const userNavigation = navigationConfig[user.role as keyof typeof navigationConfig];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
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
            <div className="border-b p-4">
              <Link href="/">
                <span className="text-xl font-bold cursor-pointer hover:text-primary transition-colors">
                  StartupValuator
                </span>
              </Link>
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
        </header>

        {/* Main Content */}
        <main className="lg:pl-64">
          <div className="min-h-[calc(100vh-4rem)] p-4 lg:p-8">
            <Switch>
              <Route path="/">
                {user && (
                  <DashboardContainer>
                    <StartupHealthDashboard />
                  </DashboardContainer>
                )}
                {!user && <Home />}
              </Route>
              <Route path="/valuation" component={ValuationPage} />
              <Route path="/calculator" component={ValuationCalculatorPage} />
              <Route path="/safe-calculator" component={SAFECalculatorPage} />
              <Route path="/metrics" component={MetricsPage} />
              <Route path="/market" component={MarketAnalysisPage} />
              <Route path="/projections">
                <ProjectionsWizard />
              </Route>
              <Route path="/pitch-deck">
                <PitchDeckGenerator />
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
              <Route path="/journey">
                <DashboardContainer>
                  <StartupJourneyDashboard
                    profile={{
                      journeyMilestones: [
                        {
                          date: new Date().toISOString(),
                          title: "Started Valuation Journey",
                          description: "Beginning the process of understanding your startup's true value",
                          category: "market",
                          impact: 7
                        }
                      ],
                      growthMetrics: [
                        {
                          date: new Date().toISOString(),
                          metric: "User Growth",
                          value: 100,
                          target: 1000,
                          unit: "users"
                        }
                      ],
                      keyAchievements: [
                        {
                          date: new Date().toISOString(),
                          title: "Platform Launch",
                          description: "Successfully launched the initial version",
                          impact: "High"
                        }
                      ],
                      futureGoals: [
                        {
                          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
                          title: "Series A Preparation",
                          description: "Complete valuation and pitch deck for Series A funding",
                          status: "planned",
                          priority: "high"
                        }
                      ]
                    }}
                  />
                </DashboardContainer>
              </Route>
              <Route component={NotFound} />
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