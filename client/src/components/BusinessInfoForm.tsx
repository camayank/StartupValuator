import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, MapPin, Target, TrendingUp } from 'lucide-react';

interface BusinessInfoData {
  name: string;
  industry: string;
  stage: string;
  location: string;
}

interface BusinessInfoFormProps {
  data: BusinessInfoData;
  onUpdate: (data: BusinessInfoData) => void;
  onNext: () => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'E-commerce',
  'SaaS',
  'Marketplace',
  'AI/ML',
  'Biotech',
  'CleanTech',
  'Other'
];

const stages = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C+',
  'Growth',
  'Pre-IPO'
];

export function BusinessInfoForm({ data, onUpdate, onNext }: BusinessInfoFormProps) {
  const handleInputChange = (field: keyof BusinessInfoData, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  const isComplete = data.name && data.industry && data.stage && data.location;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Business Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            placeholder="Enter your company name"
            value={data.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Industry</Label>
          <Select value={data.industry} onValueChange={(value) => handleInputChange('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry.toLowerCase()}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Funding Stage</Label>
          <Select value={data.stage} onValueChange={(value) => handleInputChange('stage', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your funding stage" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage} value={stage.toLowerCase()}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="e.g. San Francisco, CA"
            value={data.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        <Button 
          onClick={onNext} 
          disabled={!isComplete}
          className="w-full"
        >
          Continue to Financial Metrics
          <TrendingUp className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}