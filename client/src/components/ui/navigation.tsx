import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from './button';
import { BrandHeader } from './brand-header';
import { Calculator, Home, Gift } from 'lucide-react';

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <BrandHeader size="sm" />
        </Link>
        
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button 
              variant={location === '/' ? 'default' : 'ghost'} 
              size="sm"
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
              Valuation Tool
            </Button>
          </Link>

          <Link href="/referral">
            <Button 
              variant={location === '/referral' ? 'default' : 'ghost'} 
              size="sm"
              className="bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20"
            >
              <Gift className="mr-2 h-4 w-4" />
              Refer & Earn
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}