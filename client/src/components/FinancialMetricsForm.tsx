import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp, Users, ArrowLeft, BarChart3 } from 'lucide-react';

interface FinancialData {
  revenue: number;
  growth: number;
  expenses: number;
  teamSize: number;
}

interface FinancialMetricsFormProps {
  data: FinancialData;
  onUpdate: (data: FinancialData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FinancialMetricsForm({ data, onUpdate, onNext, onBack }: FinancialMetricsFormProps) {
  const handleInputChange = (field: keyof FinancialData, value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdate({ ...data, [field]: numValue });
  };

  const isComplete = data.revenue >= 0 && data.growth >= 0 && data.expenses >= 0 && data.teamSize > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Financial Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="revenue">Annual Revenue ($)</Label>
            <Input
              id="revenue"
              type="number"
              placeholder="0"
              value={data.revenue || ''}
              onChange={(e) => handleInputChange('revenue', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="growth">Growth Rate (%)</Label>
            <Input
              id="growth"
              type="number"
              placeholder="0"
              value={data.growth || ''}
              onChange={(e) => handleInputChange('growth', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenses">Annual Expenses ($)</Label>
            <Input
              id="expenses"
              type="number"
              placeholder="0"
              value={data.expenses || ''}
              onChange={(e) => handleInputChange('expenses', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-size">Team Size</Label>
            <Input
              id="team-size"
              type="number"
              placeholder="1"
              value={data.teamSize || ''}
              onChange={(e) => handleInputChange('teamSize', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext} disabled={!isComplete} className="flex-1">
            Continue to Market Analysis
            <BarChart3 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}