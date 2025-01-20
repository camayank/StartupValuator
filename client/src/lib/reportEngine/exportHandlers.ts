import type { ReportData, ReportOptions, ExportConfig } from "./types";
import { defaultReportTemplate } from "./templates";

// PDF Export Handler
export async function exportToPDF(data: ReportData, options: ReportOptions): Promise<Blob> {
  try {
    const response = await fetch('/api/export/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to generate PDF report');
  }
}

// Excel Export Handler
export async function exportToExcel(data: ReportData, options: ReportOptions): Promise<Blob> {
  try {
    const response = await fetch('/api/export/xlsx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Failed to generate Excel report');
  }
}

// HTML Export Handler
export async function exportToHTML(data: ReportData, options: ReportOptions): Promise<string> {
  try {
    const response = await fetch('/api/export/html', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.text();
  } catch (error) {
    console.error('HTML export error:', error);
    throw new Error('Failed to generate HTML report');
  }
}

export async function generateReport(
  data: ReportData,
  config: ExportConfig
): Promise<Blob | string> {
  const options: ReportOptions = {
    title: `Valuation Report - ${data.businessName}`,
    date: new Date(),
    config,
  };

  switch (config.format) {
    case 'pdf':
      return exportToPDF(data, options);
    case 'excel':
      return exportToExcel(data, options);
    case 'html':
      return exportToHTML(data, options);
    default:
      throw new Error(`Unsupported format: ${config.format}`);
  }
}

// Real-time chart update handler
export function updateChartData(
  data: ReportData,
  chartId: string,
  newData: any
): ReportData {
  return {
    ...data,
    charts: {
      ...data.charts,
      [chartId]: {
        ...data.charts?.[chartId],
        data: newData,
      },
    },
  };
}
