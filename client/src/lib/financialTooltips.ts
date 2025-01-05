import { type TooltipContentProps } from "@radix-ui/react-tooltip";

export interface FinancialTerm {
  term: string;
  definition: string;
  example?: string;
  learnMoreUrl?: string;
}

export const financialTerms: Record<string, FinancialTerm> = {
  revenue: {
    term: "Revenue",
    definition: "The total amount of income generated from sales of goods or services",
    example: "If a company sells 100 products at $10 each, the revenue is $1,000",
  },
  valuation: {
    term: "Valuation",
    definition: "The process of determining the current worth of an asset or company",
    example: "A company valued at 10x its annual revenue of $1M would be worth $10M",
  },
  growthRate: {
    term: "Growth Rate",
    definition: "The rate at which a company's revenue or other metrics increase over time",
    example: "A 50% annual growth rate means the company's revenue increases by half each year",
  },
  margins: {
    term: "Operating Margins",
    definition: "The profit a company makes on each dollar of revenue after paying operating costs",
    example: "20% margins mean for every $100 in revenue, $20 is profit after operating costs",
  },
  multiplier: {
    term: "Revenue Multiple",
    definition: "A valuation method that compares a company's value to its revenue",
    example: "A 5x multiple means the company is valued at 5 times its annual revenue",
  },
  intellectualProperty: {
    term: "Intellectual Property",
    definition: "Legal rights to creations of the mind, such as patents, trademarks, and copyrights",
    example: "A patent on a unique technology or a trademark on a brand name",
  },
  marketValidation: {
    term: "Market Validation",
    definition: "Evidence that customers are willing to pay for your product or service",
    example: "Having paying customers or letters of intent from potential clients",
  },
  scalability: {
    term: "Scalability",
    definition: "A business's ability to grow revenue faster than costs",
    example: "Software companies can often add users without proportionally increasing costs",
  },
  competitiveDifferentiation: {
    term: "Competitive Differentiation",
    definition: "Unique features or capabilities that set a company apart from competitors",
    example: "Proprietary technology, unique business model, or exclusive partnerships",
  },
  fundingReadiness: {
    term: "Funding Readiness",
    definition: "How prepared a company is to receive investment based on various criteria",
    example: "Having a strong team, proven product, and clear growth metrics",
  }
};

export interface FinancialTooltipProps extends Omit<TooltipContentProps, "content"> {
  term: keyof typeof financialTerms;
  showExample?: boolean;
}

export function getTermDefinition(term: keyof typeof financialTerms): FinancialTerm {
  return financialTerms[term];
}
