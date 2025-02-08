import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calculator,
  ChevronRight,
  FileText,
  Home,
  LogIn,
  Menu,
  UserPlus,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface Route {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const routes: Route[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/calculator",
    label: "Valuation Calculator",
    icon: Calculator,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: FileText,
  },
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center">
        <Link href="/">
          <a className="mr-6 flex items-center space-x-2">
            <Calculator className="h-6 w-6" />
            <span className="font-bold">StartupValue.ai</span>
          </a>
        </Link>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <a className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center space-x-2">
            <Link href="/auth?mode=login">
              <Button variant="ghost" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="flex items-center">
                <Calculator className="mr-2 h-6 w-6" />
                <span className="font-bold">StartupValue.ai</span>
              </Link>
              <div className="my-4 flex flex-col space-y-2">
                {routes.map((route) => (
                  <Link key={route.href} href={route.href}>
                    <a className="flex items-center py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.label}
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </a>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
