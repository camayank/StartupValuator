import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, FileSpreadsheet, Code, PenTool } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ValuationReport } from "@/lib/reportGenerator";

interface ReportCustomizationPanelProps {
  report: ValuationReport;
  onFormatChange: (format: 'pdf' | 'xlsx' | 'html') => void;
  onSectionToggle: (section: string, enabled: boolean) => void;
  onTemplateChange: (template: string) => void;
}

export function ReportCustomizationPanel({
  report,
  onFormatChange,
  onSectionToggle,
  onTemplateChange,
}: ReportCustomizationPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'xlsx' | 'html'>('pdf');
  const { toast } = useToast();

  const sections = [
    { id: 'executive-summary', label: 'Executive Summary' },
    { id: 'market-analysis', label: 'Market Analysis' },
    { id: 'financial-metrics', label: 'Financial Metrics' },
    { id: 'risk-assessment', label: 'Risk Assessment' },
    { id: 'valuation-models', label: 'Valuation Models' },
    { id: 'monte-carlo', label: 'Monte Carlo Simulation' },
    { id: 'recommendations', label: 'Recommendations' },
  ];

  const templates = [
    { id: 'professional', label: 'Professional' },
    { id: 'executive', label: 'Executive' },
    { id: 'detailed', label: 'Detailed Analysis' },
    { id: 'investor-pitch', label: 'Investor Pitch' },
  ];

  const handleFormatChange = (format: 'pdf' | 'xlsx' | 'html') => {
    setSelectedFormat(format);
    onFormatChange(format);
    toast({
      title: "Format Updated",
      description: `Report format changed to ${format.toUpperCase()}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Report Customization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-4">
            <Label>Export Format</Label>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={selectedFormat === 'pdf' ? 'default' : 'outline'}
                onClick={() => handleFormatChange('pdf')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button
                variant={selectedFormat === 'xlsx' ? 'default' : 'outline'}
                onClick={() => handleFormatChange('xlsx')}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                variant={selectedFormat === 'html' ? 'default' : 'outline'}
                onClick={() => handleFormatChange('html')}
                className="flex items-center gap-2"
              >
                <Code className="h-4 w-4" />
                HTML
              </Button>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <Label>Report Template</Label>
            <Select onValueChange={onTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Toggles */}
          <div className="space-y-4">
            <Label>Report Sections</Label>
            <div className="space-y-4">
              {sections.map(section => (
                <div key={section.id} className="flex items-center justify-between">
                  <Label htmlFor={section.id} className="flex-1">
                    {section.label}
                  </Label>
                  <Switch
                    id={section.id}
                    defaultChecked
                    onCheckedChange={(checked) => onSectionToggle(section.id, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
