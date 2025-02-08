import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Home } from "./pages/Home";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ValuationSimulationStep } from "@/components/wizard-steps/ValuationSimulationStep";
import { MarketAnalysisStep } from "@/components/wizard-steps/MarketAnalysisStep";
import { FinancialDetailsStep } from "@/components/wizard-steps/FinancialDetailsStep";
import { Link } from "wouter";
import { ValidationProvider } from "@/contexts/ValidationContext";

function App() {
  const { toast } = useToast();

  return (
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
              <Link href="/valuation/quick">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/valuation/quick">
              <div className="container py-8">
                <ValuationSimulationStep 
                  onUpdate={async (data) => {
                    toast({
                      title: "Valuation updated",
                      description: "Your valuation data has been saved.",
                    });
                  }}
                />
              </div>
            </Route>
            <Route path="/valuation/detailed">
              <div className="container py-8">
                <MarketAnalysisStep 
                  data={{}}
                  onUpdate={(data) => {
                    toast({
                      title: "Market analysis updated",
                      description: "Your market analysis data has been saved.",
                    });
                  }}
                  onBack={() => window.history.back()}
                />
              </div>
            </Route>
            <Route path="/valuation/financial">
              <div className="container py-8">
                <FinancialDetailsStep 
                  data={{}}
                  onUpdate={(data) => {
                    toast({
                      title: "Financial details updated",
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
        </main>

        <Toaster />
      </div>
    </ValidationProvider>
  );
}

export default App;