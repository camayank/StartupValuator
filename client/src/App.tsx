import { Switch, Route, Link, useLocation } from "wouter";
import { LandingPage } from "./pages/LandingPage";
import ValuationCalculatorPage from "./pages/ValuationCalculatorPage";
import { Navigation } from "@/components/ui/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { ValuationForm } from "@/components/ValuationForm";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TourGuide } from "@/components/TourGuide";
import { useState, useEffect } from "react";

function App() {
  const { user, isLoading, error, logout } = useUser();
  const [location] = useLocation();
  const { toast } = useToast();

  // Handle loading state
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

  // Handle auth errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: "There was a problem with your session. Please try logging in again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Loading state
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

  // Handle public routes (no auth required)
  if (!user) {
    // Allow calculator preview for non-authenticated users
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

    // Auth routes
    if (location.startsWith('/auth')) {
      return (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <Link href="/" className="inline-block mb-8">
              <span className="text-xl font-bold">StartupValuator</span>
            </Link>
            <Card className="max-w-md mx-auto">
              {/* Auth form will be rendered here */}
            </Card>
          </div>
        </div>
      );
    }

    // Default to landing for non-auth users
    return <LandingPage />;
  }

  // Authenticated app layout
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/calculator">
            <ValuationCalculatorPage />
          </Route>
          <Route path="/valuation">
            <ValuationForm 
              onResult={(data) => {
                console.log('Valuation form data:', data);
                toast({
                  title: "Success",
                  description: "Valuation data saved successfully.",
                });
              }} 
            />
          </Route>
          <Route path="/">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Welcome back, {user.username}
              </h1>
              <ValuationForm 
                onResult={(data) => {
                  console.log('Valuation form data:', data);
                  toast({
                    title: "Success",
                    description: "Valuation data saved successfully.",
                  });
                }}
              />
            </div>
          </Route>
          <Route>
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="w-full max-w-md p-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
                  <p className="text-muted-foreground mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <Link href="/">
                    <Button className="w-full">Return to Home</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </Route>
        </Switch>
      </main>

      <TourGuide />
      <Toaster />
    </div>
  );
}

export default App;