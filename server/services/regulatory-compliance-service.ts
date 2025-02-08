import { z } from 'zod';
import type { ValuationFormData } from "../../client/src/lib/validations";
import { cache } from '../lib/cache';

// Validation schemas for compliance data
const regulationSchema = z.object({
  jurisdiction: z.string(),
  requirements: z.array(z.string()),
  thresholds: z.record(z.number()),
  filingRequirements: z.array(z.string()),
  updateFrequency: z.string()
});

const complianceReportSchema = z.object({
  status: z.enum(['compliant', 'non_compliant', 'needs_review']),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
  requiredActions: z.array(z.string())
});

interface ComplianceReport {
  status: 'compliant' | 'non_compliant' | 'needs_review';
  issues: string[];
  recommendations: string[];
  requiredActions: string[];
  timestamp: number;
}

interface RegulationRequirements {
  jurisdiction: string;
  requirements: string[];
  thresholds: Record<string, number>;
  filingRequirements: string[];
  updateFrequency: string;
}

export class RegulatoryComplianceService {
  private readonly CACHE_TTL = 3600; // 1 hour cache

  async checkCompliance(
    data: ValuationFormData,
    valuationAmount: number
  ): Promise<ComplianceReport> {
    try {
      const jurisdiction = this.determineJurisdiction(data.businessInfo.location);
      const regulations = await this.getRegulations(jurisdiction);
      
      // Validate against regulatory requirements
      const issues: string[] = [];
      const recommendations: string[] = [];
      const requiredActions: string[] = [];

      // Check valuation thresholds
      if (valuationAmount > regulations.thresholds.reportingThreshold) {
        requiredActions.push('File detailed valuation report with regulatory authority');
      }

      // Check business model compliance
      if (this.needsSpecialLicensing(data.businessInfo.industry)) {
        const licenseStatus = await this.checkLicensingRequirements(data);
        if (!licenseStatus.valid) {
          issues.push(licenseStatus.reason);
          recommendations.push(licenseStatus.recommendation);
        }
      }

      // Check financial reporting requirements
      const financialCompliance = await this.checkFinancialCompliance(data, regulations);
      issues.push(...financialCompliance.issues);
      recommendations.push(...financialCompliance.recommendations);

      // Check industry-specific regulations
      const industryCompliance = await this.checkIndustryRegulations(data);
      issues.push(...industryCompliance.issues);
      recommendations.push(...industryCompliance.recommendations);

      // Determine overall compliance status
      const status = this.determineComplianceStatus(issues);

      const report: ComplianceReport = {
        status,
        issues,
        recommendations,
        requiredActions,
        timestamp: Date.now()
      };

      // Validate report schema
      complianceReportSchema.parse(report);

      return report;
    } catch (error) {
      console.error('Compliance check error:', error);
      throw new Error('Failed to check regulatory compliance');
    }
  }

  private async getRegulations(jurisdiction: string): Promise<RegulationRequirements> {
    const cacheKey = `regulations_${jurisdiction}`;
    const cachedData = cache.get<RegulationRequirements>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      // In production, this would call a regulatory database API
      const regulations: RegulationRequirements = {
        jurisdiction,
        requirements: [
          'Annual financial reporting',
          'Independent valuation verification',
          'Disclosure of material information'
        ],
        thresholds: {
          reportingThreshold: 1000000,
          auditThreshold: 5000000,
          disclosureThreshold: 500000
        },
        filingRequirements: [
          'Annual report',
          'Quarterly updates',
          'Material change notifications'
        ],
        updateFrequency: 'quarterly'
      };

      // Validate regulations schema
      regulationSchema.parse(regulations);

      // Cache the validated data
      cache.set(cacheKey, regulations, this.CACHE_TTL);

      return regulations;
    } catch (error) {
      console.error('Error fetching regulations:', error);
      throw new Error('Failed to fetch regulatory requirements');
    }
  }

  private determineJurisdiction(location: string): string {
    // Implementation to determine applicable jurisdiction based on location
    return location.split(',')[1]?.trim() || 'US';
  }

  private needsSpecialLicensing(industry: string): boolean {
    const regulatedIndustries = [
      'financial_services',
      'healthcare',
      'biotechnology',
      'cryptocurrency',
      'gambling',
      'defense'
    ];
    return regulatedIndustries.includes(industry.toLowerCase());
  }

  private async checkLicensingRequirements(data: ValuationFormData): Promise<{
    valid: boolean;
    reason?: string;
    recommendation?: string;
  }> {
    // Implementation of licensing requirement checks
    return {
      valid: true
    };
  }

  private async checkFinancialCompliance(
    data: ValuationFormData,
    regulations: RegulationRequirements
  ): Promise<{
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check financial reporting compliance
    if (!data.businessInfo.financials) {
      issues.push('Missing required financial information');
      recommendations.push('Provide detailed financial statements');
    }

    // Check reporting frequency requirements
    if (regulations.updateFrequency === 'quarterly') {
      recommendations.push('Implement quarterly financial reporting system');
    }

    return { issues, recommendations };
  }

  private async checkIndustryRegulations(data: ValuationFormData): Promise<{
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Industry-specific compliance checks
    switch (data.businessInfo.industry.toLowerCase()) {
      case 'financial_services':
        recommendations.push('Ensure compliance with financial services regulations');
        break;
      case 'healthcare':
        recommendations.push('Verify HIPAA compliance');
        break;
      case 'biotechnology':
        recommendations.push('Check FDA/EMA regulatory requirements');
        break;
      case 'cryptocurrency':
        recommendations.push('Ensure compliance with crypto regulations');
        break;
    }

    return { issues, recommendations };
  }

  private determineComplianceStatus(issues: string[]): ComplianceReport['status'] {
    if (issues.length === 0) {
      return 'compliant';
    } else if (issues.some(issue => issue.includes('critical'))) {
      return 'non_compliant';
    } else {
      return 'needs_review';
    }
  }
}

export const regulatoryComplianceService = new RegulatoryComplianceService();
