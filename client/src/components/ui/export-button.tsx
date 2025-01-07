import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Download, Share2, Loader2 } from "lucide-react";
import type { ValuationReport } from "@/lib/reportGenerator";

interface ExportButtonProps {
  report: ValuationReport;
  className?: string;
}

export function ExportButton({ report, className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'pdf' | 'xlsx' | 'csv') => {
    try {
      setIsExporting(true);
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
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `valuation-report.${format}`;

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

      toast({
        title: "Export Successful",
        description: `Report has been exported as ${format.toUpperCase()}`,
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

  const handleShare = async () => {
    try {
      // For now, we'll just copy a link to clipboard
      // In a real app, this would generate a shareable link
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Report link has been copied to clipboard",
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
          <Button variant="outline" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Report
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('xlsx')}>
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
