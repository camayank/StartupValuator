import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ExecutiveDashboardProps {
  companyData?: {
    name: string;
    stage: string;
    industry: string;
    valuation: number;
    confidence: number;
    lastUpdated: string;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  color?: string;
  format?: 'currency' | 'percentage' | 'number';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color = 'text-primary',
  format = 'number'
}) => {
  const formatValue = (val: string | number) => {
    if (format === 'currency' && typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    if (format === 'percentage' && typeof val === 'number') {
      return `${val}%`;
    }
    return val;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <p className={`text-2xl font-bold ${color}`}>
                {formatValue(value)}
              </p>
              {change !== undefined && (
                <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="text-sm font-medium">
                    {Math.abs(change)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full bg-primary/10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ExecutiveDashboard({ companyData }: ExecutiveDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  
  // Mock data - in production, this would come from API
  const kpiData = {
    valuation: 15000000,
    confidence: 85,
    runway: 18,
    burnRate: 45000,
    arr: 2400000,
    growth: 25,
    customers: 1250,
    team: 28
  };

  const revenueData = [
    { month: 'Jan', revenue: 150000, target: 140000, expenses: 120000 },
    { month: 'Feb', revenue: 165000, target: 155000, expenses: 125000 },
    { month: 'Mar', revenue: 180000, target: 170000, expenses: 130000 },
    { month: 'Apr', revenue: 195000, target: 185000, expenses: 135000 },
    { month: 'May', revenue: 210000, target: 200000, expenses: 140000 },
    { month: 'Jun', revenue: 225000, target: 215000, expenses: 145000 },
  ];

  const industryBenchmarks = [
    { metric: 'Revenue Multiple', value: 8.5, benchmark: 7.2, performance: 'above' },
    { metric: 'Growth Rate', value: 25, benchmark: 18, performance: 'above' },
    { metric: 'Burn Multiple', value: 1.8, benchmark: 2.5, performance: 'above' },
    { metric: 'CAC Payback', value: 8, benchmark: 12, performance: 'above' },
  ];

  const fundingHistory = [
    { round: 'Pre-Seed', amount: 500000, date: '2023-01', valuation: 3000000 },
    { round: 'Seed', amount: 2000000, date: '2023-08', valuation: 8000000 },
    { round: 'Series A', amount: 5000000, date: '2024-03', valuation: 15000000 },
  ];

  const riskFactors = [
    { factor: 'Market Competition', level: 'medium', impact: 'moderate' },
    { factor: 'Regulatory Changes', level: 'low', impact: 'minimal' },
    { factor: 'Team Scaling', level: 'high', impact: 'significant' },
    { factor: 'Customer Concentration', level: 'medium', impact: 'moderate' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Executive Dashboard</h1>
            <p className="text-muted-foreground">
              {companyData?.name || 'Your Startup'} • {companyData?.stage || 'Series A'} • {companyData?.industry || 'Technology'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Data Updated
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {companyData?.lastUpdated || '2 hours ago'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Valuation"
          value={kpiData.valuation}
          change={12}
          trend="up"
          icon={DollarSign}
          color="text-green-600"
          format="currency"
        />
        <MetricCard
          title="Confidence Score"
          value={kpiData.confidence}
          change={5}
          trend="up"
          icon={Target}
          color="text-blue-600"
          format="percentage"
        />
        <MetricCard
          title="Monthly Burn Rate"
          value={kpiData.burnRate}
          change={-8}
          trend="up"
          icon={TrendingDown}
          color="text-orange-600"
          format="currency"
        />
        <MetricCard
          title="Revenue Growth"
          value={kpiData.growth}
          change={3}
          trend="up"
          icon={TrendingUp}
          color="text-purple-600"
          format="percentage"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.1}
                        name="Actual Revenue"
                      />
                      <Area
                        type="monotone"
                        dataKey="target"
                        stackId="2"
                        stroke="#10b981"
                        fill="transparent"
                        strokeDasharray="5 5"
                        name="Target"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Annual Recurring Revenue</span>
                    <span className="text-lg font-bold text-green-600">
                      ${kpiData.arr.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Runway (Months)</span>
                    <span className="text-lg font-bold text-blue-600">{kpiData.runway}</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Active Customers</span>
                    <span className="text-lg font-bold text-purple-600">
                      {kpiData.customers.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Team Size</span>
                    <span className="text-lg font-bold text-orange-600">{kpiData.team}</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Industry Benchmark Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {industryBenchmarks.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.metric}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">
                          Industry: {item.benchmark}
                        </span>
                        <span className="font-bold text-primary">
                          Your Company: {item.value}
                        </span>
                        <Badge 
                          variant={item.performance === 'above' ? 'default' : 'secondary'}
                          className={item.performance === 'above' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {item.performance === 'above' ? 'Above Average' : 'Below Average'}
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(item.value / (item.benchmark * 1.5)) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Funding History & Valuation Progression
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fundingHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="round" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="valuation" fill="#3b82f6" name="Valuation" />
                    <Bar dataKey="amount" fill="#10b981" name="Amount Raised" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {fundingHistory.map((round, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{round.round}</span>
                        <span className="text-sm text-muted-foreground">{round.date}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Amount Raised</span>
                          <span className="font-bold text-green-600">
                            ${(round.amount / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Valuation</span>
                          <span className="font-bold text-blue-600">
                            ${(round.valuation / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Risk Assessment Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{risk.factor}</h4>
                      <p className="text-sm text-muted-foreground">
                        Impact: {risk.impact}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        risk.level === 'high' ? 'destructive' : 
                        risk.level === 'medium' ? 'secondary' : 'outline'
                      }
                    >
                      {risk.level.toUpperCase()} RISK
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}