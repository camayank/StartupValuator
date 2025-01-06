import { z } from "zod";

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  validation: z.ZodSchema<any>;
  rules: Array<{
    id: string;
    description: string;
    validate: (data: any) => boolean;
  }>;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  region: string;
  requirements: ComplianceRequirement[];
  adjustments: {
    discountRate: number;
    marketRiskPremium: number;
    countryRiskPremium: number;
  };
}

// International Valuation Standards (IVS) Framework
export const ivsFramework: ComplianceFramework = {
  id: "ivs",
  name: "International Valuation Standards",
  description: "Global standards for valuation practice and professional valuation services",
  region: "global",
  requirements: [
    {
      id: "ivs_101",
      name: "Scope of Work",
      description: "Clear identification of assets, liabilities, or interests to be valued",
      validation: z.object({
        assetDescription: z.string().min(1),
        purposeOfValuation: z.string().min(1),
        valuationDate: z.string().datetime(),
      }),
      rules: [
        {
          id: "ivs_101_1",
          description: "Asset description must be detailed and specific",
          validate: (data) => data.assetDescription.length >= 50,
        },
      ],
    },
    {
      id: "ivs_102",
      name: "Investigations and Compliance",
      description: "Sufficient evidence to support valuation conclusions",
      validation: z.object({
        dataSources: z.array(z.string()),
        assumptions: z.array(z.object({
          description: z.string(),
          justification: z.string(),
        })),
      }),
      rules: [
        {
          id: "ivs_102_1",
          description: "At least three credible data sources must be used",
          validate: (data) => data.dataSources.length >= 3,
        },
      ],
    },
  ],
  adjustments: {
    discountRate: 0,
    marketRiskPremium: 0.05,
    countryRiskPremium: 0,
  },
};

// ICAI Valuation Standards Framework
export const icaiFramework: ComplianceFramework = {
  id: "icai",
  name: "ICAI Valuation Standards",
  description: "Indian valuation standards issued by the Institute of Chartered Accountants of India",
  region: "india",
  requirements: [
    {
      id: "icai_101",
      name: "Professional Ethics",
      description: "Adherence to fundamental principles of integrity and objectivity",
      validation: z.object({
        disclaimers: z.array(z.string()),
        assumptions: z.array(z.object({
          description: z.string(),
          basis: z.string(),
        })),
      }),
      rules: [
        {
          id: "icai_101_1",
          description: "All material assumptions must be disclosed",
          validate: (data) => data.assumptions.length > 0,
        },
      ],
    },
  ],
  adjustments: {
    discountRate: 0.02,
    marketRiskPremium: 0.07,
    countryRiskPremium: 0.03,
  },
};

// 409A Compliance Framework
export const section409aFramework: ComplianceFramework = {
  id: "409a",
  name: "Section 409A Valuation",
  description: "US IRS requirements for determining fair market value of private company stock",
  region: "us",
  requirements: [
    {
      id: "409a_101",
      name: "Independent Appraisal",
      description: "Valuation by qualified independent appraiser",
      validation: z.object({
        independentAppraisal: z.boolean(),
        qualifiedAppraiser: z.object({
          name: z.string(),
          qualifications: z.string(),
          independence: z.boolean(),
        }),
      }),
      rules: [
        {
          id: "409a_101_1",
          description: "Valuation must be performed by qualified independent appraiser",
          validate: (data) => data.independentAppraisal && data.qualifiedAppraiser.independence,
        },
      ],
    },
  ],
  adjustments: {
    discountRate: 0.015,
    marketRiskPremium: 0.06,
    countryRiskPremium: 0,
  },
};

export const frameworks = {
  ivs: ivsFramework,
  icai: icaiFramework,
  "409a": section409aFramework,
} as const;

export type FrameworkId = keyof typeof frameworks;

export function getFramework(id: FrameworkId): ComplianceFramework {
  return frameworks[id];
}

export function validateFrameworkCompliance(
  framework: ComplianceFramework,
  data: any
): Array<{ requirement: ComplianceRequirement; errors: string[] }> {
  return framework.requirements.map((requirement) => {
    const validationResult = requirement.validation.safeParse(data);
    const ruleViolations = requirement.rules
      .filter((rule) => !rule.validate(data))
      .map((rule) => rule.description);

    return {
      requirement,
      errors: [
        ...(!validationResult.success
          ? validationResult.error.errors.map((e) => e.message)
          : []),
        ...ruleViolations,
      ],
    };
  });
}

export function applyFrameworkAdjustments(
  framework: ComplianceFramework,
  baseValue: number
): number {
  const { discountRate, marketRiskPremium, countryRiskPremium } = framework.adjustments;
  const totalAdjustment = 1 + discountRate + marketRiskPremium + countryRiskPremium;
  return baseValue * totalAdjustment;
}
