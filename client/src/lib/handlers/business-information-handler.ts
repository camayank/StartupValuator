import { type BusinessInformation } from "../types/startup-business";
import { MarketAnalysisHandler } from "./market-analysis-handler";

// Industry to Sector mapping with advanced categorization
const industrySectorMap: Record<string, string[]> = {
  "Medical Devices": ["hardware", "manufacturing", "research"],
  "Digital Health": ["saas", "platform", "service"],
  "Payment Processing": ["saas", "platform", "service"],
  "Enterprise Software": ["saas", "platform", "consulting"],
  "E-commerce": ["marketplace", "platform", "service"],
  "Consumer Apps": ["saas", "platform", "advertising"],
  "Cloud Services": ["saas", "platform", "service"],
  "Cybersecurity": ["saas", "platform", "consulting"],
  "AI/ML": ["saas", "platform", "research"]
};

// Industry segments with detailed subcategories
export const industrySegments = {
  healthcare: [
    "Medical Devices",
    "Digital Health",
    "Biotechnology",
    "Healthcare Services",
    "Pharmaceuticals"
  ],
  finance: [
    "Payment Processing",
    "Lending",
    "Insurance",
    "Wealth Management",
    "Banking"
  ],
  technology: [
    "Enterprise Software",
    "Consumer Apps",
    "Cloud Services",
    "Cybersecurity",
    "AI/ML"
  ],
  retail: [
    "E-commerce",
    "Direct-to-Consumer",
    "Retail Technology",
    "Supply Chain",
    "Omnichannel"
  ]
};

// Industry-specific validation requirements
const industryRequirements: Record<string, {
  minTeamSize: number;
  minDescriptionLength: number;
  requiredCertifications?: string[];
  riskFactors: string[];
}> = {
  "Medical Devices": {
    minTeamSize: 5,
    minDescriptionLength: 200,
    requiredCertifications: ["FDA", "ISO 13485"],
    riskFactors: ["Regulatory Compliance", "Clinical Validation", "Manufacturing Quality"]
  },
  "Digital Health": {
    minTeamSize: 4,
    minDescriptionLength: 150,
    requiredCertifications: ["HIPAA", "SOC 2"],
    riskFactors: ["Data Privacy", "User Adoption", "Integration"]
  },
  "Enterprise Software": {
    minTeamSize: 3,
    minDescriptionLength: 150,
    requiredCertifications: ["ISO 27001"],
    riskFactors: ["Security", "Scalability", "Enterprise Adoption"]
  },
  "AI/ML": {
    minTeamSize: 4,
    minDescriptionLength: 200,
    riskFactors: ["Data Quality", "Model Performance", "Ethical Considerations"]
  }
};

export class BusinessInformationHandler {
  static getAvailableSectors(industry: string): string[] {
    return industrySectorMap[industry] || [];
  }

  static getIndustrySegments(industry: string): string[] {
    return industrySegments[industry as keyof typeof industrySegments] || [];
  }

  static validateIndustrySector(industry: string, sector: string): boolean {
    const availableSectors = this.getAvailableSectors(industry);
    return availableSectors.includes(sector);
  }

  static async getRecommendedTeamSize(industry: string, sector: string): Promise<number> {
    const marketData = await MarketAnalysisHandler.analyzeMarketContext({
      industrySegment: industry,
      sector,
      name: "",
      businessModel: "saas",
      location: "",
      teamSize: 1,
      description: ""
    } as BusinessInformation);

    const baseSize = industryRequirements[industry]?.minTeamSize || 2;
    const marketSizeMultiplier = Math.log10(marketData.marketSize.total) / 10;
    const growthMultiplier = marketData.growthMetrics.industryGrowthRate / 10;

    return Math.ceil(baseSize * (1 + marketSizeMultiplier) * (1 + growthMultiplier));
  }

  static async validateBusinessInformation(data: BusinessInformation): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!data.industrySegment) {
      errors.push("Industry segment is required");
    }

    if (!data.sector) {
      errors.push("Business sector is required");
    } else if (!this.validateIndustrySector(data.industrySegment, data.sector)) {
      errors.push("Selected sector is not valid for this industry");
    }

    // Industry-specific validation
    const industryReqs = industryRequirements[data.industrySegment];
    if (industryReqs) {
      if (data.description.length < industryReqs.minDescriptionLength) {
        errors.push(`${data.industrySegment} businesses require a more detailed description (minimum ${industryReqs.minDescriptionLength} characters)`);
      }

      if (industryReqs.requiredCertifications) {
        suggestions.push(`Consider obtaining these certifications: ${industryReqs.requiredCertifications.join(", ")}`);
      }

      suggestions.push(`Key risk factors to address: ${industryReqs.riskFactors.join(", ")}`);
    }

    // Market analysis based validation
    if (data.industrySegment && data.sector) {
      const marketAnalysis = await MarketAnalysisHandler.analyzeMarketContext(data);

      // Team size recommendations
      const recommendedTeamSize = await this.getRecommendedTeamSize(data.industrySegment, data.sector);
      if (data.teamSize < recommendedTeamSize) {
        warnings.push(`Recommended team size for ${data.industrySegment} is ${recommendedTeamSize}`);
      }

      // Market insights
      if (marketAnalysis.growthMetrics.marketPotential === 'high') {
        suggestions.push(`${data.industrySegment} shows high growth potential. Consider aggressive scaling strategy.`);
      }

      // Competition insights
      const competition = marketAnalysis.competitiveLandscape;
      if (competition.marketConcentration === 'high') {
        warnings.push('Market shows high concentration. Strong differentiation strategy recommended.');
      }

      // Add market recommendations
      suggestions.push(...marketAnalysis.recommendations);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}

export default BusinessInformationHandler;