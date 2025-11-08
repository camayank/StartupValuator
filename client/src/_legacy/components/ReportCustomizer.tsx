import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Image, Table, FileSpreadsheet } from "lucide-react";
import type { ReportData, ExportConfig } from "@/lib/reportEngine/types";
import { defaultReportTemplate, validateReportConfig } from "@/lib/reportEngine/templates";
import { generateReport } from "@/lib/reportEngine/exportHandlers";
import { useToast } from "@/hooks/use-toast";

interface ReportCustomizerProps {
  data: ReportData;
  onExport: (format: ExportConfig['format']) => void;
}

export function ReportCustomizer({ data, onExport }: ReportCustomizerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sections");
  const [selectedFormat, setSelectedFormat] = useState<ExportConfig['format']>("pdf");
  const [enabledSections, setEnabledSections] = useState(() => {
    const sections: Record<string, boolean> = {};
    Object.keys(defaultReportTemplate).forEach(section => {
      sections[section] = true;
    });
    return sections;
  });
  const [branding, setBranding] = useState<ReportData['branding']>({});
  const [isExporting, setIsExporting] = useState(false);

  const handleSectionToggle = (section: string) => {
    setEnabledSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const config: ExportConfig = {
        format: selectedFormat,
        sections: Object.entries(enabledSections)
          .filter(([_, enabled]) => enabled)
          .map(([section]) => section),
        branding,
      };

      const { valid, errors } = validateReportConfig({
        enabledSections,
        format: selectedFormat,
        branding,
      });

      if (!valid) {
        toast({
          title: "Invalid Configuration",
          description: errors.join("\n"),
          variant: "destructive",
        });
        return;
      }

      await generateReport(data, config);
      onExport(selectedFormat);

      toast({
        title: "Success",
        description: `Report exported as ${selectedFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
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
    <Card>
      <CardHeader>
        <CardTitle>Customize Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-4">
            {Object.entries(defaultReportTemplate).map(([section, config]) => (
              <div key={section} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <h4 className="font-medium">{config.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {config.sections.length} subsections
                  </p>
                </div>
                <Switch
                  checked={enabledSections[section]}
                  onCheckedChange={() => handleSectionToggle(section)}
                  disabled={config.sections.some(s => s.required)}
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setBranding(prev => ({
                          ...prev,
                          logo: reader.result as string
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={branding.primaryColor || "#000000"}
                  onChange={(e) => {
                    setBranding(prev => ({
                      ...prev,
                      primaryColor: e.target.value
                    }));
                  }}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-4">
            <Label htmlFor="format">Export Format</Label>
            <Select value={selectedFormat} onValueChange={(value: ExportConfig['format']) => setSelectedFormat(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel Spreadsheet
                  </div>
                </SelectItem>
                <SelectItem value="html">
                  <div className="flex items-center">
                    <Table className="w-4 h-4 mr-2" />
                    HTML Document
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleExport}
            className="w-full"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <FileText className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
