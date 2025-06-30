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
  TrendingUp,
  Users,
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
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <a
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive(route.href)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <route.icon className="h-4 w-4" />
                <span>{route.label}</span>
                {route.badge && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {route.badge}
                  </Badge>
                )}
              </a>
            </Link>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
          <Button size="sm" className="hidden sm:flex">
            Get Started
          </Button>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-6">
                <BrandHeader size="sm" showTagline />
                
                <div className="border-t pt-4">
                  <nav className="flex flex-col space-y-1">
                    {routes.map((route) => (
                      <Link key={route.href} href={route.href}>
                        <a
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg transition-colors",
                            isActive(route.href)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          )}
                          onClick={() => setOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <route.icon className="h-5 w-5" />
                            <div className="flex flex-col">
                              <span className="font-medium">{route.label}</span>
                              {route.description && (
                                <span className="text-xs opacity-70">
                                  {route.description}
                                </span>
                              )}
                            </div>
                          </div>
                          {route.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {route.badge}
                            </Badge>
                          )}
                        </a>
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  <Button className="w-full justify-start">
                    Get Started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}