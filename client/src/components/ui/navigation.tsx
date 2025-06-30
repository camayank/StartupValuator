import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { BrandHeader } from "@/components/ui/brand-header";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Home,
  LogIn,
  Menu,
  Settings,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Route {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

const routes: Route[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: Home,
    description: "Overview and analytics"
  },
  {
    href: "/valuation/calculator",
    label: "Valuation Calculator",
    icon: TrendingUp,
    badge: "Pro",
    description: "AI-powered startup valuation"
  },
  {
    href: "/analysis",
    label: "Market Analysis",
    icon: BarChart3,
    description: "Industry insights and benchmarks"
  },
  {
    href: "/reports",
    label: "Reports & Exports",
    icon: FileText,
    description: "Professional valuation reports"
  },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/">
          <a className="flex items-center">
            <BrandHeader size="sm" />
          </a>
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
