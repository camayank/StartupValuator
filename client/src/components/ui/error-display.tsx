import React from "react";
import { AlertCircle, InfoIcon, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ValidationResult } from "@/lib/business-rules-engine";

interface ErrorDisplayProps {
  validations?: Map<string, ValidationResult>;
  onDismiss?: () => void;
}

export function ErrorDisplay({ validations, onDismiss }: ErrorDisplayProps) {
  if (!validations || validations.size === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {Array.from(validations.entries()).map(([field, validation], index) => (
        <Alert 
          key={`${field}-${index}`}
          variant={validation.severity === 'error' ? "destructive" : "default"}
          className={`border-l-4 ${
            validation.severity === 'error' 
              ? "border-l-destructive bg-destructive/5" 
              : "border-l-primary bg-primary/5"
          }`}
        >
          <div className="flex items-start gap-2">
            {validation.severity === 'error' ? (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            ) : (
              <InfoIcon className="h-5 w-5 text-primary mt-0.5" />
            )}
            <div className="flex-1">
              <AlertTitle className="flex items-center justify-between font-medium mb-2">
                <span>
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
                {onDismiss && (
                  <button 
                    onClick={onDismiss}
                    className="p-1 hover:bg-background/10 rounded transition-colors"
                    aria-label="Dismiss"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </AlertTitle>
              <AlertDescription>
                {validation.message && (
                  <p className="text-sm mb-2">{validation.message}</p>
                )}
                {validation.suggestions && validation.suggestions.length > 0 && (
                  <div className="bg-background/40 rounded-md p-3 space-y-2">
                    <h4 className="text-sm font-medium">Suggestions:</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {validation.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}

export default ErrorDisplay;