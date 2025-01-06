import { Switch, Route, Link, useLocation } from "wouter";
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
import { useUser } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "./pages/Home";
import { Documentation } from "./pages/Documentation";
import { Profile } from "./pages/Profile";
import ValuationPage from "./pages/ValuationPage";
import ValuationCalculatorPage from "./pages/ValuationCalculatorPage";
import SAFECalculatorPage from "./pages/SAFECalculatorPage";
import { PitchDeckGenerator } from "@/components/PitchDeckGenerator";
import { ProjectionsWizard } from "@/components/projections/ProjectionsWizard";
import { StartupHealthDashboard } from "@/components/StartupHealthDashboard";
import { ComplianceChecker } from "@/components/ComplianceChecker";
import { PricingPage } from "./pages/PricingPage";
import AuthPage from "./pages/AuthPage";
import { StartupJourneyDashboard } from "@/components/StartupJourneyDashboard";
import { LandingPage } from "./pages/LandingPage";
import { WorkflowSuggestions } from "@/components/WorkflowSuggestions";
import { TourGuide } from "@/components/TourGuide";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

// Navigation configuration for different user roles
const navigationConfig = {
  startup: {
    mainTools: [
      { href: "/valuation", label: "Smart Valuation", description: "AI-powered company valuation", icon: Calculator },
      { href: "/metrics", label: "Growth Metrics", description: "Track key startup metrics", icon: BarChart3 },
      { href: "/pitch-deck", label: "Pitch Deck AI", description: "Generate investor-ready pitch decks", icon: FileText },
      { href: "/projections", label: "Financial Projections", description: "AI-driven financial forecasting", icon: BarChart3 },
    ],
    analytics: [
      { href: "/health", label: "Startup Health", description: "Monitor startup health metrics", icon: PieChart },
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
    ],
    analytics: [
      { href: "/health", label: "Investment Dashboard", description: "Monitor portfolio performance", icon: PieChart },
      { href: "/market", label: "Market Analysis", description: "Analyze market trends", icon: BarChart3 },
    ]
  }
};

const resourceLinks = [
  { href: "/pricing", label: "Pricing", description: "View our subscription plans", icon: Building2 },
  { href: "/docs", label: "API Docs", description: "Access our API documentation", icon: BookOpen },
];

function App() {
  const { user, isLoading, error, logout } = useUser();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error fetching user data
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <h2 className="text-lg font-semibold">Error Loading Application</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || "An unexpected error occurred. Please try again."}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show auth page when accessing auth routes
  if (location.startsWith('/auth')) {
    return <AuthPage />;
  }

  // Show landing page for non-authenticated users
  if (!user && !location.startsWith('/auth')) {
    return <LandingPage />;
  }

  // Safeguard against unexpected state
  if (!user) {
    return <LandingPage />;
  }

  const userNavigation = navigationConfig[user.role as keyof typeof navigationConfig] || navigationConfig.startup;

  return (
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

          <nav className="flex-1 space-y-6 p-4">
            <div>
              <h2 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Main Tools</h2>
              <div className="space-y-1">
                {userNavigation.mainTools.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      location === item.href ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-foreground'
                    }`}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Analytics</h2>
              <div className="space-y-1">
                {userNavigation.analytics.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      location === item.href ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-foreground'
                    }`}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">Resources</h2>
              <div className="space-y-1">
                {resourceLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      location === item.href ? 'bg-primary/10 text-primary' : 'hover:bg-accent text-foreground'
                    }`}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
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

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="min-h-[calc(100vh-4rem)] p-4 lg:p-8">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/valuation" component={ValuationPage} />
            <Route path="/calculator" component={ValuationCalculatorPage} />
            <Route path="/safe-calculator" component={SAFECalculatorPage} />
            <Route path="/pitch-deck" component={PitchDeckGenerator} />
            <Route path="/projections" component={ProjectionsWizard} />
            <Route path="/health" component={StartupHealthDashboard} />
            <Route path="/compliance" component={ComplianceChecker} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/docs" component={Documentation} />
            <Route path="/profile/:userId" component={Profile} />
            <Route path="/journey" component={StartupJourneyDashboard} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>

      {/* Mobile Navigation */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50 lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <nav className="mt-8 space-y-6">
            <div>
              <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Main Tools</h2>
              {userNavigation.mainTools.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-2 ${
                    location === item.href ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div>
              <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Analytics</h2>
              {userNavigation.analytics.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-2 ${
                    location === item.href ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div>
              <h2 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">Resources</h2>
              {resourceLinks.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`flex items-center gap-3 px-4 py-2 ${
                    location === item.href ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <WorkflowSuggestions />
      <TourGuide />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button variant="link" className="mt-4 p-0">
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;