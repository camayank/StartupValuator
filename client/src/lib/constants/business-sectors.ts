import type { BusinessSector, SectorSegment, SubSegment, Metrics } from '@/lib/types';

export const BUSINESS_SECTORS: Record<string, BusinessSector> = {
  TECHNOLOGY: {
    name: "Technology",
    segments: {
      SOFTWARE: {
        name: "Software",
        subSegments: [
          "Enterprise Software (SaaS)",
          "Mobile Applications",
          "Developer Tools", 
          "Security Software",
          "Business Intelligence & Analytics",
          "CRM & Customer Experience",
          "Cloud Infrastructure",
          "DevOps & IT Management"
        ],
        metrics: {
          key: ["ARR", "CAC", "LTV", "Churn Rate"],
          valuation: ["Revenue Multiple", "ARR Multiple"]
        }
      },
      HARDWARE: {
        name: "Hardware",
        subSegments: [
          "Consumer Electronics",
          "Industrial Hardware",
          "IoT Devices",
          "Semiconductors",
          "Networking Equipment", 
          "Storage Devices",
          "Wearable Technology"
        ],
        metrics: {
          key: ["Gross Margin", "R&D Ratio", "Inventory Turnover"],
          valuation: ["EBITDA Multiple", "Revenue Multiple"]
        }
      },
      AI_ML: {
        name: "AI & Machine Learning",
        subSegments: [
          "Computer Vision",
          "Natural Language Processing",
          "Predictive Analytics",
          "Robotics & Automation",
          "Deep Learning",
          "AI Infrastructure",
          "AI Consulting"
        ],
        metrics: {
          key: ["Data Processing Capacity", "Model Accuracy", "Inference Speed"],
          valuation: ["Revenue Multiple", "Technology Premium"]
        }
      }
    }
  },
  HEALTHCARE: {
    name: "Healthcare",
    segments: {
      DIGITAL_HEALTH: {
        name: "Digital Health",
        subSegments: [
          "Telemedicine",
          "Health Analytics",
          "Electronic Health Records",
          "Mobile Health Apps",
          "Remote Patient Monitoring",
          "Digital Therapeutics",
          "Healthcare AI"
        ],
        metrics: {
          key: ["Patient Acquisition Cost", "Patient Lifetime Value", "Clinical Outcomes"],
          valuation: ["Revenue Multiple", "Patient Multiple"]
        }
      },
      BIOTECH: {
        name: "Biotech",
        subSegments: [
          "Drug Discovery",
          "Genomics",
          "Personalized Medicine",
          "Cell & Gene Therapy",
          "Bioinformatics",
          "Clinical Trials",
          "Bioprocessing"
        ],
        metrics: {
          key: ["R&D Pipeline", "Clinical Trial Success Rate", "Patent Portfolio"],
          valuation: ["Risk-Adjusted NPV", "Platform Value"]
        }
      },
      MEDICAL_DEVICES: {
        name: "Medical Devices",
        subSegments: [
          "Diagnostic Equipment",
          "Surgical Devices",
          "Patient Monitoring",
          "Implantable Devices",
          "Rehabilitation Equipment",
          "Medical Imaging",
          "Point-of-Care Devices"
        ],
        metrics: {
          key: ["FDA Approval Stage", "Manufacturing Margin", "Market Penetration"],
          valuation: ["EBITDA Multiple", "Revenue Multiple"]
        }
      }
    }
  },
  FINTECH: {
    name: "Financial Technology",
    segments: {
      PAYMENTS: {
        name: "Payments & Transfers",
        subSegments: [
          "Payment Processing",
          "Digital Wallets",
          "Cross-border Payments",
          "Point of Sale Systems",
          "Cryptocurrency Payments",
          "B2B Payments",
          "Payment Infrastructure"
        ],
        metrics: {
          key: ["Transaction Volume", "Take Rate", "Processing Fees"],
          valuation: ["GTV Multiple", "Revenue Multiple"]
        }
      },
      LENDING: {
        name: "Lending & Credit",
        subSegments: [
          "P2P Lending",
          "Buy Now Pay Later",
          "SME Lending",
          "Credit Scoring",
          "Supply Chain Finance",
          "Mortgage Tech",
          "Consumer Lending"
        ],
        metrics: {
          key: ["Loan Book Size", "Default Rate", "Net Interest Margin"],
          valuation: ["Book Value Multiple", "Revenue Multiple"]
        }
      },
      BANKING: {
        name: "Digital Banking",
        subSegments: [
          "Neobanks",
          "Banking-as-a-Service",
          "Personal Finance",
          "Business Banking",
          "Investment Platforms",
          "Wealth Management",
          "Insurtech"
        ],
        metrics: {
          key: ["Customer Acquisition Cost", "Deposits", "Active Users"],
          valuation: ["Customer Multiple", "AUM Multiple"]
        }
      }
    }
  },
  ECOMMERCE: {
    name: "E-Commerce & Retail",
    segments: {
      B2C: {
        name: "B2C E-Commerce",
        subSegments: [
          "Marketplace",
          "Direct-to-Consumer",
          "Subscription Commerce",
          "Social Commerce",
          "Mobile Commerce",
          "Live Shopping",
          "Cross-border E-commerce"
        ],
        metrics: {
          key: ["GMV", "Take Rate", "Customer Acquisition Cost"],
          valuation: ["GMV Multiple", "Revenue Multiple"]
        }
      },
      B2B: {
        name: "B2B E-Commerce",
        subSegments: [
          "Wholesale Marketplace",
          "Procurement Solutions",
          "Supply Chain Platforms",
          "Industrial E-commerce",
          "Distributor Platforms",
          "Trade Finance",
          "Inventory Management"
        ],
        metrics: {
          key: ["Transaction Volume", "Supplier Network", "Buyer Retention"],
          valuation: ["GTV Multiple", "Revenue Multiple"]
        }
      }
    }
  }
};

// Utility functions for working with sectors
export const sectorOperations = {
  getAllSectors() {
    return Object.entries(BUSINESS_SECTORS).map(([key, sector]) => ({
      value: key.toLowerCase(),
      label: sector.name
    }));
  },

  getSegmentsForSector(sectorKey: string) {
    const sector = BUSINESS_SECTORS[sectorKey.toUpperCase()];
    if (!sector) return [];

    return Object.entries(sector.segments).map(([key, segment]) => ({
      value: key.toLowerCase(),
      label: segment.name,
      metrics: segment.metrics
    }));
  },

  getSubSegments(sectorKey: string, segmentKey: string) {
    const sector = BUSINESS_SECTORS[sectorKey.toUpperCase()];
    const segment = sector?.segments[segmentKey.toUpperCase()];
    return segment?.subSegments.map(sub => ({
      value: sub.toLowerCase().replace(/\s+/g, '_'),
      label: sub
    })) || [];
  },

  getMetrics(sectorKey: string, segmentKey: string) {
    const sector = BUSINESS_SECTORS[sectorKey.toUpperCase()];
    const segment = sector?.segments[segmentKey.toUpperCase()];
    return segment?.metrics || null;
  }
};