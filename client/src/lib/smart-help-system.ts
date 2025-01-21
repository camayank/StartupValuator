import type { ValuationFormData } from "./validations";
import { sectors, businessStages } from "./validations";
import { IndustrySpecificValidation } from "./industry-validation";

interface ContextualHelp {
  description: string;
  examples: string[];
  commonIssues: string[];
  benchmarks?: Record<string, any>;
}

interface SectionHelp {
  overview: string;
  bestPractices: string[];
  recommendations: string[];
}

const SmartHelpSystem = {
  contextualHelp: {
    getFieldHelp: (field: string, value: any, errors: string[]): ContextualHelp => {
      const baseHelp: ContextualHelp = {
        description: '',
        examples: [],
        commonIssues: errors || []
      };

      switch (field) {
        case 'businessName':
          return {
            ...baseHelp,
            description: 'Your company\'s legal or trading name',
            examples: ['TechStart Solutions', 'InnovateAI Labs', 'CloudScale Systems'],
            commonIssues: [
              'Name too short or generic',
              'Contains invalid characters',
              'Already registered by another company'
            ]
          };

        case 'revenue':
          return {
            ...baseHelp,
            description: 'Total revenue generated in the last 12 months',
            examples: ['$100,000 for early stage', '$1M+ for growth stage'],
            commonIssues: [
              'Including projected revenue',
              'Mixing different revenue types',
              'Incorrect time period'
            ],
            benchmarks: {
              seed: '0-500K',
              early: '500K-2M',
              growth: '2M+'
            }
          };

        default:
          return baseHelp;
      }
    },

    getSectionHelp: (section: string, data: ValuationFormData): SectionHelp => {
      switch (section) {
        case 'basicInfo':
          return {
            overview: 'Core information about your business identity and structure',
            bestPractices: [
              'Use your registered business name',
              'Select the most specific industry category',
              'Be precise with founding date'
            ],
            recommendations: SmartHelpSystem.generateRecommendations(data)
          };

        case 'financials':
          return {
            overview: 'Key financial metrics and performance indicators',
            bestPractices: [
              'Use actual, not projected numbers',
              'Include all revenue streams',
              'Be consistent with reporting periods'
            ],
            recommendations: SmartHelpSystem.generateFinancialRecommendations(data)
          };

        default:
          return {
            overview: '',
            bestPractices: [],
            recommendations: []
          };
      }
    },

    getBenchmarks: (field: string, industry: string): Record<string, any> => {
      const industryMetrics = IndustrySpecificValidation.getRequiredMetrics(industry);
      if (industryMetrics.includes(field)) {
        return SmartHelpSystem.getIndustryBenchmarks(industry, field);
      }
      return {};
    }
  },

  private: {
    generateRecommendations: (data: ValuationFormData): string[] => {
      const recommendations: string[] = [];
      const requiredMetrics = IndustrySpecificValidation.getRequiredMetrics(data.sector);
      
      if (requiredMetrics.length > 0) {
        recommendations.push(`Consider tracking these key metrics: ${requiredMetrics.join(', ')}`);
      }

      return recommendations;
    },

    getIndustryBenchmarks: (industry: string, field: string): Record<string, any> => {
      // Industry-specific benchmark data would go here
      const benchmarks: Record<string, Record<string, any>> = {
        saas: {
          revenue: {
            seed: '0-500K',
            early: '500K-2M',
            growth: '2M+'
          },
          churnRate: {
            good: '<5%',
            average: '5-10%',
            poor: '>10%'
          }
        },
        ecommerce: {
          gmv: {
            seed: '0-1M',
            early: '1M-5M',
            growth: '5M+'
          },
          returnRate: {
            good: '<10%',
            average: '10-20%',
            poor: '>20%'
          }
        }
      };

      return benchmarks[industry]?.[field] || {};
    }
  }
};

export default SmartHelpSystem;
