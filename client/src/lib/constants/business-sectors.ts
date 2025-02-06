import type { BusinessSector } from '@/lib/types';

// Generated from CSV data using simplified structure
export const BUSINESS_SECTORS = {
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
  }
};

// Simple utility functions for sector operations
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