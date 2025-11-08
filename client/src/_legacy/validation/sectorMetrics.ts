import { z } from "zod";

// Base metrics shared across sectors
const baseMetricsSchema = z.object({
  revenue: z.number().min(0, "Revenue must be positive"),
  operatingMargin: z.number().min(-100).max(100, "Operating margin must be between -100 and 100"),
  growthRate: z.number().min(-100).max(1000, "Growth rate must be between -100 and 1000"),
});

// Risk assessment schema for all industries
const riskAssessmentSchema = z.object({
  marketRisk: z.number().min(1).max(10),
  operationalRisk: z.number().min(1).max(10),
  regulatoryRisk: z.number().min(1).max(10),
});

// Business Sectors
export const businessSectors = {
  technology: {
    name: "Technology",
    industries: {
      saas: {
        name: "Software as a Service",
        metrics: baseMetricsSchema.extend({
          mrr: z.number().min(0, "MRR must be positive"),
          arr: z.number().min(0, "ARR must be positive"),
          churnRate: z.number().min(0).max(100, "Churn rate must be between 0 and 100"),
          cac: z.number().min(0, "CAC must be positive"),
          ltv: z.number().min(0, "LTV must be positive"),
          retentionRate: z.number().min(0).max(100, "Retention rate must be between 0 and 100"),
          riskAssessment: riskAssessmentSchema,
        }),
      },
      enterprise_software: {
        name: "Enterprise Software",
        metrics: baseMetricsSchema.extend({
          contractValue: z.number().min(0, "Contract value must be positive"),
          implementationTime: z.number().min(0, "Implementation time must be positive"),
          customerCount: z.number().min(0, "Customer count must be positive"),
          riskAssessment: riskAssessmentSchema,
        }),
      },
      cloud_services: {
        name: "Cloud Services",
        metrics: baseMetricsSchema.extend({
          computeUtilization: z.number().min(0).max(100, "Compute utilization must be between 0 and 100"),
          storageRevenue: z.number().min(0, "Storage revenue must be positive"),
          apiCalls: z.number().min(0, "API calls must be positive"),
          riskAssessment: riskAssessmentSchema,
        }),
      },
    },
  },
  ecommerce: {
    name: "E-commerce",
    industries: {
      d2c: {
        name: "Direct to Consumer",
        metrics: baseMetricsSchema.extend({
          aov: z.number().min(0, "Average order value must be positive"),
          conversionRate: z.number().min(0).max(100, "Conversion rate must be between 0 and 100"),
          repeatPurchaseRate: z.number().min(0).max(100, "Repeat purchase rate must be between 0 and 100"),
          cartAbandonmentRate: z.number().min(0).max(100, "Cart abandonment rate must be between 0 and 100"),
          riskAssessment: riskAssessmentSchema,
        }),
      },
      marketplace: {
        name: "Marketplace",
        metrics: baseMetricsSchema.extend({
          gmv: z.number().min(0, "GMV must be positive"),
          takeRate: z.number().min(0).max(100, "Take rate must be between 0 and 100"),
          sellerCount: z.number().min(0, "Seller count must be positive"),
          buyerCount: z.number().min(0, "Buyer count must be positive"),
          riskAssessment: riskAssessmentSchema,
        }),
      },
    },
  },
  edtech: {
    name: "Education Technology",
    industries: {
      k12: {
        name: "K-12 Education",
        metrics: baseMetricsSchema.extend({
          studentCount: z.number().min(0, "Student count must be positive"),
          courseCompletionRate: z.number().min(0).max(100, "Course completion rate must be between 0 and 100"),
          teacherCount: z.number().min(0, "Teacher count must be positive"),
          contentEngagementRate: z.number().min(0).max(100, "Content engagement rate must be between 0 and 100"),
          riskAssessment: riskAssessmentSchema,
        }),
      },
      higher_education: {
        name: "Higher Education",
        metrics: baseMetricsSchema.extend({
          enrollmentRate: z.number().min(0).max(100, "Enrollment rate must be between 0 and 100"),
          graduationRate: z.number().min(0).max(100, "Graduation rate must be between 0 and 100"),
          placementRate: z.number().min(0).max(100, "Placement rate must be between 0 and 100"),
          riskAssessment: riskAssessmentSchema,
        }),
      },
    },
  },
  fintech: {
    name: "Financial Technology",
    industries: {
      payments: {
        name: "Payment Solutions",
        metrics: baseMetricsSchema.extend({
          processingVolume: z.number().min(0, "Processing volume must be positive"),
          transactionCount: z.number().min(0, "Transaction count must be positive"),
          avgTransactionValue: z.number().min(0, "Average transaction value must be positive"),
          fraudRate: z.number().min(0).max(100, "Fraud rate must be between 0 and 100"),
          riskAssessment: riskAssessmentSchema,
        }),
      },
      lending: {
        name: "Digital Lending",
        metrics: baseMetricsSchema.extend({
          loanVolume: z.number().min(0, "Loan volume must be positive"),
          defaultRate: z.number().min(0).max(100, "Default rate must be between 0 and 100"),
          avgLoanSize: z.number().min(0, "Average loan size must be positive"),
          approvalRate: z.number().min(0).max(100, "Approval rate must be between 0 and 100"),
          riskAssessment: riskAssessmentSchema,
        }),
      },
      wealthtech: {
        name: "Wealth Management",
        metrics: baseMetricsSchema.extend({
          aum: z.number().min(0, "AUM must be positive"),
          clientCount: z.number().min(0, "Client count must be positive"),
          avgPortfolioSize: z.number().min(0, "Average portfolio size must be positive"),
          returnRate: z.number(), // Can be negative
          riskAssessment: riskAssessmentSchema,
        }),
      },
    },
  },
  // Add more sectors...
};

// Helper function to get metrics schema for a specific sector and industry
export function getSectorMetricsSchema(sector: string, industry: string) {
  try {
    const sectorData = businessSectors[sector as keyof typeof businessSectors];
    if (!sectorData) return null;

    const industryData = sectorData.industries[industry as keyof typeof sectorData.industries];
    if (!industryData) return null;

    return industryData.metrics;
  } catch (error) {
    console.error('Error getting sector metrics schema:', error);
    return null;
  }
}

// Helper function to get all available sector-industry combinations
export function getSectorIndustryCombinations() {
  const combinations: Array<{ sector: string; industry: string; name: string }> = [];

  Object.entries(businessSectors).forEach(([sectorKey, sectorData]) => {
    Object.entries(sectorData.industries).forEach(([industryKey, industryData]) => {
      combinations.push({
        sector: sectorKey,
        industry: industryKey,
        name: `${sectorData.name} - ${industryData.name}`,
      });
    });
  });

  return combinations;
}

// Type definitions for metrics
export type SectorMetrics = {
  [K in keyof typeof businessSectors]: {
    [I in keyof typeof businessSectors[K]["industries"]]: z.infer<
      typeof businessSectors[K]["industries"][I]["metrics"]
    >;
  };
};

// Export types for type checking
export type BaseSectorMetrics = z.infer<typeof baseMetricsSchema>;
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>;