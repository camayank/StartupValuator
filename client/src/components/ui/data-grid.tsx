import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip } from "@/components/ui/tooltip";

interface FinancialFormat {
  currency?: {
    symbol: string;
    precision: number;
  };
  percentages?: {
    precision: number;
  };
}

interface ErrorHandling {
  outOfBoundValues: 'flag' | 'hide' | 'show';
  formulaErrors: 'block' | 'warn' | 'allow';
}

export interface DataGridProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: 'compact' | 'standard';
  financialFormats?: FinancialFormat;
  errorHandling?: ErrorHandling;
  data: any[];
  columns: {
    key: string;
    header: string;
    type?: 'currency' | 'percentage' | 'number' | 'text';
    width?: number;
    formatter?: (value: any) => string;
  }[];
}

const gridVariants = cva(
  "w-full border border-border rounded-md bg-background",
  {
    variants: {
      density: {
        compact: "text-sm",
        standard: "text-base",
      },
    },
    defaultVariants: {
      density: "standard",
    },
  }
);

const cellVariants = cva(
  "px-3 py-2 border-b border-r border-border last:border-r-0",
  {
    variants: {
      density: {
        compact: "py-1",
        standard: "py-2",
      },
      type: {
        currency: "font-mono tabular-nums text-right",
        percentage: "font-mono tabular-nums text-right",
        number: "font-mono tabular-nums text-right",
        text: "text-left",
      },
    },
  }
);

export function DataGrid({
  className,
  density = "standard",
  financialFormats,
  errorHandling,
  data,
  columns,
  ...props
}: DataGridProps) {
  const formatValue = React.useCallback((value: any, type?: string) => {
    if (value == null) return "-";

    switch (type) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: financialFormats?.currency?.precision ?? 2,
        }).format(value);
      case "percentage":
        return new Intl.NumberFormat("en-US", {
          style: "percent",
          minimumFractionDigits: financialFormats?.percentages?.precision ?? 1,
        }).format(value / 100);
      case "number":
        return new Intl.NumberFormat("en-US").format(value);
      default:
        return String(value);
    }
  }, [financialFormats]);

  const isOutOfBounds = React.useCallback((value: any, type?: string) => {
    if (type === "currency" || type === "number") {
      return value < 0 || value > 1e9;
    }
    if (type === "percentage") {
      return value < 0 || value > 100;
    }
    return false;
  }, []);

  return (
    <div className={cn(gridVariants({ density }), className)} {...props}>
      <ScrollArea className="h-full">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      cellVariants({ density, type: column.type }),
                      "font-semibold"
                    )}
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column) => {
                    const value = row[column.key];
                    const formattedValue = column.formatter
                      ? column.formatter(value)
                      : formatValue(value, column.type);
                    const hasError = isOutOfBounds(value, column.type);

                    return (
                      <td
                        key={column.key}
                        className={cn(
                          cellVariants({ density, type: column.type }),
                          hasError && errorHandling?.outOfBoundValues === 'flag' && "text-destructive"
                        )}
                      >
                        {hasError && errorHandling?.outOfBoundValues === 'flag' ? (
                          <Tooltip content="Value out of expected range">
                            <span>{formattedValue}</span>
                          </Tooltip>
                        ) : (
                          formattedValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}
