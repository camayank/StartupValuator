import { InteractiveValuationCalculator } from "@/components/InteractiveValuationCalculator";

export default function ValuationCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Startup Valuation Calculator</h1>
        <p className="text-muted-foreground mb-8">
          Use our interactive calculator to get a real-time valuation estimate for your startup.
          Adjust the parameters to see how different factors affect your company's value.
        </p>
        <InteractiveValuationCalculator />
      </div>
    </div>
  );
}
