import { type TooltipContentProps } from "@radix-ui/react-tooltip";

export interface FinancialTerm {
  term: string;
  definition: string;
  example?: string;
  learnMoreUrl?: string;
  category?: 'valuation' | 'financial' | 'market' | 'compliance';
}

export const financialTerms: Record<string, FinancialTerm> = {
  revenue: {
    term: "Revenue",
    definition: "The total amount of income generated from sales of goods or services before any costs or expenses are deducted",
    example: "If a company sells 100 products at $10 each, the annual revenue is $1,000",
    category: "financial"
  },
  valuation: {
    term: "Valuation",
    definition: "The process of determining the current worth of an asset or company using various financial methods and metrics",
    example: "A company valued at 10x its annual revenue of $1M would be worth $10M",
    category: "valuation"
  },
  growthRate: {
    term: "Growth Rate",
    definition: "The percentage increase in a company's revenue, profit, or other metrics over a specific time period",
    example: "A 50% annual growth rate means the revenue increases by half each year",
    category: "financial"
  },
  margins: {
    term: "Operating Margins",
    definition: "The percentage of revenue remaining after deducting operating costs, indicating operational efficiency",
    example: "20% margins mean for every $100 in revenue, $20 remains after operating costs",
    category: "financial"
  },
  multiplier: {
    term: "Revenue Multiple",
    definition: "A valuation method comparing a company's value to its revenue, commonly used for startups and growth companies",
    example: "A 5x multiple means the company is valued at 5 times its annual revenue",
    category: "valuation"
  },
  intellectualProperty: {
    term: "Intellectual Property",
    definition: "Legal rights to creations of the mind, such as patents, trademarks, and copyrights",
    example: "Patents on unique technology, trademarks on brand names, or proprietary software",
    category: "valuation"
  },
  marketValidation: {
    term: "Market Validation",
    definition: "Evidence that customers are willing to pay for your product or service, confirming market demand",
    example: "Having paying customers, signed contracts, or letters of intent",
    category: "market"
  },
  scalability: {
    term: "Scalability",
    definition: "A business's ability to grow revenue faster than its costs, indicating potential for profitable expansion",
    example: "SaaS companies can often add users with minimal incremental costs",
    category: "valuation"
  },
  competitiveDifferentiation: {
    term: "Competitive Differentiation",
    definition: "Unique features or capabilities that set a company apart from competitors, affecting valuation",
    example: "Proprietary technology, unique business model, or exclusive partnerships",
    category: "market"
  },
  fundingReadiness: {
    term: "Funding Readiness",
    definition: "How prepared a company is to receive investment based on various criteria and metrics",
    example: "Having a strong team, proven product, and clear growth metrics",
    category: "financial"
  },
  burnRate: {
    term: "Burn Rate",
    definition: "The rate at which a company spends its cash reserves on operating expenses",
    example: "A monthly burn rate of $50,000 means the company spends this amount to operate",
    category: "financial"
  },
  userAcquisitionCost: {
    term: "User Acquisition Cost (UAC)",
    definition: "The total cost of acquiring a new customer or user, including marketing and sales expenses",
    example: "If spending $1000 on marketing brings 100 users, UAC is $10 per user",
    category: "financial"
  },
  ltv: {
    term: "Lifetime Value (LTV)",
    definition: "The predicted total revenue a customer will generate throughout their relationship with the company",
    example: "A subscriber paying $50/month for 2 years has an LTV of $1,200",
    category: "financial"
  },
  marketSize: {
    term: "Total Addressable Market (TAM)",
    definition: "The total market demand for a product or service, representing maximum potential revenue",
    example: "If there are 1M potential customers who could spend $100/year, TAM is $100M",
    category: "market"
  },
  complianceStandard: {
    term: "Compliance Standard",
    definition: "Regulatory frameworks and guidelines that govern business valuations in different regions",
    example: "409A valuations for US startups, IFRS standards for international companies",
    category: "compliance"
  }
};

export interface FinancialTooltipProps extends Omit<TooltipContentProps, "content"> {
  term: keyof typeof financialTerms;
  showExample?: boolean;
  showCategory?: boolean;
}

export function getTermDefinition(term: keyof typeof financialTerms): FinancialTerm {
  return financialTerms[term];
}