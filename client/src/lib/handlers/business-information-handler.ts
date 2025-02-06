import { type BusinessInformation, validateBusinessStageRequirements, stageRequirements } from "../types/startup-business";
import { sectors, industries } from "../validations";

export class BusinessInformationHandler {
  // Sector-specific validations and requirements
  private static sectorSpecificValidations = {
    fintech: {
      requiresRegulatory: true,
      minTeamSize: 3,
      recommendedCertifications: ["PCI DSS", "SOC 2", "ISO 27001"],
      riskFactors: ["Regulatory Compliance", "Cybersecurity", "Market Competition"]
    },
    healthtech: {
      requiresRegulatory: true,
      minTeamSize: 3,
      recommendedCertifications: ["HIPAA", "FDA", "ISO 13485"],
      riskFactors: ["Regulatory Approval", "Clinical Validation", "Data Privacy"]
    },
    enterprise: {
      requiresRegulatory: false,
      minTeamSize: 2,
      recommendedCertifications: ["ISO 9001", "ISO 27001"],
      riskFactors: ["Enterprise Adoption", "Integration Complexity", "Sales Cycle"]
    }
  };

  // Validate complete business information
  static validateBusinessInformation(data: BusinessInformation) {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!data.name || data.name.trim().length === 0) {
      errors.push("Business name is required");
    }

    if (!data.sector || !Object.keys(sectors).includes(data.sector)) {
      errors.push("Valid business sector is required");
    }

    // Stage-specific validation
    const stageValidation = validateBusinessStageRequirements(data, data.stage);
    if (!stageValidation.isValid) {
      errors.push(...stageValidation.errors);
    }

    // Sector-specific validation
    const sectorRules = this.sectorSpecificValidations[data.sector as keyof typeof this.sectorSpecificValidations];
    if (sectorRules) {
      if (sectorRules.requiresRegulatory && data.regulatoryStatus.compliance === "notRequired") {
        errors.push(`${data.sector} businesses typically require regulatory compliance`);
      }

      if (data.teamSize < sectorRules.minTeamSize) {
        warnings.push(`${data.sector} businesses typically require a minimum team size of ${sectorRules.minTeamSize}`);
      }

      // Add certification suggestions
      const missingCertifications = sectorRules.recommendedCertifications.filter(
        cert => !data.regulatoryStatus.certifications.includes(cert)
      );
      if (missingCertifications.length > 0) {
        suggestions.push(`Consider obtaining these certifications: ${missingCertifications.join(", ")}`);
      }
    }

    // Business model validation based on sector
    this.validateBusinessModelForSector(data, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // Validate business model compatibility with sector
  private static validateBusinessModelForSector(data: BusinessInformation, warnings: string[]) {
    const sectorBusinessModels = {
      fintech: ["saas", "transaction_fees", "subscription"],
      healthtech: ["saas", "licensing", "subscription"],
      enterprise: ["saas", "licensing", "subscription", "consulting"]
    };

    const recommendedModels = sectorBusinessModels[data.sector as keyof typeof sectorBusinessModels];
    if (recommendedModels && !recommendedModels.includes(data.businessModel)) {
      warnings.push(
        `${data.businessModel} is an unusual business model for ${data.sector}. Consider: ${recommendedModels.join(", ")}`
      );
    }
  }

  // Get growth stage requirements for next stage
  static getGrowthRequirements(currentStage: keyof typeof stageRequirements) {
    const nextRequiredFields = getNextRequiredFields(currentStage);
    const currentReqs = stageRequirements[currentStage];
    const nextStageKey = Object.keys(stageRequirements)[
      Object.keys(stageRequirements).indexOf(currentStage) + 1
    ] as keyof typeof stageRequirements;
    
    if (!nextStageKey) return null;

    const nextReqs = stageRequirements[nextStageKey];
    
    return {
      additionalFields: nextRequiredFields,
      teamGrowth: nextReqs.minTeamSize - currentReqs.minTeamSize,
      enhancedDescription: nextReqs.minDescription - currentReqs.minDescription,
      newRequirements: {
        requiresFinancials: nextReqs.requiresFinancials || false,
        requiresCustomerBase: nextReqs.requiresCustomerBase || false,
        requiresTechnologyStack: nextReqs.requiresTechnologyStack || false
      }
    };
  }

  // Get sector-specific recommendations
  static getSectorRecommendations(sector: keyof typeof sectors) {
    const sectorRules = this.sectorSpecificValidations[sector];
    if (!sectorRules) return null;

    return {
      recommendedTeamSize: sectorRules.minTeamSize,
      certifications: sectorRules.recommendedCertifications,
      keyRiskFactors: sectorRules.riskFactors,
      regulatoryRequirements: sectorRules.requiresRegulatory
    };
  }
}

export default BusinessInformationHandler;
