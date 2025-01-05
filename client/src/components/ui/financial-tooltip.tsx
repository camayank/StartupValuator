import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { type FinancialTooltipProps, getTermDefinition } from "@/lib/financialTooltips";

export function FinancialTooltip({
  term,
  showExample = false,
  children,
  ...props
}: FinancialTooltipProps & { children: React.ReactNode }) {
  const termInfo = getTermDefinition(term);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help">
            {children}
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-sm p-4 space-y-2"
          {...props}
        >
          <p className="font-medium">{termInfo.term}</p>
          <p className="text-sm text-muted-foreground">{termInfo.definition}</p>
          {showExample && termInfo.example && (
            <p className="text-sm text-muted-foreground italic">
              Example: {termInfo.example}
            </p>
          )}
          {termInfo.learnMoreUrl && (
            <a
              href={termInfo.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Learn more →
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
