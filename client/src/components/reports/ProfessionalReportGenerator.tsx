import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Eye, 
  Share2, 
  Star,
  Building2,
  Calendar,
  Users,
  TrendingUp,
  Shield,
  Award
} from 'lucide-react';

interface ProfessionalReportGeneratorProps {
  valuationData?: any;
  companyData?: any;
}

interface ReportSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  enabled: boolean;
  icon: React.ElementType;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  audience: string;
  sections: string[];
  format: 'executive' | 'detailed' | 'comprehensive';
}

export function ProfessionalReportGenerator({ valuationData, companyData }: ProfessionalReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('investor-deck');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'both'>('pdf');
  const [brandingEnabled, setBrandingEnabled] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const reportSections: ReportSection[] = [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      description: 'High-level overview and key findings',
      required: true,
      enabled: true,
      icon: Star
    },
    {
      id: 'company-overview',
      title: 'Company Overview',
      description: 'Business model, team, and market position',
      required: true,
      enabled: true,
      icon: Building2
    },
    {
      id: 'financial-analysis',
      title: 'Financial Analysis',
      description: 'Revenue, expenses, and projections',
      required: true,
      enabled: true,
      icon: TrendingUp
    },
    {
      id: 'valuation-methodology',
      title: 'Valuation Methodology',
      description: 'Methods used and assumptions',
      required: true,
      enabled: true,
      icon: Award
    },
    {
      id: 'market-analysis',
      title: 'Market Analysis',
      description: 'Industry trends and competitive landscape',
      required: false,
      enabled: true,
      icon: Users
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      description: 'Key risks and mitigation strategies',
      required: false,
      enabled: true,
      icon: Shield
    }
  ];

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'investor-deck',
      name: 'Investor Presentation',
      description: 'Concise deck for fundraising presentations',
      audience: 'Investors',
      sections: ['executive-summary', 'company-overview', 'financial-analysis', 'valuation-methodology'],
      format: 'executive'
    },
    {
      id: 'due-diligence',
      name: 'Due Diligence Report',
      description: 'Comprehensive analysis for detailed review',
      audience: 'Institutional Investors',
      sections: ['executive-summary', 'company-overview', 'financial-analysis', 'valuation-methodology', 'market-analysis', 'risk-assessment'],
      format: 'comprehensive'
    },
    {
      id: 'board-presentation',
      name: 'Board Presentation',
      description: 'Strategic overview for board meetings',
      audience: 'Board Members',
      sections: ['executive-summary', 'financial-analysis', 'market-analysis', 'risk-assessment'],
      format: 'detailed'
    }
  ];

  const [enabledSections, setEnabledSections] = useState<string[]>(
    reportSections.filter(section => section.enabled).map(section => section.id)
  );

  const toggleSection = (sectionId: string) => {
    const section = reportSections.find(s => s.id === sectionId);
    if (section?.required) return;

    setEnabledSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    const steps = [
      'Gathering data...',
      'Analyzing financials...',
      'Generating charts...',
      'Applying branding...',
      'Compiling document...',
      'Finalizing report...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(((i + 1) / steps.length) * 100);
    }

    setIsGenerating(false);
  };

  const selectedTemplateData = reportTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Professional Report Generator
          </CardTitle>
          <p className="text-muted-foreground">
            Create investor-ready reports with professional formatting and branding
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="template" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template">Template Selection</TabsTrigger>
          <TabsTrigger value="customize">Customize Sections</TabsTrigger>
          <TabsTrigger value="generate">Generate & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Report Template</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select a pre-configured template based on your audience and use case
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">{template.format}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Target: {template.audience}
                          </span>
                          <span className="text-muted-foreground">
                            {template.sections.length} sections
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customize Report Sections</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select which sections to include in your report
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportSections.map((section) => (
                  <div 
                    key={section.id}
                    className={`flex items-center space-x-3 p-4 border rounded-lg transition-all ${
                      enabledSections.includes(section.id)
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-background border-border'
                    }`}
                  >
                    <Checkbox
                      id={section.id}
                      checked={enabledSections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                      disabled={section.required}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4" />
                        <Label 
                          htmlFor={section.id}
                          className={`font-medium ${section.required ? 'text-muted-foreground' : ''}`}
                        >
                          {section.title}
                          {section.required && (
                            <Badge variant="outline" className="ml-2 text-xs">Required</Badge>
                          )}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Report Format</Label>
                  <Select value={reportFormat} onValueChange={(value: any) => setReportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Workbook</SelectItem>
                      <SelectItem value="both">Both PDF & Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filename">File Name</Label>
                  <Input 
                    id="filename"
                    placeholder="valuation-report-2024"
                    defaultValue={`${companyData?.name || 'company'}-valuation-${new Date().getFullYear()}`}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="branding"
                    checked={brandingEnabled}
                    onCheckedChange={(checked) => setBrandingEnabled(checked === true)}
                  />
                  <Label htmlFor="branding">Include company branding</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generation Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGenerating ? (
                  <div className="space-y-3">
                    <Progress value={generationProgress} className="h-3" />
                    <p className="text-sm text-muted-foreground text-center">
                      Generating report... {Math.round(generationProgress)}%
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Progress value={0} className="h-3" />
                    <p className="text-sm text-muted-foreground text-center">
                      Ready to generate your professional report
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button 
                    onClick={generateReport}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}