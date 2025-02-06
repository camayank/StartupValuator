import type { BusinessSector, SectorSegment, SubSegment, Metrics } from '@/lib/types';

export const BUSINESS_SECTORS: Record<string, BusinessSector> = {
  TECHNOLOGY: {
    name: "Technology & Software",
    segments: {
      ENTERPRISE_SOFTWARE: {
        name: "Enterprise Software",
        subSegments: ["ERP", "CRM", "HRM"],
        metrics: {
          key: ["ARR", "CAC", "LTV", "Churn Rate"],
          valuation: ["Revenue Multiple", "ARR Multiple"]
        }
      },
      CLOUD_COMPUTING: {
        name: "Cloud Computing",
        subSegments: ["IaaS", "PaaS", "SaaS"],
        metrics: {
          key: ["Monthly Active Users", "Server Uptime", "Resource Utilization"],
          valuation: ["Revenue Multiple", "Growth Multiple"]
        }
      },
      AI_ML: {
        name: "AI & Machine Learning",
        subSegments: ["NLP", "Computer Vision", "AI Analytics"],
        metrics: {
          key: ["Model Accuracy", "Training Data Size", "Inference Speed"],
          valuation: ["Technology Premium", "IP Value"]
        }
      }
    }
  },
  HEALTHCARE: {
    name: "Healthcare & Life Sciences",
    segments: {
      DIGITAL_HEALTH: {
        name: "Digital Health",
        subSegments: ["Telehealth", "Mobile Health", "Health Analytics"],
        metrics: {
          key: ["Patient Engagement", "Clinical Outcomes", "User Retention"],
          valuation: ["Revenue Multiple", "Patient Multiple"]
        }
      },
      BIOTECH: {
        name: "Biotech",
        subSegments: ["Gene Therapy", "Molecular Diagnostics", "Bioinformatics"],
        metrics: {
          key: ["Clinical Trial Success", "Patent Portfolio", "Research Pipeline"],
          valuation: ["Clinical Stage Multiple", "IP Value"]
        }
      },
      MEDICAL_DEVICES: {
        name: "Medical Devices",
        subSegments: [
          "Diagnostic Devices",
          "Wearable Technology",
          "Surgical Robotics"
        ],
        metrics: {
          key: ["FDA Approval Stage", "Clinical Validation", "Manufacturing Cost"],
          valuation: ["Regulatory Stage Multiple", "Revenue Multiple"]
        }
      }
    }
  },
  FINTECH: {
    name: "Financial Technology",
    segments: {
      DIGITAL_BANKING: {
        name: "Digital Banking",
        subSegments: [
          "Neo Banking",
          "Open Banking",
          "Embedded Finance"
        ],
        metrics: {
          key: ["User Acquisition Cost", "Transaction Volume", "Customer Lifetime Value"],
          valuation: ["User Multiple", "Transaction Multiple"]
        }
      },
      PAYMENTS: {
        name: "Payments & Transfers",
        subSegments: ["Digital Payments", "Cross-Border Payments", "BNPL"],
        metrics: {
          key: ["Processing Volume", "Take Rate", "Payment Success Rate"],
          valuation: ["GTV Multiple", "Transaction Multiple"]
        }
      },
      WEALTHTECH: {
        name: "WealthTech",
        subSegments: ["Robo-Advisory", "Investment Platforms", "Personal Finance"],
        metrics: {
          key: ["AUM", "Investment Performance", "Client Retention"],
          valuation: ["AUM Multiple", "Revenue Multiple"]
        }
      }
    }
  },
  ECOMMERCE: {
    name: "E-Commerce & Retail",
    segments: {
      MARKETPLACE: {
        name: "Online Marketplace",
        subSegments: ["Multi-Vendor", "Social Commerce", "Niche Markets"],
        metrics: {
          key: ["GMV", "Take Rate", "Seller Retention"],
          valuation: ["GMV Multiple", "Revenue Multiple"]
        }
      },
      DTC: {
        name: "Direct-to-Consumer",
        subSegments: ["Brand Commerce", "Subscription Commerce", "Custom Products"],
        metrics: {
          key: ["CAC", "AOV", "Repeat Purchase Rate"],
          valuation: ["Revenue Multiple", "Customer Multiple"]
        }
      },
      RETAILTECH: {
        name: "RetailTech",
        subSegments: [
          "POS Systems",
          "Retail Analytics",
          "Inventory Management"
        ],
        metrics: {
          key: ["Transaction Volume", "Store Coverage", "Analytics Adoption"],
          valuation: ["SaaS Multiple", "Transaction Multiple"]
        }
      }
    }
  }
};

// Utility functions for sector and segment operations
export const sectorOperations = {
  getAllSectors() {
    return Object.entries(BUSINESS_SECTORS).map(([key, sector]) => ({
      value: key,
      label: sector.name
    }));
  },

  getSegmentsForSector(sectorKey: string) {
    const sector = BUSINESS_SECTORS[sectorKey];
    if (!sector) return [];

    return Object.entries(sector.segments).map(([key, segment]) => ({
      value: key,
      label: segment.name
    }));
  },

  getSubSegments(sectorKey: string, segmentKey: string) {
    const sector = BUSINESS_SECTORS[sectorKey];
    const segment = sector?.segments[segmentKey];

    if (!segment?.subSegments) return [];

    return segment.subSegments.map(sub => ({
      value: sub.toLowerCase().replace(/\s+/g, '_'),
      label: sub
    }));
  },

  getMetrics(sectorKey: string, segmentKey: string) {
    const sector = BUSINESS_SECTORS[sectorKey];
    const segment = sector?.segments[segmentKey];
    return segment?.metrics || null;
  }
};