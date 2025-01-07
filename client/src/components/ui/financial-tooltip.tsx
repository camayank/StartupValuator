import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, ExternalLink } from "lucide-react";
import { type FinancialTooltipProps, getTermDefinition } from "@/lib/financialTooltips";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const categoryColors = {
  valuation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  financial: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  market: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  compliance: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

export function FinancialTooltip({
  term,
  showExample = false,
  showCategory = false,
  children,
  ...props
}: FinancialTooltipProps & { children: React.ReactNode }) {
  const termInfo = getTermDefinition(term);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help group">
            {children}
            <motion.span
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity" />
            </motion.span>
          </span>
        </TooltipTrigger>
        <TooltipContent
          className="max-w-sm p-4 space-y-2 shadow-lg animate-in fade-in-0 zoom-in-95"
          {...props}
        >
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-base">{termInfo.term}</h4>
            {showCategory && termInfo.category && (
              <Badge
                variant="secondary"
                className={`text-xs ${categoryColors[termInfo.category]}`}
              >
                {termInfo.category}
              </Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {termInfo.definition}
          </p>

          {showExample && termInfo.example && (
            <div className="mt-2 text-sm">
              <p className="font-medium text-foreground">Example:</p>
              <p className="text-muted-foreground italic">{termInfo.example}</p>
            </div>
          )}

          {termInfo.learnMoreUrl && (
            <a
              href={termInfo.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
            >
              Learn more
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}