import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { formatCurrency } from "@/lib/validations";

interface PortfolioData {
  metrics: {
    totalInvested: number;
    portfolioValue: number;
    activeDeals: number;
    totalReturns: number;
    averageROI: number;
  };
  investmentTrend: Array<{
    month: string;
    invested: number;
    returns: number;
  }>;
  sectorAllocation: Array<{
    sector: string;
    startups: number;
    invested: number;
  }>;
}

export function InvestorDashboard() {
  // In a real app, this would come from an API
  const mockData: PortfolioData = {
    metrics: {
      totalInvested: 2500000,
      portfolioValue: 3200000,
      activeDeals: 8,
      totalReturns: 700000,
      averageROI: 28,
    },
    investmentTrend: [
      { month: 'Jan', invested: 2000000, returns: 2200000 },
      { month: 'Feb', invested: 2200000, returns: 2400000 },
      { month: 'Mar', invested: 2300000, returns: 2600000 },
      { month: 'Apr', invested: 2400000, returns: 2900000 },
      { month: 'May', invested: 2500000, returns: 3200000 },
    ],
    sectorAllocation: [
      { sector: 'SaaS', startups: 3, invested: 1000000 },
      { sector: 'Fintech', startups: 2, invested: 800000 },
      { sector: 'Health Tech', startups: 2, invested: 500000 },
      { sector: 'AI/ML', startups: 1, invested: 200000 },
    ],
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Track your investment portfolio performance and sector allocation.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.metrics.portfolioValue)}</div>
            <p className="text-xs text-muted-foreground">
              +28% total return
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.metrics.totalInvested)}</div>
            <p className="text-xs text-muted-foreground">
              Across {mockData.metrics.activeDeals} startups
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.metrics.totalReturns)}</div>
            <p className="text-xs text-muted-foreground">
              Unrealized gains
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.metrics.averageROI}%</div>
            <p className="text-xs text-muted-foreground">
              Portfolio performance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockData.investmentTrend}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Area type="monotone" dataKey="invested" name="Invested" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="returns" name="Returns" stackId="2" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockData.sectorAllocation}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="startups" name="Number of Startups" fill="#82ca9d" />
                <Bar yAxisId="right" dataKey="invested" name="Amount Invested" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
