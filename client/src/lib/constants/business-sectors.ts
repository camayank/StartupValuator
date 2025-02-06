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
      }
    }
  }
};

// Utility functions for working with sectors
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
      label: segment.name,
      metrics: segment.metrics
    }));
  },

  getSubSegments(sectorKey: string, segmentKey: string) {
    const sector = BUSINESS_SECTORS[sectorKey];
    const segment = sector?.segments[segmentKey];
    return segment?.subSegments.map(sub => ({
      value: sub.toLowerCase().replace(/\s+/g, '_'),
      label: sub
    })) || [];
  },

  getMetrics(sectorKey: string, segmentKey: string) {
    const sector = BUSINESS_SECTORS[sectorKey];
    const segment = sector?.segments[segmentKey];
    return segment?.metrics || null;
  }
};
