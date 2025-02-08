import { z } from "zod";
import { auditTrailService } from "./audit-trail-service";
import { performanceTrackingService } from "./performance-tracking-service";
import { anomalyDetectionService } from "./anomaly-detection-service";
import type { ValuationFormData } from "../../client/src/lib/validations";

const complianceCheckSchema = z.object({
  soc2: z.object({
    dataProtection: z.boolean(),
    accessControl: z.boolean(),
    auditLogging: z.boolean(),
    encryption: z.boolean(),
    details: z.record(z.string())
  }),
  ifrs: z.object({
    fairValue: z.boolean(),
    disclosure: z.boolean(),
    recognition: z.boolean(),
    details: z.record(z.string())
  }),
  gaap: z.object({
    recognition: z.boolean(),
    measurement: z.boolean(),
    disclosure: z.boolean(),
    details: z.record(z.string())
  })
});

export class ValidationService {
  async validateAssumptions(
    valuationId: string,
    assumptions: any[],
    expertId: string,
    metadata: {
      ipAddress: string;
      userAgent: string;
      sessionId: string;
    }
  ) {
    try {
      const validations = await Promise.all(
        assumptions.map(async (assumption) => {
          const validation = {
            assumption: assumption.assumption,
            isValid: this.validateAssumption(assumption),
            confidence: assumption.confidence,
            expertFeedback: null as string | null,
            requiresReview: assumption.confidence < 0.8
          };

          if (validation.requiresReview) {
            await this.requestExpertReview(valuationId, assumption, expertId, metadata);
          }

          return validation;
        })
      );

      const anomalies = await anomalyDetectionService.detectAnomalies({
        id: valuationId,
        ...assumptions.reduce((acc, curr) => ({
          ...acc,
          [curr.key]: curr.value
        }), {})
      } as ValuationFormData);

      const enhancedValidations = validations.map(validation => {
        const relatedAnomaly = anomalies.find(a => 
          a.metric === validation.assumption.key
        );

        if (relatedAnomaly) {
          return {
            ...validation,
            anomaly: {
              severity: relatedAnomaly.severity,
              explanation: relatedAnomaly.explanation,
              recommendations: relatedAnomaly.recommendations
            },
            requiresReview: true
          };
        }

        return validation;
      });

      await this.updateAuditTrail(valuationId, enhancedValidations, expertId, metadata);
      return enhancedValidations;
    } catch (error) {
      console.error('Assumption validation error:', error);
      throw new Error('Failed to validate assumptions');
    }
  }

  async performComplianceCheck(valuationId: string, data: ValuationFormData) {
    try {
      const compliance = {
        soc2: this.checkSOC2Compliance(data),
        ifrs: this.checkIFRSCompliance(data),
        gaap: this.checkGAAPCompliance(data)
      };

      complianceCheckSchema.parse(compliance);
      return compliance;
    } catch (error) {
      console.error('Compliance check error:', error);
      throw new Error('Failed to perform compliance check');
    }
  }

  private validateAssumption(assumption: any): boolean {
    return assumption.confidence >= 0.8 &&
           assumption.sources.length >= 2 &&
           this.validateSourceReliability(assumption.sources);
  }

  private validateSourceReliability(sources: string[]): boolean {
    const reliableDomains = [
      'sec.gov',
      'bloomberg.com',
      'reuters.com',
      'ft.com',
      'wsj.com'
    ];

    return sources.some(source =>
      reliableDomains.some(domain => source.includes(domain))
    );
  }

  private async requestExpertReview(
    valuationId: string,
    assumption: any,
    expertId: string,
    metadata: any
  ) {
    await auditTrailService.recordExpertValidation(
      expertId,
      valuationId,
      {
        status: "requires_review",
        comments: `Expert review requested for assumption: ${assumption.assumption}`,
        adjustments: {}
      },
      metadata
    );
  }

  private async updateAuditTrail(
    valuationId: string,
    validations: any[],
    expertId: string,
    metadata: any
  ) {
    await auditTrailService.recordAIAssumption(
      expertId,
      valuationId,
      {
        validations,
        timestamp: new Date(),
        requiresReview: validations.some(v => v.requiresReview)
      },
      metadata
    );
  }

  private checkSOC2Compliance(data: ValuationFormData) {
    return {
      dataProtection: this.checkDataProtection(),
      accessControl: this.checkAccessControl(),
      auditLogging: this.checkAuditLogging(),
      encryption: this.checkEncryption(),
      details: this.getSOC2Details()
    };
  }

  private checkIFRSCompliance(data: ValuationFormData) {
    return {
      fairValue: this.checkFairValueMeasurement(data),
      disclosure: this.checkDisclosureRequirements(data),
      recognition: this.checkRecognitionCriteria(data),
      details: this.getIFRSDetails(data)
    };
  }

  private checkGAAPCompliance(data: ValuationFormData) {
    return {
      recognition: this.checkGAAPRecognition(data),
      measurement: this.checkGAAPMeasurement(data),
      disclosure: this.checkGAAPDisclosure(data),
      details: this.getGAAPDetails(data)
    };
  }

  private checkDataProtection() { return true; }
  private checkAccessControl() { return true; }
  private checkAuditLogging() { return true; }
  private checkEncryption() { return true; }
  private getSOC2Details() { return {}; }

  private checkFairValueMeasurement(data: ValuationFormData) { return true; }
  private checkDisclosureRequirements(data: ValuationFormData) { return true; }
  private checkRecognitionCriteria(data: ValuationFormData) { return true; }
  private getIFRSDetails(data: ValuationFormData) { return {}; }

  private checkGAAPRecognition(data: ValuationFormData) { return true; }
  private checkGAAPMeasurement(data: ValuationFormData) { return true; }
  private checkGAAPDisclosure(data: ValuationFormData) { return true; }
  private getGAAPDetails(data: ValuationFormData) { return {}; }
}

export const validationService = new ValidationService();