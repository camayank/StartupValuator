import type { ValuationFormData } from "@/lib/validations";

export interface SectionConfig {
  id: string;
  title: string;
  enabled: boolean;
  required: boolean;
  order?: number;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'radar';
  data: any;
  options?: any;
}

export interface ReportSection {
  title: string;
  content: string | ChartConfig;
  type: 'text' | 'chart' | 'table';
  enabled: boolean;
  required: boolean;
  sourceData?: {
    type: 'valuation' | 'metrics' | 'market' | 'custom';
    key?: string;
  };
  visualizations?: {
    charts?: ChartConfig[];
    tables?: Array<{
      headers: string[];
      rows: any[][];
    }>;
  };
}

export interface ReportData extends ValuationFormData {
  charts?: Record<string, ChartConfig>;
  customSections?: ReportSection[];
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
  };
  dynamicContent?: {
    marketMetrics?: Record<string, number>;
    industryBenchmarks?: Record<string, any>;
    competitorAnalysis?: Array<{
      name: string;
      metrics: Record<string, number>;
    }>;
    financialProjections?: {
      revenue: number[];
      expenses: number[];
      margins: number[];
      periods: string[];
    };
    riskAnalysis?: {
      heatmap: Record<string, number>;
      mitigationStrategies: Record<string, string>;
    };
  };
}

export interface ExportConfig {
  format: 'pdf' | 'excel' | 'html';
  sections: string[];
  branding?: ReportData['branding'];
  includeDynamicData?: boolean;
  chartOptions?: {
    interactiveCharts?: boolean;
    theme?: 'light' | 'dark';
  };
  customization?: {
    includeAppendices?: boolean;
    detailedAnalysis?: boolean;
    executiveSummary?: boolean;
  };
}

export interface ReportOptions {
  title: string;
  author?: string;
  date: Date;
  version?: string;
  watermark?: string;
  template?: 'default' | 'minimal' | 'detailed';
  config: ExportConfig;
}