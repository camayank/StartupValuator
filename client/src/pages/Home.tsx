import { ValuationForm } from "@/components/ValuationForm";
import { ValuationResult } from "@/components/ValuationResult";
import { useState } from "react";
import type { ValuationData } from "@/lib/validations";

export function Home() {
  const [result, setResult] = useState<ValuationData | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Startup Valuation Tool</h1>
        <p className="text-muted-foreground mb-8">
          Calculate your startup's valuation using industry-standard methodologies
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <ValuationForm onResult={setResult} />
          </div>
          <div>
            <ValuationResult data={result} />
          </div>
        </div>
      </div>
    </div>
  );
}
