import { z } from "zod";

type BusinessSectorData = {
  [sector: string]: {
    [segment: string]: string[];
  };
};

// Transform CSV data into structured format
export const BUSINESS_SECTORS: BusinessSectorData = {
  "Technology & Software": {
    "Enterprise Software": ["ERP", "CRM", "HRM"],
    "Cloud Computing": ["IaaS", "PaaS", "SaaS"],
    "AI & ML": ["NLP", "Computer Vision", "AI Analytics", "Conversational AI"],
    "Cybersecurity": ["Network Security", "Endpoint Security", "Cloud Security", "IoT Security"]
  },
  "Healthcare & Life Sciences": {
    "Digital Health": ["Telehealth", "Mobile Health", "Health Analytics", "Health Informatics"],
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
  },
  "Advanced Manufacturing": {
    "Industry 4.0": ["Smart Factory", "Industrial IoT", "Predictive Maintenance"],
    "Automation": ["Robotic Process Automation", "Industrial Robotics", "Automated Warehousing"],
    "3D Printing": ["Metal 3D Printing", "Bioprinting", "Prototyping"]
  },
  "Agriculture Technology": {
    "Precision Agriculture": ["Farm Management", "Smart Irrigation", "Soil Monitoring"],
    "FoodTech": ["Alternative Protein", "Food Safety Tech", "Food Delivery Tech"],
    "Agri-Supply Chain": ["Agri-Marketplaces", "Agri-Finance", "Cold Chain Logistics"]
  },
  "Education Technology": {
    "Online Learning": ["K-12 EdTech", "Higher EdTech", "Vocational Training"],
    "Skill Development": ["Corporate Training", "Upskilling Platforms", "Job Readiness"],
    "Corporate Training": ["Leadership Training", "Sales Training", "Compliance Training"]
  },
  "Real Estate & PropTech": {
    "Smart Buildings": ["Home Automation", "Smart Energy Management", "Building Security"],
    "Real Estate Financing": ["Mortgage Tech", "REIT Platforms", "Crowdfunding"],
    "Property Management": ["Tenant Management", "Property Analytics", "PropTech SaaS"]
  },
  "Media & Entertainment": {
    "Streaming Platforms": ["OTT Video", "Music Streaming", "Podcasting"],
    "Gaming & eSports": ["Mobile Gaming", "Console Gaming", "Game Streaming"],
    "Digital Advertising": ["AdTech Platforms", "Influencer Marketing", "Programmatic Advertising"]
  }
};

// Helper functions for dropdown operations
export const sectorOperations = {
  getAllSectors() {
    return Object.keys(BUSINESS_SECTORS).map(sector => ({
      value: sector,
      label: sector
    }));
  },

  getSegmentsForSector(sector: string) {
    const segments = BUSINESS_SECTORS[sector] || {};
    return Object.keys(segments).map(segment => ({
      value: segment,
      label: segment
    }));
  },

  getSubSegments(sector: string, segment: string) {
    const subSegments = BUSINESS_SECTORS[sector]?.[segment] || [];
    return subSegments.map(subSegment => ({
      value: subSegment,
      label: subSegment
    }));
  }
};

// Type definitions for business profile
export const businessModelOptions = [
  { value: "subscription", label: "Subscription" },
  { value: "transactional", label: "Transactional" },
  { value: "marketplace", label: "Marketplace" },
  { value: "advertising", label: "Advertising" },
  { value: "licensing", label: "Licensing" },
  { value: "freemium", label: "Freemium" },
  { value: "saas", label: "SaaS" },
  { value: "enterprise", label: "Enterprise" },
  { value: "direct_sales", label: "Direct Sales" },
  { value: "hardware", label: "Hardware" },
  { value: "hybrid", label: "Hybrid" }
];

export const productStageOptions = [
  { value: "concept", label: "Concept" },
  { value: "prototype", label: "Prototype" },
  { value: "mvp", label: "MVP" },
  { value: "beta", label: "Beta" },
  { value: "market_ready", label: "Market Ready" },
  { value: "scaling", label: "Scaling" },
  { value: "mature", label: "Mature" },
  { value: "next_gen", label: "Next Generation" }
];

// Zod schema for validation
export const businessSectorSchema = z.object({
  sector: z.string().min(1, "Sector is required"),
  segment: z.string().min(1, "Segment is required"),
  subSegment: z.string().min(1, "Sub-segment is required")
});

export type BusinessSector = z.infer<typeof businessSectorSchema>;