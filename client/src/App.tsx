import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/ui/navigation";
import { ValidationProvider } from "@/contexts/ValidationContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ValuationWizardContainer } from "@/components/ValuationWizardContainer";
import { LandingPage } from "./pages/LandingPage";
import { Suspense, useState, useEffect } from "react";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ValidationProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <Navigation />
          
          <main className="relative">
            <Suspense fallback={<LoadingScreen />}>
              <Switch>
                <Route path="/" component={LandingPage} />
                <Route path="/valuation/calculator">
                  <div className="container py-8">
                    <ValuationWizardContainer />
                  </div>
                </Route>
                <Route>
                  <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                      <p className="text-muted-foreground mb-6">
                        The page you're looking for doesn't exist.
                      </p>
                    </div>
                  </div>
                </Route>
              </Switch>
            </Suspense>
          </main>

          <Toaster />
        </div>
      </ErrorBoundary>
    </ValidationProvider>
  );
}

export default App;