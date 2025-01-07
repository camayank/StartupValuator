import { useFormContext } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, type ValuationFormData } from "@/lib/validations";

export function ValuationResultsStep() {
  const form = useFormContext<ValuationFormData>();
  const { valuation, details } = form.getValues();

  if (!valuation || !details) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Valuation Results</CardTitle>
          <CardDescription>
            Please complete all previous steps and submit the form.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Valuation Results</CardTitle>
          <CardDescription>
            Here's a breakdown of your startup's valuation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-4">
            {formatCurrency(valuation)}
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Base Valuation</h4>
              <p className="text-2xl">{formatCurrency(details.baseValuation)}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Valuation Methods</h4>
              <div className="space-y-2">
                {details.methodResults.map((method, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{method.method}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>{formatCurrency(method.value)}</p>
                      <p className="text-sm text-muted-foreground">
                        Weight: {(method.weight * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Adjustments</h4>
              <div className="space-y-2">
                {Object.entries(details.adjustments).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span>{(value * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
