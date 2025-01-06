import { Switch, Route, Link } from "wouter";
import { Home } from "./pages/Home";
import { Documentation } from "./pages/Documentation";
import { Profile } from "./pages/Profile";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { PitchDeckGenerator } from "@/components/PitchDeckGenerator";
import { ValuationWizard } from "@/components/ValuationWizard";
import { ProjectionsWizard } from "@/components/projections/ProjectionsWizard";
import { StartupHealthDashboard } from "@/components/StartupHealthDashboard";
import { ComplianceChecker } from "@/components/ComplianceChecker";
import type { ValuationFormData } from "@/lib/validations";

function App() {
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <span className="text-xl font-bold cursor-pointer">StartupValuator</span>
            </Link>
          </div>
          <div className="flex gap-4">
            <Link href="/">
              <span className="text-sm hover:text-primary cursor-pointer">Valuation</span>
            </Link>
            <Link href="/projections">
              <span className="text-sm hover:text-primary cursor-pointer">Financial Projections</span>
            </Link>
            <Link href="/pitch-deck">
              <span className="text-sm hover:text-primary cursor-pointer">Pitch Deck</span>
            </Link>
            <Link href="/dashboard">
              <span className="text-sm hover:text-primary cursor-pointer">Health Dashboard</span>
            </Link>
            <Link href="/compliance">
              <span className="text-sm hover:text-primary cursor-pointer">Compliance Check</span>
            </Link>
            <Link href="/profile/1">
              <span className="text-sm hover:text-primary cursor-pointer">Profile</span>
            </Link>
            <Link href="/docs">
              <span className="text-sm hover:text-primary cursor-pointer">API Docs</span>
            </Link>
          </div>
        </div>
      </nav>

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
        <Route path="/docs" component={Documentation} />
        <Route path="/profile/:userId" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>
          <p className="text-sm text-gray-600">
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