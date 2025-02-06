import type { BusinessSector } from '@/lib/types';
import { z } from "zod";

// Parse CSV data into structured format
export const BUSINESS_SECTORS = {
  "Technology & Software": {
    "Enterprise Software": ["ERP", "CRM", "HRM"],
    "Cloud Computing": ["IaaS", "PaaS", "SaaS"]
  },
  "Healthcare & Life Sciences": {
    "Digital Health": ["Telehealth", "Mobile Health", "Health Analytics"],
    "Biotech": ["Gene Therapy", "Molecular Diagnostics", "Bioinformatics"]
  },
  "Financial Technology": {
    "Digital Banking": ["Neo Banking", "Open Banking", "Embedded Finance"],
    "Payments": ["Digital Payments", "Cross-Border Payments", "BNPL"]
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
    if (!BUSINESS_SECTORS[sector]) return [];
    return Object.keys(BUSINESS_SECTORS[sector]).map(segment => ({
      value: segment,
      label: segment
    }));
  },

  getSubSegments(sector: string, segment: string) {
    if (!BUSINESS_SECTORS[sector] || !BUSINESS_SECTORS[sector][segment]) return [];
    return BUSINESS_SECTORS[sector][segment].map(subSegment => ({
      value: subSegment.toLowerCase().replace(/\s+/g, '_'),
      label: subSegment
    }));
  }
};