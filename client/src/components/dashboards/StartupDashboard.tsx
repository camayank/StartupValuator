import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, TrendingUp, TrendingDown, Target, Users, LineChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { ReadinessScore } from "@/lib/fundingReadiness";

interface DashboardData {
  metrics: {
    revenue: number;
    expenses: number;
    cashflow: number;
    runway: number;
    burnRate: number;
    revenueGrowth: number;
    marginGrowth: number;
  };
  revenueTrend: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  fundAllocation: Array<{
    category: string;
    value: number;
  }>;
  readinessScore?: ReadinessScore;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function StartupDashboard() {
  // In a real app, this would come from an API
  const mockData: DashboardData = {
    metrics: {
      revenue: 500000,
      expenses: 350000,
      cashflow: 150000,
      runway: 18,
      burnRate: 35000,
      revenueGrowth: 15,
      marginGrowth: 8
    },
    revenueTrend: [
      { month: 'Jan', revenue: 400000, expenses: 300000 },
      { month: 'Feb', revenue: 420000, expenses: 310000 },
      { month: 'Mar', revenue: 450000, expenses: 320000 },
      { month: 'Apr', revenue: 480000, expenses: 340000 },
      { month: 'May', revenue: 500000, expenses: 350000 },
    ],
    fundAllocation: [
      { category: 'Product Development', value: 40 },
      { category: 'Marketing', value: 25 },
      { category: 'Operations', value: 20 },
      { category: 'Sales', value: 15 },
    ],
    readinessScore: {
      overallScore: 75,
      categories: {
        financial: {
          score: 0.8,
          metrics: {
            revenueGrowth: 0.85,
            margins: 0.75,
            cashRunway: 0.8,
          },
        },
        market: {
          score: 0.7,
          metrics: {
            marketSize: 0.8,
            competitiveLandscape: 0.6,
            growthPotential: 0.7,
          },
        },
        team: {
          score: 0.75,
          metrics: {
            founderExperience: 0.8,
            teamCompleteness: 0.7,
            advisors: 0.75,
          },
        },
        product: {
          score: 0.8,
          metrics: {
            productMaturity: 0.85,
            marketFit: 0.8,
            technicalInnovation: 0.75,
          },
        },
      },
      recommendations: [
        "Consider expanding market reach",
        "Strengthen the team by adding key advisors",
        "Focus on improving margins",
      ],
      targetInvestors: [
        {
          type: "Early Stage VC Firms",
          matchScore: 0.8,
          reason: "Good foundation with room for growth",
        },
      ],
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Startup Health Dashboard</h1>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Track your key metrics and fundraising readiness in real-time.
          </AlertDescription>
        </Alert>
      </div>

      {/* Funding Readiness Score */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Funding Readiness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl font-bold">
              {mockData.readinessScore?.overallScore}%
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              mockData.readinessScore?.overallScore >= 70
                ? "bg-green-100 text-green-800"
                : mockData.readinessScore?.overallScore >= 50
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            )}>
              {mockData.readinessScore?.targetInvestors[0].type}
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(mockData.readinessScore?.categories ?? {}).map(([category, data]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(data.score * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      data.score >= 0.7 ? "bg-green-500" :
                      data.score >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${data.score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              mockData.metrics.revenueGrowth > 0 
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}>
              <div className="flex items-center gap-1">
                {mockData.metrics.revenueGrowth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {mockData.metrics.revenueGrowth}%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.metrics.revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. last month
            </p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${Math.min(100, (mockData.metrics.revenue / 600000) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
            <div className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
              Critical Metric
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.metrics.burnRate)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockData.metrics.runway} months runway
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full",
                    mockData.metrics.runway > 12 ? "bg-green-500" : 
                    mockData.metrics.runway > 6 ? "bg-orange-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(100, (mockData.metrics.runway / 24) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium">
                {mockData.metrics.runway}m
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              mockData.metrics.marginGrowth > 0 
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}>
              <div className="flex items-center gap-1">
                {mockData.metrics.marginGrowth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {mockData.metrics.marginGrowth}%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.metrics.cashflow)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monthly net position
            </p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full",
                  mockData.metrics.cashflow > 0 ? "bg-green-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(100, Math.abs((mockData.metrics.cashflow / mockData.metrics.revenue) * 100))}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mockData.revenueTrend}
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
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8"
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="1" 
                  stroke="#82ca9d" 
                  fill="#82ca9d"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Fund Allocation</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockData.fundAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.fundAllocation.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Section */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.readinessScore?.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">{index + 1}</span>
                </div>
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}