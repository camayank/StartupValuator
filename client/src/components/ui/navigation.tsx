import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from './button';
import { BrandHeader } from './brand-header';
import { ThemeToggle } from './theme-toggle';
import { Calculator, Home, Gift, Sparkles } from 'lucide-react';

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <div className="cursor-pointer">
            <BrandHeader size="sm" />
          </div>
        </Link>

        <div className="flex items-center space-x-1 md:space-x-2">
          <Link href="/">
            <Button
              variant={location === '/' ? 'default' : 'ghost'}
              size="sm"
              className="hidden md:flex"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>

          <Link href="/valuation/calculator">
            <Button
              variant={location === '/valuation/calculator' ? 'default' : 'ghost'}
              size="sm"
            >
              <Calculator className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Valuation Tool</span>
              <span className="sm:hidden">Calculate</span>
            </Button>
          </Link>

          <Link href="/referral">
            <Button
              variant={location === '/referral' ? 'secondary' : 'ghost'}
              size="sm"
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Gift className="mr-2 h-4 w-4 relative z-10" />
              <span className="relative z-10 hidden sm:inline">Refer & Earn</span>
              <span className="relative z-10 sm:hidden">Refer</span>
              <Sparkles className="ml-1 h-3 w-3 relative z-10 text-yellow-500 hidden md:inline" />
            </Button>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}