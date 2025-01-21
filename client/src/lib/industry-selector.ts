import { type ValuationFormData } from "./validations";

interface IndustryOption {
  value: string;
  label: string;
  description?: string;
}

interface SectorDependencies {
  [key: string]: IndustryOption[];
}

export const IndustrySelector = {
  // Sector to industry mapping with enhanced metadata
  dependencies: {
    Technology: [
      { value: 'saas', label: 'SaaS', description: 'Software as a Service companies' },
      { value: 'ai_ml', label: 'AI/ML', description: 'Artificial Intelligence and Machine Learning' },
      { value: 'enterprise', label: 'Enterprise Software', description: 'Business software solutions' },
      { value: 'mobile', label: 'Mobile Apps', description: 'Mobile application development' }
    ],
    'E-commerce': [
      { value: 'd2c', label: 'D2C', description: 'Direct to Consumer brands' },
      { value: 'marketplace', label: 'Marketplace', description: 'Multi-vendor platforms' },
      { value: 'retail_tech', label: 'Retail Tech', description: 'Retail technology solutions' }
    ],
    Healthcare: [
      { value: 'diagnostics', label: 'Diagnostics', description: 'Medical diagnostic solutions' },
      { value: 'pharma', label: 'Pharma', description: 'Pharmaceutical companies' },
      { value: 'telemedicine', label: 'Telemedicine', description: 'Remote healthcare services' }
    ]
  } as const,

  // Configuration for UI features
  ui: {
    searchEnabled: true,
    tooltips: true,
    suggestions: true,
    placeholder: {
      sector: 'Select your business sector',
      industry: 'Select specific industry'
    }
  },

  // Get industries for a given sector
  getIndustries: (sector: string): IndustryOption[] => {
    return IndustrySelector.dependencies[sector as keyof typeof IndustrySelector.dependencies] || [];
  },

  // Search functionality
  searchIndustries: (sector: string, searchTerm: string): IndustryOption[] => {
    const industries = IndustrySelector.getIndustries(sector);
    if (!searchTerm) return industries;

    const normalizedSearch = searchTerm.toLowerCase();
    return industries.filter(industry => 
      industry.label.toLowerCase().includes(normalizedSearch) ||
      industry.description?.toLowerCase().includes(normalizedSearch)
    );
  },

  // Get suggestions based on current input
  getSuggestions: (data: Partial<ValuationFormData>): string[] => {
    const sector = data.sector;
    if (!sector) return [];

    const industries = IndustrySelector.getIndustries(sector);
    return industries.map(industry => 
      `${industry.label}: ${industry.description}`
    );
  },

  // Validate selected combination
  validateSelection: (sector: string, industry: string): boolean => {
    const industries = IndustrySelector.getIndustries(sector);
    return industries.some(opt => opt.value === industry);
  }
};

export default IndustrySelector;
