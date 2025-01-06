import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";

const INDUSTRY_CARDS = [
  {
    id: 'saas',
    name: 'SaaS',
    status: 'Live',
    metrics: [
      'MRR/ARR',
      'CAC',
      'LTV',
      'Churn Rate'
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    status: 'Live',
    metrics: [
      'GMV',
      'AOV',
      'Customer Retention',
      'Inventory Turnover'
    ]
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    status: 'Live',
    metrics: [
      'Asset Utilization',
      'Operating Margin',
      'Working Capital',
      'ROIC'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    status: 'Coming Soon',
    metrics: [
      'Patient LTV',
      'Regulatory Compliance',
      'Operating Costs',
      'Revenue/Patient'
    ]
  }
];

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Industry-Specific Valuation Models</h1>
        <p className="text-muted-foreground mt-2">
          Our AI-powered platform adapts to your industry's unique metrics and valuation standards
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {INDUSTRY_CARDS.map((industry) => (
          <Card key={industry.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{industry.name}</h3>
              {industry.status === 'Live' ? (
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                  Live
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                  Coming Soon
                </span>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <h4 className="text-sm font-medium">Key Metrics Analyzed</h4>
              {industry.metrics.map((metric) => (
                <div key={metric} className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary/50 mr-2" />
                  {metric}
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setLocation(`/valuation/new?industry=${industry.id}`)}
              disabled={industry.status !== 'Live'}
            >
              <span>Start Valuation</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}