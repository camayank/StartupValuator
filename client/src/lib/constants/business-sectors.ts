import type { BusinessSector, BusinessSegment, BusinessSubSegment } from '@/lib/types';

export const BUSINESS_SECTORS: BusinessSector[] = [
  {
    id: 'TECH',
    name: 'Technology & Software',
    segments: [
      {
        id: 'ENTERPRISE_SOFTWARE',
        name: 'Enterprise Software',
        subSegments: [
          {
            id: 'ERP',
            name: 'ERP Systems',
            examples: 'SAP, Oracle ERP',
            metrics: {
              keyMetrics: ['Annual Recurring Revenue', 'Customer Churn Rate', 'Customer Acquisition Cost'],
              valuationMetrics: ['Revenue Multiple', 'Growth Rate']
            }
          },
          {
            id: 'CRM',
            name: 'CRM Systems',
            examples: 'Salesforce, HubSpot',
            metrics: {
              keyMetrics: ['User Adoption Rate', 'Sales Efficiency', 'Customer Retention'],
              valuationMetrics: ['ARR Multiple', 'Customer LTV']
            }
          },
          {
            id: 'HRM',
            name: 'HR Management',
            examples: 'Workday, BambooHR',
            metrics: {
              keyMetrics: ['Employee Satisfaction', 'HR Process Efficiency', 'Cost per Hire'],
              valuationMetrics: ['SaaS Metrics', 'Efficiency Ratios']
            }
          }
        ]
      },
      {
        id: 'CLOUD_COMPUTING',
        name: 'Cloud Computing',
        subSegments: [
          {
            id: 'IAAS',
            name: 'Infrastructure as a Service',
            examples: 'AWS EC2, Google Compute Engine',
            metrics: {
              keyMetrics: ['Server Uptime', 'Resource Utilization', 'Customer Usage'],
              valuationMetrics: ['Usage-based Metrics', 'Infrastructure Scale']
            }
          },
          {
            id: 'PAAS',
            name: 'Platform as a Service',
            examples: 'Heroku, Google App Engine',
            metrics: {
              keyMetrics: ['Developer Adoption', 'Platform Usage', 'Service Reliability'],
              valuationMetrics: ['Developer Economics', 'Platform Scale']
            }
          }
        ]
      }
    ]
  },
  {
    id: 'HEALTHCARE',
    name: 'Healthcare & Life Sciences',
    segments: [
      {
        id: 'DIGITAL_HEALTH',
        name: 'Digital Health',
        subSegments: [
          {
            id: 'TELEHEALTH',
            name: 'Telehealth',
            examples: 'Teladoc, Amwell',
            metrics: {
              keyMetrics: ['Patient Visits', 'Provider Network', 'Patient Satisfaction'],
              valuationMetrics: ['Patient Economics', 'Network Effects']
            }
          },
          {
            id: 'HEALTH_ANALYTICS',
            name: 'Health Analytics',
            examples: 'Health Catalyst, Clarify Health',
            metrics: {
              keyMetrics: ['Data Accuracy', 'Analytics Adoption', 'Clinical Outcomes'],
              valuationMetrics: ['Data Value', 'Clinical Impact']
            }
          }
        ]
      }
    ]
  }
];

// Utility functions for sector operations
export const sectorOperations = {
  getAllSectors() {
    return BUSINESS_SECTORS.map(sector => ({
      value: sector.id,
      label: sector.name
    }));
  },

  getSegmentsForSector(sectorId: string) {
    const sector = BUSINESS_SECTORS.find(s => s.id === sectorId);
    return sector?.segments.map(segment => ({
      value: segment.id,
      label: segment.name
    })) || [];
  },

  getSubSegments(sectorId: string, segmentId: string) {
    const sector = BUSINESS_SECTORS.find(s => s.id === sectorId);
    const segment = sector?.segments.find(seg => seg.id === segmentId);
    return segment?.subSegments.map(sub => ({
      value: sub.id,
      label: sub.name,
      description: sub.examples
    })) || [];
  },

  getMetrics(sectorId: string, segmentId: string, subSegmentId: string) {
    const sector = BUSINESS_SECTORS.find(s => s.id === sectorId);
    const segment = sector?.segments.find(seg => seg.id === segmentId);
    const subSegment = segment?.subSegments.find(sub => sub.id === subSegmentId);
    return subSegment?.metrics || null;
  }
};