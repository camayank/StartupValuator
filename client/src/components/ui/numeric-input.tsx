import { useState, useEffect, forwardRef } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: number | undefined) => void;
  prefix?: string;
  suffix?: string;
  allowNegative?: boolean;
  thousandSeparator?: string;
  decimalSeparator?: string;
  decimalScale?: number;
  defaultValue?: number;
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

    return (
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
        )}
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
            className
          )}
        />
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
