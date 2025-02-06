import { type BusinessInformation } from "../types/startup-business";

// Industry to Sector mapping
const industrySectorMap: Record<string, string[]> = {
  "healthcare": ["saas", "hardware", "service", "research"],
  "finance": ["saas", "platform", "service", "consulting"],
  "retail": ["marketplace", "platform", "distribution"],
  "manufacturing": ["hardware", "manufacturing", "distribution"],
  "technology": ["saas", "platform", "hardware", "consulting"],
  "education": ["saas", "platform", "service", "consulting"],
  "transportation": ["platform", "service", "distribution"],
  "energy": ["hardware", "service", "research", "manufacturing"],
  "agriculture": ["hardware", "platform", "manufacturing", "distribution"],
  "real_estate": ["platform", "service", "marketplace"]
};

// Industry segments with subcategories
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
  retail: [
    "E-commerce",
    "Direct-to-Consumer",
    "Retail Technology",
    "Supply Chain",
    "Omnichannel"
  ],
  technology: [
    "Enterprise Software",
    "Consumer Apps",
    "Cloud Services",
    "Cybersecurity",
    "AI/ML"
  ],
  // Add more industries and their segments
};

export class BusinessInformationHandler {
  // Get available sectors for an industry
  static getAvailableSectors(industry: string): string[] {
    return industrySectorMap[industry] || [];
  }

  // Get industry segments
  static getIndustrySegments(industry: string): string[] {
    return industrySegments[industry as keyof typeof industrySegments] || [];
  }

  // Validate industry-sector combination
  static validateIndustrySector(industry: string, sector: string): boolean {
    const availableSectors = this.getAvailableSectors(industry);
    return availableSectors.includes(sector);
  }

  // Get recommended team size based on industry and sector
  static getRecommendedTeamSize(industry: string, sector: string): number {
    const baseSize = 2;
    const industryMultipliers: Record<string, number> = {
      technology: 1.5,
      healthcare: 1.3,
      finance: 1.2,
      manufacturing: 1.4
    };
    const sectorMultipliers: Record<string, number> = {
      saas: 1.3,
      hardware: 1.5,
      platform: 1.4,
      research: 1.2
    };

    const industryMult = industryMultipliers[industry] || 1;
    const sectorMult = sectorMultipliers[sector] || 1;

    return Math.ceil(baseSize * industryMult * sectorMult);
  }

  // Validate complete business information
  static validateBusinessInformation(data: BusinessInformation): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Required fields validation
    if (!data.industrySegment) {
      errors.push("Industry segment is required");
    }

    if (!data.sector) {
      errors.push("Business sector is required");
    } else if (!this.validateIndustrySector(data.industrySegment, data.sector)) {
      errors.push("Selected sector is not valid for this industry");
    }

    // Team size validation
    const recommendedTeamSize = this.getRecommendedTeamSize(data.industrySegment, data.sector);
    if (data.teamSize < recommendedTeamSize) {
      warnings.push(`Recommended team size for ${data.industrySegment} ${data.sector} businesses is ${recommendedTeamSize}`);
    }

    // Description validation
    if (data.description.length < 50) {
      errors.push("Business description must be at least 50 characters");
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