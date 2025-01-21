import type { ValuationFormData } from "./validations";

interface TooltipContent {
  text: string;
  example?: string;
  benchmarks?: Record<string, any>;
}

export const TooltipSystem = {
  getFieldTooltip: (field: keyof ValuationFormData): TooltipContent => {
    const tooltips: Record<string, TooltipContent> = {
      businessName: {
        text: "Your company's legal or registered business name",
        example: "Example: TechStart Solutions Inc."
      },
      sector: {
        text: "The primary industry sector your business operates in",
        example: "Example: Technology, Healthcare, E-commerce"
      },
      marketSize: {
        text: "Estimated total addressable market in your target geography",
        example: "Example: $100M for a niche B2B SaaS solution",
        benchmarks: {
          small: "< $1B",
          medium: "$1B - $10B",
          large: "> $10B"
        }
      },
      revenueModel: {
        text: "How do you plan to generate revenue?",
        example: "Example: Subscription, Transaction fees, License sales"
      },
      revenue: {
        text: "Current annual revenue or run rate",
        example: "Example: $500,000 annually"
      },
      customerBase: {
        text: "Number of active paying customers",
        example: "Example: 100 enterprise clients"
      },
      employeeCount: {
        text: "Total number of full-time employees",
        example: "Example: 25 full-time employees"
      },
      stage: {
        text: "Current stage of your business",
        example: "Example: Seed, Series A, Growth"
      },
      intellectualProperty: {
        text: "Status of your intellectual property protection",
        example: "Example: 2 pending patents, registered trademarks"
      }
    };

    return tooltips[field] || { text: "Additional information about this field" };
  },

  getMetricTooltip: (metric: string, industry: string): TooltipContent => {
    const industryMetrics: Record<string, Record<string, TooltipContent>> = {
      SaaS: {
        mrr: {
          text: "Monthly Recurring Revenue - predictable revenue generated each month",
          example: "Example: $50,000 MRR from subscriptions",
          benchmarks: {
            seed: "$10K - $50K",
            seriesA: "$100K - $500K"
          }
        },
        churnRate: {
          text: "Monthly customer churn rate as a percentage",
          example: "Example: 2% monthly churn rate",
          benchmarks: {
            good: "< 2%",
            concerning: "> 5%"
          }
        }
      },
      Ecommerce: {
        gmv: {
          text: "Gross Merchandise Value - total sales volume",
          example: "Example: $1M monthly GMV",
          benchmarks: {
            seed: "$100K - $500K monthly",
            seriesA: "$1M+ monthly"
          }
        },
        aov: {
          text: "Average Order Value",
          example: "Example: $75 per order",
          benchmarks: {
            low: "< $50",
            medium: "$50 - $200",
            high: "> $200"
          }
        }
      }
    };

    return industryMetrics[industry]?.[metric] || { text: "Industry-specific metric" };
  }
};

export default TooltipSystem;
