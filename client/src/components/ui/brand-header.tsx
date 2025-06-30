import { Calculator, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandHeaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function BrandHeader({ className, size = "md", showTagline = false }: BrandHeaderProps) {
  const sizes = {
    sm: {
      icon: "h-6 w-6",
      title: "text-xl font-bold",
      tagline: "text-sm"
    },
    md: {
      icon: "h-8 w-8",
      title: "text-2xl font-bold",
      tagline: "text-base"
    },
    lg: {
      icon: "h-12 w-12",
      title: "text-4xl font-bold",
      tagline: "text-lg"
    }
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-30"></div>
        <div className="relative bg-primary text-primary-foreground p-2 rounded-lg">
          <Calculator className={cn(sizes[size].icon)} />
        </div>
      </div>
      <div className="flex flex-col">
        <h1 className={cn(sizes[size].title, "text-primary leading-none")}>
          ValuationPro
        </h1>
        {showTagline && (
          <p className={cn(sizes[size].tagline, "text-muted-foreground leading-tight")}>
            Professional Startup Valuation Platform
          </p>
        )}
      </div>
    </div>
  );
}