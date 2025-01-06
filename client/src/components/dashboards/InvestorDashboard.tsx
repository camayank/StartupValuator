import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { formatCurrency } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface PortfolioData {
  metrics: {
    totalInvested: number;
    portfolioValue: number;
    activeDeals: number;
    totalReturns: number;
    averageROI: number;
    monthlyGrowth: number;
    successRate: number;
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
    performance: number;
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
      monthlyGrowth: 4.5,
      successRate: 75
    },
    investmentTrend: [
      { month: 'Jan', invested: 2000000, returns: 2200000 },
      { month: 'Feb', invested: 2200000, returns: 2400000 },
      { month: 'Mar', invested: 2300000, returns: 2600000 },
      { month: 'Apr', invested: 2400000, returns: 2900000 },
      { month: 'May', invested: 2500000, returns: 3200000 },
    ],
    sectorAllocation: [
      { sector: 'SaaS', startups: 3, invested: 1000000, performance: 32 },
      { sector: 'Fintech', startups: 2, invested: 800000, performance: 28 },
      { sector: 'Health Tech', startups: 2, invested: 500000, performance: 15 },
      { sector: 'AI/ML', startups: 1, invested: 200000, performance: 40 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Portfolio Overview</h1>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Track your investment portfolio performance and sector allocation.
          </AlertDescription>
        </Alert>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              mockData.metrics.monthlyGrowth > 0 
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}>
              <div className="flex items-center gap-1">
                {mockData.metrics.monthlyGrowth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {mockData.metrics.monthlyGrowth}%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.metrics.portfolioValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current valuation
            </p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary"
                style={{ width: `${(mockData.metrics.portfolioValue / (mockData.metrics.totalInvested * 2)) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
              {mockData.metrics.activeDeals} Startups
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.metrics.totalInvested)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Capital deployed
            </p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500"
                style={{ width: `${(mockData.metrics.activeDeals / 10) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <div className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
              Unrealized
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.metrics.totalReturns)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Net gains
            </p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${(mockData.metrics.totalReturns / mockData.metrics.totalInvested) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              mockData.metrics.successRate >= 70 ? "bg-green-100 text-green-800" :
              mockData.metrics.successRate >= 50 ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            )}>
              {mockData.metrics.successRate}%
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.metrics.averageROI}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average ROI
            </p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full",
                  mockData.metrics.averageROI >= 25 ? "bg-green-500" :
                  mockData.metrics.averageROI >= 15 ? "bg-yellow-500" :
                  "bg-red-500"
                )}
                style={{ width: `${Math.min(100, (mockData.metrics.averageROI / 40) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
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
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="invested" 
                  name="Invested" 
                  stackId="1" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                />
                <Area 
                  type="monotone" 
                  dataKey="returns" 
                  name="Returns" 
                  stackId="2" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Sector Performance</CardTitle>
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
                <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                <XAxis dataKey="sector" />
                <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="startups" 
                  name="Number of Startups" 
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="performance" 
                  name="ROI %" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}