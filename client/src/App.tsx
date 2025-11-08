import React, { Suspense, useState, useEffect } from "react";
import { Switch, Route, Link } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { ValidationProvider } from "@/contexts/ValidationContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ValuationWizardContainer } from "@/components/ValuationWizardContainer";
import { ReferralSystem } from "@/components/ReferralSystem";
import { LandingPage } from "./pages/LandingPage";
import { useReferralTracking } from "@/hooks/useReferralTracking";

function App() {
  useReferralTracking();

  return (
    <ValidationProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-background flex flex-col">
          <Navigation />

          <main className="relative flex-1">
            <Suspense fallback={<LoadingScreen />}>
              <Switch>
                <Route path="/" component={LandingPage} />
                <Route path="/valuation/calculator">
                  <div className="container py-8">
                    <ValuationWizardContainer />
                  </div>
                </Route>
                <Route path="/referral" component={ReferralSystem} />
                <Route>
                  <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                      <p className="text-muted-foreground mb-6">
                        The page you're looking for doesn't exist.
                      </p>
                      <Link href="/">
                        <Button>
                          Back to Home
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Route>
              </Switch>
            </Suspense>
          </main>

          <Footer />
          <Toaster />
        </div>
      </ErrorBoundary>
    </ValidationProvider>
  );
}

export default App;