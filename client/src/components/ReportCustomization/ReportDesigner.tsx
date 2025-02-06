import { useState } from "react";
import { ReportCustomizationPanel } from "./ReportCustomizationPanel";
import { ChartEditor } from "./ChartEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import type { ValuationReport } from "@/lib/reportGenerator";

interface ReportDesignerProps {
  report: ValuationReport;
  onExport: (format: string) => Promise<void>;
}

export function ReportDesigner({ report, onExport }: ReportDesignerProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'xlsx' | 'html'>('pdf');
  const [enabledSections, setEnabledSections] = useState<Set<string>>(new Set([
    'executive-summary',
    'market-analysis',
    'financial-metrics',
    'risk-assessment',
    'valuation-models',
    'monte-carlo',
    'recommendations'
  ]));
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleSectionToggle = (sectionId: string, enabled: boolean) => {
    const newSections = new Set(enabledSections);
    if (enabled) {
      newSections.add(sectionId);
    } else {
      newSections.delete(sectionId);
    }
    setEnabledSections(newSections);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await onExport(selectedFormat);
      toast({
        title: "Export Successful",
        description: `Report has been exported in ${selectedFormat.toUpperCase()} format`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <ReportCustomizationPanel
          report={report}
          onFormatChange={setSelectedFormat}
          onSectionToggle={handleSectionToggle}
          onTemplateChange={setSelectedTemplate}
        />
        
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : `Export as ${selectedFormat.toUpperCase()}`}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <ChartEditor
          chartId="market-analysis-chart"
          chartType="bar"
          onChartUpdate={(config) => {
            console.log("Chart config updated:", config);
            // Handle chart updates
          }}
        />
      </div>
    </div>
  );
}
