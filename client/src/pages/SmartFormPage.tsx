import { useState } from "react";
import { SmartFormValidation } from "@/components/forms/SmartFormValidation";
import { TooltipProvider } from "@/components/ui/tooltip";

export function SmartFormPage() {
  const [formData, setFormData] = useState<any>({});

  return (
    <TooltipProvider>
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Smart Form Validation</h1>
          <p className="text-muted-foreground">
            Industry-specific validation with AI-powered suggestions
          </p>
        </div>
        <SmartFormValidation 
          industry="Technology"
          stage="Series A"
          region="India"
          onDataChange={setFormData}
        />
      </div>
    </TooltipProvider>
  );
}
