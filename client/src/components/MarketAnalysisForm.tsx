import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, ArrowLeft, Calculator } from 'lucide-react';

interface MarketData {
  marketSize: number;
  competitors: number;
  marketShare: number;
}

interface MarketAnalysisFormProps {
  data: MarketData;
  onUpdate: (data: MarketData) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function MarketAnalysisForm({ data, onUpdate, onSubmit, onBack, isLoading }: MarketAnalysisFormProps) {
  const handleInputChange = (field: keyof MarketData, value: string) => {
    const numValue = parseFloat(value) || 0;
    onUpdate({ ...data, [field]: numValue });
  };

  const isComplete = data.marketSize > 0 && data.competitors >= 0 && data.marketShare >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Market Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="market-size">Total Addressable Market ($M)</Label>
            <Input
              id="market-size"
              type="number"
              placeholder="e.g. 100"
              value={data.marketSize || ''}
              onChange={(e) => handleInputChange('marketSize', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="competitors">Number of Direct Competitors</Label>
            <Input
              id="competitors"
              type="number"
              placeholder="e.g. 5"
              value={data.competitors || ''}
              onChange={(e) => handleInputChange('competitors', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="market-share">Expected Market Share (%)</Label>
            <Input
              id="market-share"
              type="number"
              placeholder="e.g. 2.5"
              step="0.1"
              value={data.marketShare || ''}
              onChange={(e) => handleInputChange('marketShare', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={onBack} className="flex-1" disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={onSubmit} 
            disabled={!isComplete || isLoading} 
            className="flex-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                Calculating...
              </>
            ) : (
              <>
                Calculate Valuation
                <Calculator className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}