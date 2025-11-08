import React, { Suspense, useState, useEffect } from "react";
import { Switch, Route, Link } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { ValidationProvider } from "@/contexts/ValidationContext";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ValuationWizardContainer } from "@/components/ValuationWizardContainer";
import { ReferralSystem } from "@/components/ReferralSystem";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { PricingPage } from "./pages/PricingPage";
import { Profile } from "./pages/Profile";
import { Documentation } from "./pages/Documentation";
import AuthPage from "./pages/AuthPage";
import { useReferralTracking } from "@/hooks/useReferralTracking";

function App() {
  useReferralTracking();

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
                <Route path="/dashboard" component={DashboardPage} />
                <Route path="/analytics" component={AnalyticsPage} />
                <Route path="/pricing" component={PricingPage} />
                <Route path="/profile" component={Profile} />
                <Route path="/documentation" component={Documentation} />
                <Route path="/auth" component={AuthPage} />
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

          <Toaster />
        </div>
      </ErrorBoundary>
    </ValidationProvider>
  );
}

export default App;