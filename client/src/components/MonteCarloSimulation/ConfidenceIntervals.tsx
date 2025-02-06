import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ConfidenceIntervalsProps {
  data: Array<{
    value: number;
    frequency: number;
  }>;
  confidenceLevel: number;
}

export function ConfidenceIntervals({ data, confidenceLevel }: ConfidenceIntervalsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Valuation Distribution ({confidenceLevel}% Confidence Interval)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="value" 
              tickFormatter={formatCurrency}
              label={{ value: 'Valuation', position: 'bottom' }}
            />
            <YAxis 
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'frequency' ? value : formatCurrency(value),
                name === 'frequency' ? 'Frequency' : 'Valuation'
              ]}
            />
            <Area
              type="monotone"
              dataKey="frequency"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
