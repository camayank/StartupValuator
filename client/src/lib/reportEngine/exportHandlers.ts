import type { ReportData, ReportOptions, ExportConfig, ChartConfig } from "./types";
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

    const blob = await response.blob();
    return blob;
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

    const blob = await response.blob();
    return blob;
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

    const html = await response.text();
    return html;
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
    title: `Valuation Report - ${data.businessInfo?.name || 'Untitled'}`,
    date: new Date(),
    version: "1.0",
    template: config.customization?.detailedAnalysis ? 'detailed' : 'default',
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

// Chart data update handler
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

// Helper function to generate financial projections chart
export function generateFinancialProjectionsChart(data: ReportData): ChartConfig | null {
  const projections = data.dynamicContent?.financialProjections;
  if (!projections) return null;

  return {
    type: 'line',
    data: {
      labels: projections.periods,
      datasets: [
        {
          label: 'Revenue',
          data: projections.revenue,
          borderColor: '#4CAF50',
        },
        {
          label: 'Expenses',
          data: projections.expenses,
          borderColor: '#F44336',
        },
        {
          label: 'Margins',
          data: projections.margins,
          borderColor: '#2196F3',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  };
}

// Helper function to generate risk heatmap
export function generateRiskHeatmap(data: ReportData): ChartConfig | null {
  const riskAnalysis = data.dynamicContent?.riskAnalysis;
  if (!riskAnalysis) return null;

  const riskCategories = Object.keys(riskAnalysis.heatmap);
  const riskScores = Object.values(riskAnalysis.heatmap);

  return {
    type: 'radar',
    data: {
      labels: riskCategories,
      datasets: [{
        label: 'Risk Score',
        data: riskScores,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
      }],
    },
    options: {
      elements: {
        line: {
          borderWidth: 3,
        },
      },
      scales: {
        r: {
          angleLines: {
            display: true,
          },
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    },
  };
}