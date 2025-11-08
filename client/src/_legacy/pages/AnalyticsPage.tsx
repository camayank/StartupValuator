import { AdvancedCharts } from "@/components/charts/AdvancedCharts";

export function AnalyticsPage() {
  const demoData = {
    revenue: [
      { month: "Jan", value: 120000 },
      { month: "Feb", value: 145000 },
      { month: "Mar", value: 178000 },
      { month: "Apr", value: 210000 },
      { month: "May", value: 245000 },
      { month: "Jun", value: 290000 }
    ],
    valuation: 15000000,
    scenarios: {
      best: 22000000,
      base: 15000000,
      worst: 9000000
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive financial analysis and projections
        </p>
      </div>
      <AdvancedCharts data={demoData} />
    </div>
  );
}
