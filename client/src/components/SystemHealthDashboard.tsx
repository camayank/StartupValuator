import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface ErrorStats {
  category: string;
  count: number;
  unresolvedCount: number;
  criticalCount: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  validationErrors: number;
  systemErrors: number;
  apiErrors: number;
  performance: {
    responseTime: number;
    errorRate: number;
    uptimePercentage: number;
  };
}

export function SystemHealthDashboard() {
  const [timeframe, setTimeframe] = useState<'hour' | 'day' | 'week'>('day');

  const { data: errorStats, isLoading: statsLoading } = useQuery<ErrorStats[]>({
    queryKey: ['/api/monitoring/errors', timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/monitoring/errors?timeframe=${timeframe}`);
      if (!res.ok) throw new Error('Failed to fetch error statistics');
      return res.json();
    },
  });

  const { data: healthData, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ['/api/monitoring/health'],
    queryFn: async () => {
      const res = await fetch('/api/monitoring/health');
      if (!res.ok) throw new Error('Failed to fetch system health');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (statsLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading system health data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Health Monitor</h2>
        <Select value={timeframe} onValueChange={(value: 'hour' | 'day' | 'week') => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hour">Last Hour</SelectItem>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* System Status Alert */}
      <Alert variant={healthData?.status === 'healthy' ? 'default' : 'destructive'}>
        {healthData?.status === 'healthy' ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>System Status: {healthData?.status.toUpperCase()}</AlertTitle>
        <AlertDescription>
          {healthData?.status === 'healthy'
            ? 'All systems operating normally'
            : 'System requires attention'}
        </AlertDescription>
      </Alert>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Average API response time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData?.performance.responseTime.toFixed(2)}ms
            </div>
            <Progress 
              value={Math.min(100, (healthData?.performance.responseTime || 0) / 10)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>Percentage of failed requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData?.performance.errorRate.toFixed(2)}%
            </div>
            <Progress 
              value={100 - (healthData?.performance.errorRate || 0)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uptime</CardTitle>
            <CardDescription>System availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData?.performance.uptimePercentage.toFixed(2)}%
            </div>
            <Progress 
              value={healthData?.performance.uptimePercentage || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Error Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Error Statistics</CardTitle>
          <CardDescription>Breakdown of system errors by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errorStats?.map((stat) => (
              <div key={stat.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{stat.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {stat.count} total / {stat.unresolvedCount} unresolved
                  </span>
                </div>
                <Progress 
                  value={(stat.unresolvedCount / stat.count) * 100}
                  className="h-2"
                />
                {stat.criticalCount > 0 && (
                  <div className="flex items-center text-sm text-destructive">
                    <XCircle className="h-4 w-4 mr-1" />
                    {stat.criticalCount} critical errors
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
