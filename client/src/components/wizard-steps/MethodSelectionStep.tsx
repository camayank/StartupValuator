import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { ValuationFormData } from "@/lib/validations";

interface MethodSelectionStepProps {
  data: Partial<ValuationFormData>;
  onUpdate: (data: Partial<ValuationFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function MethodSelectionStep({ data, onUpdate, onNext, onBack }: MethodSelectionStepProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Based on your business profile, we'll recommend the most appropriate valuation methods.
          This helps ensure accurate and relevant results for your specific situation.
        </AlertDescription>
      </Alert>

      {/* Method selection will be implemented in the next iteration */}
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Method selection component will be implemented in the next iteration.
          For now, you can proceed to the next step.
        </p>
      </div>
    </div>
  );
}
