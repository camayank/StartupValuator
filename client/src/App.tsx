import { Switch, Route } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dashboard from "./pages/Dashboard";
import ValuationPage from "./pages/ValuationPage";
import { LandingPage } from "./pages/LandingPage";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/valuation/new" component={ValuationPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

// fallback 404 not found page
function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            The page you're looking for doesn't exist.
          </p>
          <Button variant="link" className="mt-4 p-0" onClick={() => window.location.href = "/"}>
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;