import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from './button';
import { BrandHeader } from './brand-header';
import {
  Calculator,
  Home,
  Gift,
  LayoutDashboard,
  BarChart3,
  DollarSign,
  User,
  BookOpen,
  Menu,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/valuation/calculator', label: 'Valuation Tool', icon: Calculator },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/pricing', label: 'Pricing', icon: DollarSign },
    { path: '/documentation', label: 'Docs', icon: BookOpen },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <div className="cursor-pointer">
            <BrandHeader size="sm" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}

          <Link href="/referral">
            <Button
              variant={location === '/referral' ? 'secondary' : 'ghost'}
              size="sm"
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Gift className="mr-2 h-4 w-4 relative z-10" />
              <span className="relative z-10">Refer & Earn</span>
              <Sparkles className="ml-1 h-3 w-3 relative z-10 text-yellow-500" />
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <DropdownMenuItem>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  </Link>
                );
              })}
              <Link href="/referral">
                <DropdownMenuItem className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                  <Gift className="mr-2 h-4 w-4" />
                  Refer & Earn
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
