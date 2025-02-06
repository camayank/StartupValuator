import type { BusinessSector } from '@/lib/types';
import { z } from "zod";

// Define type for the business data structure
type BusinessDataStructure = {
  [sector: string]: {
    [segment: string]: string[];
  };
};

// Business sectors data
export const BUSINESS_SECTORS: BusinessDataStructure = {
  "Technology & Software": {
    "Enterprise Software": ["ERP", "CRM", "HRM"],
    "Cloud Computing": ["IaaS", "PaaS", "SaaS"],
    "AI & ML": ["NLP", "Computer Vision", "AI Analytics"],
    "Cybersecurity": ["Network Security", "Endpoint Security", "Cloud Security"]
  },
  "Healthcare & Life Sciences": {
    "Digital Health": ["Telehealth", "Mobile Health", "Health Analytics"],
    "Biotech": ["Gene Therapy", "Molecular Diagnostics", "Bioinformatics"],
    "Medical Devices": ["Diagnostic Devices", "Wearable Tech", "Surgical Robotics"]
  },
  "Financial Technology": {
    "Digital Banking": ["Neo Banking", "Open Banking", "Embedded Finance"],
    "Payments": ["Digital Payments", "Cross-Border Payments", "BNPL"],
    "WealthTech": ["Robo-Advisory", "Investment Platforms", "Personal Finance"]
  },
  "E-Commerce & Retail": {
    "Online Marketplace": ["Multi-Vendor Marketplace", "Social Commerce", "Niche Marketplaces"],
    "Direct-to-Consumer": ["Brand Commerce", "Subscription Commerce", "Custom Products"],
    "RetailTech": ["POS Systems", "Retail Analytics", "E-commerce SaaS"]
  },
  "Clean Technology": {
    "Renewable Energy": ["Solar Technology", "Wind Energy", "Hydro Energy"],
    "Energy Storage": ["Battery Technology", "Thermal Storage", "Hydrogen Storage"],
    "Sustainable Materials": ["Biodegradable Packaging", "Green Chemicals", "Recycling Tech"]
  }
};

// Type validation schema
export const SectorSchema = z.object({
  sector: z.string().min(1, "Sector is required"),
  segment: z.string().min(1, "Segment is required"),
  subSegment: z.string().min(1, "Sub-segment is required")
});

export type SectorSelection = z.infer<typeof SectorSchema>;

// Utility functions for cascading dropdowns
export const sectorOperations = {
  getAllSectors() {
    return Object.keys(BUSINESS_SECTORS).map(sector => ({
      value: sector,
      label: sector
    }));
  },

  getSegmentsForSector(sector: string) {
    const sectorData = BUSINESS_SECTORS[sector];
    if (!sectorData) return [];
    return Object.keys(sectorData).map(segment => ({
      value: segment,
      label: segment
    }));
  },

  getSubSegments(sector: string, segment: string) {
    const sectorData = BUSINESS_SECTORS[sector];
    if (!sectorData || !sectorData[segment]) return [];
    return sectorData[segment].map(subSegment => ({
      value: subSegment,
      label: subSegment
    }));
  }
};