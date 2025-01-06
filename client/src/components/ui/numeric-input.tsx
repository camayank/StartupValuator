import { useState, useEffect, forwardRef } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number | undefined) => void;
  prefix?: string;
  suffix?: string;
  allowNegative?: boolean;
  thousandSeparator?: string;
  decimalSeparator?: string;
  decimalScale?: number;
  defaultValue?: number;
  warning?: {
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string | number;
  };
}

export const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      className,
      onValueChange,
      prefix = "",
      suffix = "",
      allowNegative = false,
      thousandSeparator = ",",
      decimalSeparator = ".",
      decimalScale = 0,
      defaultValue,
      warning,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState("");

    // Format number for display
    const formatNumber = (num: number | undefined) => {
      if (num === undefined) return "";

      const fixed = Number(num).toFixed(decimalScale);
      const [whole, decimal] = fixed.split(".");

      const parts = [];
      let count = 0;
      for (let i = whole.length - 1; i >= 0; i--) {
        if (count === 3) {
          parts.unshift(thousandSeparator);
          count = 0;
        }
        parts.unshift(whole[i]);
        count++;
      }

      const formattedWhole = parts.join("");
      return decimal 
        ? `${formattedWhole}${decimalSeparator}${decimal}` 
        : formattedWhole;
    };

    // Parse display value to number
    const parseNumber = (value: string): number | undefined => {
      const cleaned = value
        .replace(new RegExp(`\\${thousandSeparator}`, "g"), "")
        .replace(decimalSeparator, ".");

      if (cleaned === "") return undefined;

      const num = parseFloat(cleaned);
      return isNaN(num) ? undefined : num;
    };

    // Initialize with default value
    useEffect(() => {
      if (defaultValue !== undefined) {
        setDisplayValue(formatNumber(defaultValue));
      }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;

      // Only allow digits, separators, and negative sign
      newValue = newValue.replace(/[^\d\-.,]/g, "");

      if (!allowNegative) {
        newValue = newValue.replace("-", "");
      }

      setDisplayValue(newValue);

      const numericValue = parseNumber(newValue);
      onValueChange?.(numericValue);
    };

    const handleClear = () => {
      setDisplayValue("");
      onValueChange?.(undefined);
    };

    const getWarningColor = (severity: 'low' | 'medium' | 'high') => {
      switch (severity) {
        case 'low':
          return 'text-yellow-500';
        case 'medium':
          return 'text-orange-500';
        case 'high':
          return 'text-red-500';
        default:
          return 'text-yellow-500';
      }
    };

    return (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
        )}
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            className={cn(
              prefix && "pl-8",
              suffix && "pr-8",
              "pr-8",
              warning && `border-${getWarningColor(warning.severity)}`,
              className
            )}
          />
          {warning && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`absolute right-8 top-1/2 -translate-y-1/2 ${getWarningColor(warning.severity)}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-medium">{warning.message}</p>
                    {warning.suggestion && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Suggested value: {warning.suggestion}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {suffix && (
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground">
            {suffix}
          </span>
        )}
        {displayValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

NumericInput.displayName = "NumericInput";