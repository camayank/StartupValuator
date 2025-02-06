import type { BusinessSector } from '@/lib/types';

// Generated from CSV data
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
          key: ["Server Uptime", "Resource Utilization", "Customer Usage"],
          valuation: ["Revenue Multiple", "Growth Multiple"]
        }
      },
      AI_ML: {
        name: "AI & Machine Learning",
        subSegments: ["NLP", "Computer Vision", "AI Analytics"],
        metrics: {
          key: ["Model Accuracy", "Training Data Size", "Processing Speed"],
          valuation: ["Technology Premium", "IP Value"]
        }
      },
      CYBERSECURITY: {
        name: "Cybersecurity",
        subSegments: ["Network Security", "Endpoint Security", "Cloud Security"],
        metrics: {
          key: ["Threat Detection Rate", "Response Time", "Security Score"],
          valuation: ["Revenue Multiple", "Security Premium"]
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
        subSegments: ["Diagnostic Devices", "Wearable Tech", "Surgical Robotics"],
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
        subSegments: ["Neo Banking", "Open Banking", "Embedded Finance"],
        metrics: {
          key: ["User Growth", "Transaction Volume", "Customer LTV"],
          valuation: ["User Multiple", "Transaction Multiple"]
        }
      },
      PAYMENTS: {
        name: "Payments",
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
  }
};

// Utility functions for sector operations
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