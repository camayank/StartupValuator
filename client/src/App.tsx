import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Home } from "./pages/Home";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ValidationProvider } from "@/contexts/ValidationContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ValuationWizardContainer } from "@/components/ValuationWizardContainer";
import { Suspense, lazy, useState, useEffect } from "react";

// Lazy load the step components
const LazyValuationSimulationStep = lazy(() => import("@/components/wizard-steps/ValuationSimulationStep"));
const LazyStageWizard = lazy(() => import("@/components/StageWizard/StageWizard").then(mod => ({ default: mod.StageWizard })));
const LazyMarketAnalysisStep = lazy(() => import("@/components/wizard-steps/MarketAnalysisStep").then(mod => ({ default: mod.MarketAnalysisStep })));
const LazyFinancialDetailsStep = lazy(() => import("@/components/wizard-steps/FinancialDetailsStep").then(mod => ({ default: mod.FinancialDetailsStep })));

interface StepData {
  [key: string]: any;
}

function App() {
  const { toast } = useToast();
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
    <ErrorBoundary>
      <ValidationProvider>
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                  <span className="font-bold inline-block">StartupValuator</span>
                </Link>
              </div>
              <div className="flex flex-1 items-center space-x-2 justify-end">
                <ThemeToggle />
                <Link href="/docs">
                  <Button variant="outline">Documentation</Button>
                </Link>
                <Link href="/valuation/calculator">
                  <Button>Start Valuation</Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <Suspense fallback={<LoadingScreen />}>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/valuation/stages">
                  <div className="container py-8">
                    <LazyStageWizard />
                  </div>
                </Route>
                <Route path="/valuation/calculator">
                  <div className="container py-8">
                    <ValuationWizardContainer />
                  </div>
                </Route>
                <Route path="/valuation/quick">
                  <div className="container py-8">
                    <LazyValuationSimulationStep 
                      onUpdate={async (data) => {
                        try {
                          // Implement your update logic here
                          toast({
                            title: "Success",
                            description: "Your valuation data has been saved.",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: error instanceof Error ? error.message : "Failed to save valuation data",
                            variant: "destructive",
                          });
                        }
                      }}
                    />
                  </div>
                </Route>
                <Route path="/valuation/detailed">
                  <div className="container py-8">
                    <LazyMarketAnalysisStep 
                      data={{} as StepData}
                      onUpdate={(data: StepData) => {
                        toast({
                          title: "Success",
                          description: "Your market analysis data has been saved.",
                        });
                      }}
                      onBack={() => window.history.back()}
                    />
                  </div>
                </Route>
                <Route path="/valuation/financial">
                  <div className="container py-8">
                    <LazyFinancialDetailsStep 
                      data={{} as StepData}
                      onUpdate={(data: StepData) => {
                        toast({
                          title: "Success",
                          description: "Your financial data has been saved.",
                        });
                      }}
                      onBack={() => window.history.back()}
                    />
                  </div>
                </Route>
                <Route>
                  <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                      <p className="text-muted-foreground mb-6">
                        The page you're looking for doesn't exist.
                      </p>
                      <Link href="/">
                        <Button>Return Home</Button>
                      </Link>
                    </div>
                  </div>
                </Route>
              </Switch>
            </Suspense>
          </main>

          <Toaster />
        </div>
      </ValidationProvider>
    </ErrorBoundary>
  );
}

export default App;