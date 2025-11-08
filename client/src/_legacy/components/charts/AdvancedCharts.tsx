import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Download } from 'lucide-react';

interface AdvancedChartsProps {
  data?: any;
  className?: string;
}

const WaterfallChart: React.FC<{ data: any[] }> = ({ data }) => {
  const processedData = data.map((item, index) => ({
    ...item,
    cumulative: data.slice(0, index + 1).reduce((sum, d) => sum + d.value, 0)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
        <Bar dataKey="value" fill="#3b82f6" />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const SensitivityHeatmap: React.FC<{ data: any[] }> = ({ data }) => {
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="growthRate" name="Growth Rate" unit="%" />
        <YAxis dataKey="discountRate" name="Discount Rate" unit="%" />
        <Tooltip 
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value, name) => [
            name === 'valuation' ? `$${value.toLocaleString()}` : value,
            name === 'valuation' ? 'Valuation' : name
          ]}
        />
        <Scatter dataKey="valuation" fill="#3b82f6">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export function AdvancedCharts({ data, className }: AdvancedChartsProps) {
  const [selectedChart, setSelectedChart] = useState('waterfall');
  const [timeRange, setTimeRange] = useState('12m');

  const waterfallData = [
    { category: 'Base Valuation', value: 10000000 },
    { category: 'Revenue Growth', value: 3000000 },
    { category: 'Market Expansion', value: 2000000 },
    { category: 'Team Scaling', value: -500000 },
    { category: 'Competition Risk', value: -1000000 },
    { category: 'Final Valuation', value: 13500000 }
  ];

  const sensitivityData = [
    { growthRate: 10, discountRate: 8, valuation: 8000000 },
    { growthRate: 15, discountRate: 8, valuation: 12000000 },
    { growthRate: 20, discountRate: 8, valuation: 16000000 },
    { growthRate: 10, discountRate: 12, valuation: 6000000 },
    { growthRate: 15, discountRate: 12, valuation: 9000000 },
    { growthRate: 20, discountRate: 12, valuation: 12000000 }
  ];

  const chartConfigs = [
    {
      id: 'waterfall',
      title: 'Valuation Waterfall',
      description: 'Breakdown of valuation components and adjustments',
      icon: BarChart3,
      component: <WaterfallChart data={waterfallData} />
    },
    {
      id: 'sensitivity',
      title: 'Sensitivity Analysis',
      description: 'Impact of key assumptions on valuation',
      icon: Activity,
      component: <SensitivityHeatmap data={sensitivityData} />
    }
  ];

  const currentChart = chartConfigs.find(chart => chart.id === selectedChart) || chartConfigs[0];

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <currentChart.icon className="h-5 w-5" />
                {currentChart.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentChart.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="12m">12 Months</SelectItem>
                  <SelectItem value="24m">24 Months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedChart} onValueChange={setSelectedChart}>
        <TabsList className="grid w-full grid-cols-2">
          {chartConfigs.map((chart) => (
            <TabsTrigger key={chart.id} value={chart.id} className="text-xs">
              <chart.icon className="h-4 w-4 mr-1" />
              {chart.title.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {chartConfigs.map((chart) => (
          <TabsContent key={chart.id} value={chart.id}>
            <Card>
              <CardContent className="pt-6">
                {chart.component}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Positive Driver
              </Badge>
              <p className="text-sm">
                Revenue growth rate shows 25% YoY increase, significantly above industry average of 18%
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Watch Area
              </Badge>
              <p className="text-sm">
                Market saturation risk in primary segment requires diversification strategy
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Opportunity
              </Badge>
              <p className="text-sm">
                International expansion could increase valuation by 15-20% based on comparable analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}