import { Switch, Route, Link } from "wouter";
import { Home } from "./pages/Home";
import { Documentation } from "./pages/Documentation";
import { Profile } from "./pages/Profile";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/">
            <a className="text-xl font-bold">StartupValuator</a>
          </Link>
          <div className="flex gap-4">
            <Link href="/">
              <a className="text-sm hover:text-primary">Valuation</a>
            </Link>
            <Link href="/profile/1">
              <a className="text-sm hover:text-primary">Profile</a>
            </Link>
            <Link href="/docs">
              <a className="text-sm hover:text-primary">API Docs</a>
            </Link>
          </div>
        </div>
      </nav>

      <Switch>
        <Route path="/" component={Home} />
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
            <a className="mt-4 inline-block text-primary hover:underline">
              Return to Home
            </a>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default App;