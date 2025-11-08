import { ExecutiveDashboard } from "@/components/dashboards/ExecutiveDashboard";

export function DashboardPage() {
  const demoCompanyData = {
    name: "TechStartup Inc.",
    stage: "Series A",
    industry: "SaaS",
    valuation: 15000000,
    confidence: 87,
    lastUpdated: new Date().toISOString()
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Executive Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive KPI overview and performance metrics
        </p>
      </div>
      <ExecutiveDashboard companyData={demoCompanyData} />
    </div>
  );
}
