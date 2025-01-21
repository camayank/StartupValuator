import { TestController } from '../services/TestController';
import { ReportGenerator } from '../services/ReportGenerator';

async function runValuationTests() {
  const scenarios = [
    { type: 'base', data: TestController.generateTestData('base') },
    { type: 'conservative', data: TestController.generateTestData('conservative') },
    { type: 'optimistic', data: TestController.generateTestData('optimistic') }
  ] as const;

  for (const scenario of scenarios) {
    console.log(`Running ${scenario.type} scenario...`);
    
    try {
      const report = await ReportGenerator.generateFullReport(scenario.data);
      console.log(`${scenario.type} Report:`, JSON.stringify(report, null, 2));
      
      // Validate report structure
      validateReport(report);
      
    } catch (error) {
      console.error(`Error in ${scenario.type} scenario:`, error);
    }
  }
}

function validateReport(report: any) {
  const requiredSections = [
    'executiveSummary',
    'detailedAnalysis',
    'valuationDetails',
    'recommendations'
  ];

  for (const section of requiredSections) {
    if (!report[section]) {
      throw new Error(`Missing required section: ${section}`);
    }
  }

  if (!report.valuationDetails.methodologies.scorecard || 
      !report.valuationDetails.methodologies.riskAdjusted || 
      !report.valuationDetails.methodologies.vc) {
    throw new Error('Missing valuation methodologies');
  }
}

// Run tests
runValuationTests();
