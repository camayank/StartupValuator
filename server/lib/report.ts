import PDFDocument from 'pdfkit';
import type { ValuationFormData } from "../../client/src/lib/validations";

function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
    notation: 'compact'
  }).format(value);
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export async function generatePdfReport(data: ValuationFormData & { 
  valuation: number;
  multiplier: number;
  revenue: number;
  growthRate: number;
  margins: number;
  businessName: string;
  stage: string;
  industry: string;
  region: string;
  currency: string;
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting PDF generation with data:', JSON.stringify(data, null, 2));

      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Startup Valuation Report - ${data.businessName}`,
          Author: 'AI Valuation Platform',
          Subject: 'Startup Valuation Report',
          Keywords: 'valuation, startup, report',
          CreationDate: new Date(),
        }
      });

      // Collect PDF data chunks
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add content to PDF
      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .text('Startup Valuation Report', { align: 'center' })
        .moveDown()
        .fontSize(12)
        .font('Helvetica')
        .text(`Generated on ${formatDate()}`, { align: 'center' })
        .moveDown(2);

      // Company Details
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .text(data.businessName)
        .moveDown()
        .fontSize(12)
        .font('Helvetica')
        .text(`Industry: ${data.industry}`)
        .text(`Stage: ${data.stage}`)
        .text(`Region: ${data.region}`)
        .moveDown(2);

      // Valuation
      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#2563eb')
        .text(`Valuation: ${formatCurrency(data.valuation, data.currency)}`)
        .moveDown(2)
        .fillColor('black');

      // Key Metrics
      doc
        .fontSize(18)
        .text('Key Metrics')
        .moveDown()
        .fontSize(12)
        .font('Helvetica')
        .text(`Annual Revenue: ${formatCurrency(data.revenue, data.currency)}`)
        .text(`Growth Rate: ${data.growthRate}%`)
        .text(`Operating Margins: ${data.margins}%`)
        .text(`Revenue Multiple: ${data.multiplier.toFixed(1)}x`)
        .moveDown(2);

      // Disclaimer
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('Disclaimer')
        .moveDown()
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#666666')
        .text(
          'This startup valuation report was generated using advanced financial modeling techniques and market data analysis. ' +
          'The valuation represents an estimate based on the information provided and current market conditions.\n\n' +
          'This report is for informational purposes only and should not be considered as financial advice. ' +
          'Actual market values may vary based on numerous factors including market conditions, negotiation dynamics, and strategic considerations.'
        );

      // Finalize the PDF
      doc.end();

    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(new Error('Failed to generate PDF report'));
    }
  });
}