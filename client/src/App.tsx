import { Switch, Route, Link, useLocation } from "wouter";
import { LandingPage } from "./pages/LandingPage";
import ValuationCalculatorPage from "./pages/ValuationCalculatorPage";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  ChevronRight,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Loader2,
  Home,
  Calculator,
  FileText,
  BarChart3,
  Users,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ValuationForm } from "@/components/ValuationForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthPage from "./pages/AuthPage";
import { useState, useEffect } from "react";
import { TourGuide } from "@/components/TourGuide";

// Navigation items configuration
const navigationItems = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: Home,
    description: "Overview of your startup metrics"
  },
  { 
    href: "/valuation", 
    label: "Valuation Form", 
    icon: FileText,
    description: "Complete startup valuation"
  },
  { 
    href: "/calculator", 
    label: "Quick Calculator", 
    icon: Calculator,
    description: "Quick valuation estimate"
  },
  { 
    href: "/metrics", 
    label: "Key Metrics", 
    icon: BarChart3,
    description: "Track important KPIs"
  },
  { 
    href: "/team", 
    label: "Team", 
    icon: Users,
    description: "Manage team and roles"
  }
];

function App() {
  const { user, isLoading, error, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: "There was a problem loading your account. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const [showLoadingError, setShowLoadingError] = useState(false);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => setShowLoadingError(true), 5000);
    } else {
      setShowLoadingError(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // Handle loading state
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

  // Handle public routes
  if (!user) {
    if (location === '/calculator') {
      return (
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <Link href="/">
                <span className="text-xl font-bold">StartupValuator</span>
              </Link>
              <div className="ml-auto flex items-center gap-4">
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
    if (location.startsWith('/auth')) {
      return <AuthPage />;
    }
    return <LandingPage />;
  }

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/';
      },
      onError: (error) => {
        toast({
          title: "Logout Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 z-50">
        <div className="flex flex-col flex-grow bg-card border-r">
          <div className="flex items-center h-16 px-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-xl">StartupValuator</span>
            </Link>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={`
                  flex items-center px-3 py-2 rounded-md text-sm
                  ${location === item.href 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}>
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
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
                    Settings
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
      <header className="lg:hidden sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-2 mt-4">
                {navigationItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-md
                        ${location === item.href 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-accent'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="ml-4">
            <span className="font-bold text-xl">StartupValuator</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
                <DropdownMenuItem className="text-muted-foreground">
                  Role: {user.role}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href={`/profile/${user.id}`}>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                </Link>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          <Switch>
            <Route path="/calculator">
              <ValuationCalculatorPage />
            </Route>
            <Route path="/valuation">
              <ValuationForm onResult={(data) => {
                console.log('Valuation form data:', data);
                toast({
                  title: "Success",
                  description: "Valuation data saved successfully.",
                });
              }} />
            </Route>
            <Route path="/">
              <ValuationForm onResult={(data) => {
                console.log('Valuation form data:', data);
                toast({
                  title: "Success",
                  description: "Valuation data saved successfully.",
                });
              }} />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </div>
      </main>

      <TourGuide />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            The page you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button variant="default" className="w-full">
              Return to Home
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default App;