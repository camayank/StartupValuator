import { create, all } from 'mathjs';
import type { FinancialMetrics, MarketConditions } from '../types/financial';

// Initialize mathjs with all functions
const math = create(all);

export class FinancialCalculationService {
  /**
   * Calculate Weighted Average Cost of Capital (WACC)
   */
  static calculateWACC(
    equityValue: number,
    debtValue: number,
    costOfEquity: number,
    costOfDebt: number,
    taxRate: number
  ): number {
    const totalValue = equityValue + debtValue;
    const equityWeight = equityValue / totalValue;
    const debtWeight = debtValue / totalValue;

    return math.round(
      (equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - taxRate)) * 100
    ) / 100;
  }

  /**
   * Calculate Cost of Equity using CAPM
   */
  static calculateCostOfEquity(
    riskFreeRate: number,
    beta: number,
    marketRiskPremium: number
  ): number {
    return math.round(
      (riskFreeRate + beta * marketRiskPremium) * 100
    ) / 100;
  }

  /**
   * Calculate Enterprise Value using multiples method
   */
  static calculateEnterpriseValue(
    metrics: FinancialMetrics,
    marketConditions: MarketConditions,
    revenueMultiple: number
  ): number {
    return math.round(metrics.revenue * revenueMultiple);
  }

  /**
   * Calculate Discounted Cash Flow (DCF)
   */
  static calculateDCF(
    cashFlows: number[],
    discountRate: number,
    terminalGrowthRate: number
  ): number {
    const lastCashFlow = cashFlows[cashFlows.length - 1];
    const terminalValue = lastCashFlow * (1 + terminalGrowthRate) / (discountRate - terminalGrowthRate);

    let presentValue = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      presentValue += cashFlows[i] / Math.pow(1 + discountRate, i + 1);
    }

    const terminalPresentValue = terminalValue / Math.pow(1 + discountRate, cashFlows.length);
    return math.round(presentValue + terminalPresentValue);
  }

  /**
   * Project Future Cash Flows
   */
  static projectCashFlows(
    currentCashFlow: number,
    growthRate: number,
    years: number
  ): number[] {
    const cashFlows: number[] = [];
    for (let i = 0; i < years; i++) {
      cashFlows.push(
        math.round(currentCashFlow * Math.pow(1 + growthRate, i))
      );
    }
    return cashFlows;
  }
}