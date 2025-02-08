import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { Home } from "./pages/Home";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function App() {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold inline-block">StartupValuator</span>
            </a>
          </div>
          <div className="flex flex-1 items-center space-x-2 justify-end">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <a href="/docs">Documentation</a>
            </Button>
            <Button>
              <a href="/get-started">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route>
            <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-muted-foreground mb-6">
                  The page you're looking for doesn't exist.
                </p>
                <Button asChild>
                  <a href="/">Return Home</a>
                </Button>
              </div>
            </div>
          </Route>
        </Switch>
      </main>

      <Toaster />
    </div>
  );
}

export default App;