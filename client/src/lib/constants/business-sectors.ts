import type { BusinessSector } from '@/lib/types';

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
  }
};

// Simplified utility functions for sector operations
export const sectorOperations = {
  getAllSectors() {
    return Object.keys(BUSINESS_SECTORS).map(key => ({
      value: key,
      label: BUSINESS_SECTORS[key].name
    }));
  },

  getSegmentsForSector(sectorKey: string) {
    const sector = BUSINESS_SECTORS[sectorKey];
    if (!sector) return [];

    return Object.keys(sector.segments).map(key => ({
      value: key,
      label: sector.segments[key].name
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