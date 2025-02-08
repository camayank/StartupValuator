import { CompanyCardView } from "@/components/CompanyCardView";

export default function ValuationCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Value Your Company
          </h1>
          <p className="text-lg text-muted-foreground">
            Get an accurate valuation in minutes using advanced AI and real market data
          </p>
        </div>

        <CompanyCardView 
          onDataChange={(data) => {
            console.log('Company data updated:', data);
            // Will implement data handling in next iteration
          }}
        />
      </div>
    </div>
  );
}