/**
 * Berkus Method Valuation Service
 * For pre-revenue startups - adapted for Indian context
 *
 * Awards value up to ₹50L for each of 5 key success factors
 */

interface BerkusInputs {
  hasPrototype: boolean;
  hasMinimalViableProduct: boolean;
  hasBetaCustomers: boolean;
  teamQuality: number; // 0-10 rating
  strategicRelationships: number; // 0-10 rating
  ideaSoundness: number; // 0-10 rating
  marketSize: number; // TAM in INR
  intellectualProperty: boolean;
  stage: string;
}

interface BerkusResult {
  method: 'berkus';
  equityValue: number;
  breakdown: {
    baseValue: number;
    ideaValue: number;
    prototypeValue: number;
    teamValue: number;
    strategicRelationshipsValue: number;
    productRolloutValue: number;
    bonusFactors: number;
  };
  confidence: number;
  reasoning: string[];
}

export class BerkusValuationService {
  // Indian market adaptation - base values in INR
  private readonly BASE_VALUE = 20000000; // ₹2 crore base for India
  private readonly MAX_VALUE_PER_FACTOR = 5000000; // ₹50 lakhs per factor
  private readonly BONUS_FOR_IP = 2500000; // ₹25 lakhs bonus for IP
  private readonly BONUS_FOR_LARGE_MARKET = 5000000; // ₹50 lakhs if TAM > ₹1000 Cr

  /**
   * Calculate Berkus valuation for pre-revenue startups
   */
  public calculate(inputs: BerkusInputs): BerkusResult {
    let totalValue = this.BASE_VALUE;
    const reasoning: string[] = [];
    const breakdown = {
      baseValue: this.BASE_VALUE,
      ideaValue: 0,
      prototypeValue: 0,
      teamValue: 0,
      strategicRelationshipsValue: 0,
      productRolloutValue: 0,
      bonusFactors: 0
    };

    reasoning.push(`Starting with base value of ₹${(this.BASE_VALUE / 10000000).toFixed(1)} Cr for early-stage startup`);

    // 1. Sound Idea / Business Model (0-100% of max value)
    const ideaValue = (inputs.ideaSoundness / 10) * this.MAX_VALUE_PER_FACTOR;
    breakdown.ideaValue = ideaValue;
    totalValue += ideaValue;
    reasoning.push(
      `Sound idea (${inputs.ideaSoundness}/10): +₹${(ideaValue / 100000).toFixed(1)}L`
    );

    // 2. Prototype (0-100% of max value based on maturity)
    let prototypeValue = 0;
    if (inputs.hasMinimalViableProduct) {
      prototypeValue = this.MAX_VALUE_PER_FACTOR; // Full value for MVP
      reasoning.push(`Has MVP: +₹${(prototypeValue / 100000).toFixed(1)}L`);
    } else if (inputs.hasPrototype) {
      prototypeValue = this.MAX_VALUE_PER_FACTOR * 0.6; // 60% for prototype
      reasoning.push(`Has prototype: +₹${(prototypeValue / 100000).toFixed(1)}L`);
    } else {
      reasoning.push(`No prototype yet: +₹0L`);
    }
    breakdown.prototypeValue = prototypeValue;
    totalValue += prototypeValue;

    // 3. Quality Management Team (0-100% of max value)
    const teamValue = (inputs.teamQuality / 10) * this.MAX_VALUE_PER_FACTOR;
    breakdown.teamValue = teamValue;
    totalValue += teamValue;
    reasoning.push(
      `Team quality (${inputs.teamQuality}/10): +₹${(teamValue / 100000).toFixed(1)}L`
    );

    // 4. Strategic Relationships (0-100% of max value)
    const relationshipsValue = (inputs.strategicRelationships / 10) * this.MAX_VALUE_PER_FACTOR;
    breakdown.strategicRelationshipsValue = relationshipsValue;
    totalValue += relationshipsValue;
    reasoning.push(
      `Strategic relationships (${inputs.strategicRelationships}/10): +₹${(relationshipsValue / 100000).toFixed(1)}L`
    );

    // 5. Product Rollout / Early Sales (0-100% of max value)
    let productRolloutValue = 0;
    if (inputs.hasBetaCustomers) {
      productRolloutValue = this.MAX_VALUE_PER_FACTOR * 0.8; // 80% for beta customers
      reasoning.push(`Has beta customers: +₹${(productRolloutValue / 100000).toFixed(1)}L`);
    } else if (inputs.hasMinimalViableProduct) {
      productRolloutValue = this.MAX_VALUE_PER_FACTOR * 0.4; // 40% for ready product
      reasoning.push(`Product market-ready: +₹${(productRolloutValue / 100000).toFixed(1)}L`);
    }
    breakdown.productRolloutValue = productRolloutValue;
    totalValue += productRolloutValue;

    // Bonus Factors
    let bonusValue = 0;

    // Bonus for intellectual property
    if (inputs.intellectualProperty) {
      bonusValue += this.BONUS_FOR_IP;
      reasoning.push(`IP/Patent: +₹${(this.BONUS_FOR_IP / 100000).toFixed(1)}L bonus`);
    }

    // Bonus for large addressable market (> ₹1000 Cr)
    if (inputs.marketSize > 100000000000) {
      bonusValue += this.BONUS_FOR_LARGE_MARKET;
      reasoning.push(`Large TAM (>₹${(inputs.marketSize / 10000000000).toFixed(0)}00 Cr): +₹${(this.BONUS_FOR_LARGE_MARKET / 100000).toFixed(1)}L bonus`);
    }

    breakdown.bonusFactors = bonusValue;
    totalValue += bonusValue;

    // Calculate confidence
    const confidence = this.calculateConfidence(inputs);

    return {
      method: 'berkus',
      equityValue: Math.round(totalValue),
      breakdown,
      confidence,
      reasoning
    };
  }

  private calculateConfidence(inputs: BerkusInputs): number {
    let confidence = 60; // Base confidence for pre-revenue

    // Increase confidence with product maturity
    if (inputs.hasMinimalViableProduct) {
      confidence += 15;
    } else if (inputs.hasPrototype) {
      confidence += 8;
    }

    // Increase confidence with customer validation
    if (inputs.hasBetaCustomers) {
      confidence += 10;
    }

    // Increase confidence with strong team
    if (inputs.teamQuality >= 8) {
      confidence += 10;
    }

    // Increase confidence with IP
    if (inputs.intellectualProperty) {
      confidence += 5;
    }

    return Math.min(100, confidence);
  }
}
