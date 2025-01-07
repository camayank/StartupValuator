import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Download, Share2, Loader2, FileText, Table, FileSpreadsheet, motion } from "lucide-react";
import type { ValuationReport } from "@/lib/reportGenerator";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  report: ValuationReport;
  className?: string;
}

export function ExportButton({ report, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<'pdf' | 'xlsx' | 'csv' | null>(null);
  const { toast } = useToast();

  const formatIcons = {
    pdf: FileText,
    xlsx: FileSpreadsheet,
    csv: Table
  };

  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    try {
      setIsExporting(true);
      setCurrentFormat(format);

      // Show initial progress toast
      const progressToast = toast({
        title: `Preparing ${format.toUpperCase()} Export`,
        description: "Starting export process...",
      });

      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `startup-valuation-report-${timestamp}.${format}`;

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Update success toast
      toast({
        title: "Export Successful",
        description: `Report has been exported as ${format.toUpperCase()}`,
        variant: "default",
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
      setCurrentFormat(null);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Report link has been copied to clipboard",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            disabled={isExporting}
            className={cn(
              "relative transition-all duration-300",
              isExporting && "pl-8"
            )}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin absolute left-3" />
                <span>Exporting {currentFormat?.toUpperCase()}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                <span>Export Report</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {Object.entries(formatIcons).map(([format, Icon]) => (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format as 'pdf' | 'xlsx' | 'csv')}
              className="flex items-center gap-2 cursor-pointer transition-colors duration-200"
            >
              <Icon className="h-4 w-4" />
              <span>Export as {format.toUpperCase()}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span>Share Report</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}