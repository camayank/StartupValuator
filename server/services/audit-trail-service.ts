import { z } from "zod";
import { db } from "@db";
import type { ValuationFormData } from "../../client/src/lib/validations";

// Define audit event types
export const AuditEventType = {
  AI_ASSUMPTION_GENERATED: "ai_assumption_generated",
  EXPERT_VALIDATION: "expert_validation",
  MODEL_VERSION_UPDATE: "model_version_update",
  VALUATION_ADJUSTMENT: "valuation_adjustment",
  COMPLIANCE_CHECK: "compliance_check",
  ACCESS_CONTROL: "access_control",
} as const;

// Audit event schema
const auditEventSchema = z.object({
  type: z.enum([
    AuditEventType.AI_ASSUMPTION_GENERATED,
    AuditEventType.EXPERT_VALIDATION,
    AuditEventType.MODEL_VERSION_UPDATE,
    AuditEventType.VALUATION_ADJUSTMENT,
    AuditEventType.COMPLIANCE_CHECK,
    AuditEventType.ACCESS_CONTROL,
  ]),
  timestamp: z.date(),
  userId: z.string(),
  valuationId: z.string(),
  modelVersion: z.string(),
  data: z.record(z.unknown()),
  metadata: z.object({
    ipAddress: z.string(),
    userAgent: z.string(),
    sessionId: z.string(),
  }),
  validationStatus: z.enum(["pending", "approved", "rejected", "requires_review"]).optional(),
  expertId: z.string().optional(),
  expertComments: z.string().optional(),
});

export type AuditEvent = z.infer<typeof auditEventSchema>;

class AuditTrailService {
  private readonly VERSION = "1.0.0";

  async recordAIAssumption(
    userId: string,
    valuationId: string,
    assumptions: Record<string, unknown>,
    metadata: { ipAddress: string; userAgent: string; sessionId: string }
  ) {
    const event: AuditEvent = {
      type: AuditEventType.AI_ASSUMPTION_GENERATED,
      timestamp: new Date(),
      userId,
      valuationId,
      modelVersion: this.VERSION,
      data: assumptions,
      metadata,
      validationStatus: "pending"
    };

    await this.saveAuditEvent(event);
    return event;
  }

  async recordExpertValidation(
    expertId: string,
    valuationId: string,
    validation: {
      status: "approved" | "rejected" | "requires_review";
      comments: string;
      adjustments?: Record<string, unknown>;
    },
    metadata: { ipAddress: string; userAgent: string; sessionId: string }
  ) {
    const event: AuditEvent = {
      type: AuditEventType.EXPERT_VALIDATION,
      timestamp: new Date(),
      userId: expertId,
      valuationId,
      modelVersion: this.VERSION,
      data: validation.adjustments || {},
      metadata,
      validationStatus: validation.status,
      expertId,
      expertComments: validation.comments
    };

    await this.saveAuditEvent(event);
    return event;
  }

  async recordModelUpdate(
    userId: string,
    valuationId: string,
    updateDetails: {
      previousVersion: string;
      newVersion: string;
      changes: Record<string, unknown>;
    },
    metadata: { ipAddress: string; userAgent: string; sessionId: string }
  ) {
    const event: AuditEvent = {
      type: AuditEventType.MODEL_VERSION_UPDATE,
      timestamp: new Date(),
      userId,
      valuationId,
      modelVersion: updateDetails.newVersion,
      data: {
        previousVersion: updateDetails.previousVersion,
        changes: updateDetails.changes
      },
      metadata
    };

    await this.saveAuditEvent(event);
    return event;
  }

  async getAuditTrail(valuationId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: Array<keyof typeof AuditEventType>;
    validationStatus?: "pending" | "approved" | "rejected" | "requires_review";
  }) {
    // In production, this would query the database
    // For now, we'll implement a basic in-memory store
    return this.auditEvents.filter(event => 
      event.valuationId === valuationId &&
      (!filters?.startDate || event.timestamp >= filters.startDate) &&
      (!filters?.endDate || event.timestamp <= filters.endDate) &&
      (!filters?.eventTypes || filters.eventTypes.includes(event.type)) &&
      (!filters?.validationStatus || event.validationStatus === filters.validationStatus)
    );
  }

  async getValuationHistory(valuationId: string) {
    return this.getAuditTrail(valuationId, {
      eventTypes: [
        AuditEventType.VALUATION_ADJUSTMENT,
        AuditEventType.EXPERT_VALIDATION
      ]
    });
  }

  private async saveAuditEvent(event: AuditEvent) {
    // Validate event
    auditEventSchema.parse(event);

    // In production, this would save to a database
    // For now, we'll use an in-memory store
    this.auditEvents.push(event);

    // Emit event for real-time monitoring
    this.emitAuditEvent(event);
  }

  private emitAuditEvent(event: AuditEvent) {
    // In production, this would emit to a message queue or websocket
    console.log('Audit event emitted:', event);
  }

  private auditEvents: AuditEvent[] = [];
}

export const auditTrailService = new AuditTrailService();
