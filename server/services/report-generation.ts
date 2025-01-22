import { jsPDF } from "jspdf";
import xlsx from "xlsx";
import type { SelectValuationRecord } from "@db/schema";
import { format } from "date-fns";

export class ReportGenerator {
  private generateExecutiveSummary(data: SelectValuationRecord): string {
    return `
# Executive Summary

## Company Overview
${data.businessInfo.name} is operating in the ${data.businessInfo.sector} sector.

## Key Metrics
- Current Revenue: $${data.financialData.revenue.toLocaleString()}
- Growth Rate: ${data.marketData.growthRate}%
- LTV/CAC Ratio: ${(data.financialData.ltv / data.financialData.cac).toFixed(2)}

## Valuation Range
$${data.calculatedValuation?.low.toLocaleString()} - $${data.calculatedValuation?.high.toLocaleString()}

## Growth Highlights
- Market Size (TAM): $${data.marketData.tam.toLocaleString()}
- Serviceable Market (SAM): $${data.marketData.sam.toLocaleString()}
- Target Market (SOM): $${data.marketData.som.toLocaleString()}
    `;
  }

  private generateMarketAnalysisData(data: SelectValuationRecord) {
    const { tam, sam, som } = data.marketData;
    return {
      marketSize: {
        labels: ["TAM", "SAM", "SOM"],
        data: [tam, sam, som]
      },
      growthProjections: data.risksAndOpportunities?.aiInsights?.growthProjections || {
        projections: {
          year1: data.financialData.revenue * 1.5,
          year2: data.financialData.revenue * 2.25,
          year3: data.financialData.revenue * 3.375
        }
      }
    };
  }

  private generateFinancialProjections(data: SelectValuationRecord) {
    const growthRate = data.marketData.growthRate / 100;
    const currentRevenue = data.financialData.revenue;
    const projections = [];

    for (let year = 1; year <= 3; year++) {
      projections.push({
        year: `Year ${year}`,
        revenue: currentRevenue * Math.pow(1 + growthRate, year),
        costs: currentRevenue * Math.pow(1 + growthRate, year) * 0.7, // Assuming 70% costs
        profit: currentRevenue * Math.pow(1 + growthRate, year) * 0.3, // Assuming 30% profit
      });
    }

    return projections;
  }

  async generatePDFReport(data: SelectValuationRecord): Promise<Buffer> {
    const doc = new jsPDF();
    let y = 10;

    // Add executive summary
    const executiveSummary = this.generateExecutiveSummary(data);
    doc.setFontSize(12);
    doc.text(executiveSummary, 10, y);
    y += 100;

    // Add market analysis
    const marketAnalysis = this.generateMarketAnalysisData(data);
    doc.setFontSize(14);
    doc.text("Market Analysis", 10, y);
    y += 10;

    // Add market size data in table format
    doc.setFontSize(12);
    marketAnalysis.marketSize.labels.forEach((label, index) => {
      doc.text(`${label}: $${marketAnalysis.marketSize.data[index].toLocaleString()}`, 20, y + (index * 10));
    });
    y += 40;

    // Add financial projections
    const projections = this.generateFinancialProjections(data);
    doc.setFontSize(14);
    doc.text("Financial Projections", 10, y);
    y += 10;

    projections.forEach(proj => {
      doc.setFontSize(12);
      doc.text(`${proj.year}:`, 10, y);
      doc.text(`Revenue: $${proj.revenue.toLocaleString()}`, 20, y + 7);
      doc.text(`Profit: $${proj.profit.toLocaleString()}`, 20, y + 14);
      y += 25;
    });

    // Add AI insights if available
    const aiInsights = data.risksAndOpportunities?.aiInsights;
    if (aiInsights) {
      doc.setFontSize(14);
      doc.text("AI Insights", 10, y);
      y += 10;
      doc.setFontSize(12);

      // Market Analysis
      if (aiInsights.marketAnalysis) {
        doc.text("Market Analysis:", 10, y);
        y += 10;
        doc.text(`Growth Potential: ${aiInsights.marketAnalysis.growthPotential}`, 20, y);
        y += 10;
        aiInsights.marketAnalysis.recommendations.forEach(rec => {
          doc.text(`- ${rec}`, 20, y);
          y += 7;
        });
      }

      // Risk Assessment
      if (aiInsights.riskAssessment) {
        y += 10;
        doc.text("Risk Assessment:", 10, y);
        y += 10;
        doc.text(`Risk Level: ${aiInsights.riskAssessment.riskLevel}`, 20, y);
        y += 10;
        aiInsights.riskAssessment.keyRisks.forEach(risk => {
          doc.text(`- ${risk}`, 20, y);
          y += 7;
        });
      }
    }

    return Buffer.from(doc.output());
  }

  async generateExcelReport(data: SelectValuationRecord): Promise<Buffer> {
    const wb = xlsx.utils.book_new();

    // Executive Summary Sheet
    const summaryData = [
      ["Company Name", data.businessInfo.name],
      ["Sector", data.businessInfo.sector],
      ["Current Revenue", data.financialData.revenue],
      ["Growth Rate", `${data.marketData.growthRate}%`],
      ["Valuation Range", `${data.calculatedValuation?.low} - ${data.calculatedValuation?.high}`],
    ];
    const summaryWS = xlsx.utils.aoa_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(wb, summaryWS, "Executive Summary");

    // Financial Projections Sheet
    const projections = this.generateFinancialProjections(data);
    const projectionsData = [
      ["Year", "Revenue", "Costs", "Profit"],
      ...projections.map(p => [p.year, p.revenue, p.costs, p.profit]),
    ];
    const projectionsWS = xlsx.utils.aoa_to_sheet(projectionsData);
    xlsx.utils.book_append_sheet(wb, projectionsWS, "Financial Projections");

    // Market Analysis Sheet
    const marketData = [
      ["Metric", "Value"],
      ["TAM", data.marketData.tam],
      ["SAM", data.marketData.sam],
      ["SOM", data.marketData.som],
      ["Growth Rate", `${data.marketData.growthRate}%`],
      ["Competitors", data.marketData.competitors?.join(", ") || "N/A"],
    ];
    const marketWS = xlsx.utils.aoa_to_sheet(marketData);
    xlsx.utils.book_append_sheet(wb, marketWS, "Market Analysis");

    return xlsx.write(wb, { type: "buffer", bookType: "xlsx" });
  }
}