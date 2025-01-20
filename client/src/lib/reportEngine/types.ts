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
}

export interface ExportConfig {
  format: 'pdf' | 'excel' | 'html';
  sections: string[];
  branding?: ReportData['branding'];
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
