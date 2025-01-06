import { Switch, Route, Link, useLocation } from "wouter";
import { Home } from "./pages/Home";
import { Documentation } from "./pages/Documentation";
import { Profile } from "./pages/Profile";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, Menu } from "lucide-react";
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
import type { ValuationFormData } from "@/lib/validations";

function App() {
  const { user, isLoading, error, logout } = useUser();
  const [location] = useLocation();

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-4 py-3 bg-card">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <span className="text-xl font-bold cursor-pointer hover:text-primary transition-colors">
                StartupValuator
              </span>
            </Link>
          </div>
          <div className="hidden md:flex gap-6">
            <Link href="/">
              <span className={`text-sm hover:text-primary cursor-pointer transition-colors ${location === '/' ? 'text-primary' : ''}`}>
                Valuation
              </span>
            </Link>
            <Link href="/projections">
              <span className={`text-sm hover:text-primary cursor-pointer transition-colors ${location === '/projections' ? 'text-primary' : ''}`}>
                Financial Projections
              </span>
            </Link>
            <Link href="/pitch-deck">
              <span className={`text-sm hover:text-primary cursor-pointer transition-colors ${location === '/pitch-deck' ? 'text-primary' : ''}`}>
                Pitch Deck
              </span>
            </Link>
            <Link href="/dashboard">
              <span className={`text-sm hover:text-primary cursor-pointer transition-colors ${location === '/dashboard' ? 'text-primary' : ''}`}>
                Health Dashboard
              </span>
            </Link>
            <Link href="/compliance">
              <span className={`text-sm hover:text-primary cursor-pointer transition-colors ${location === '/compliance' ? 'text-primary' : ''}`}>
                Compliance Check
              </span>
            </Link>
            <Link href="/pricing">
              <span className={`text-sm hover:text-primary cursor-pointer transition-colors ${location === '/pricing' ? 'text-primary' : ''}`}>
                Pricing
              </span>
            </Link>
            <Link href="/docs">
              <span className={`text-sm hover:text-primary cursor-pointer transition-colors ${location === '/docs' ? 'text-primary' : ''}`}>
                API Docs
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
                  <span className="text-sm font-medium">{user.username}</span>
                  <Menu className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={`/profile/${user.id}`}>
                    <DropdownMenuItem className="cursor-pointer">
                      Profile Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <span className="text-sm hover:text-primary cursor-pointer transition-colors">
                  Login
                </span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-4rem)]">
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
    </div>
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