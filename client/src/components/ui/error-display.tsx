import React from "react";
import { AlertCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ErrorMessage } from "@/lib/error-messaging";

interface ErrorDisplayProps {
  error?: ErrorMessage;
  fieldErrors?: Map<string, string[]>;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, fieldErrors, onDismiss }: ErrorDisplayProps) {
  if (!error && (!fieldErrors || fieldErrors.size === 0)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            {error.type === 'validation' ? 'Validation Error' :
             error.type === 'business' ? 'Business Rule Error' :
             'System Error'}
            {onDismiss && (
              <button onClick={onDismiss} className="p-1 hover:bg-destructive/10 rounded">
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </AlertTitle>
          <AlertDescription>
            <p>{error.message}</p>
            {error.suggestions && (
              <ul className="mt-2 list-disc pl-4">
                {error.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {fieldErrors && fieldErrors.size > 0 && (
        <div className="space-y-2">
          {Array.from(fieldErrors.entries()).map(([field, errors]) => (
            <Alert key={field} variant="destructive" className="border-l-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error in {field}</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, i) => (
                    <li key={i} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

export default ErrorDisplay;
