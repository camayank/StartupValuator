import { z } from 'zod';
import PDFKit from 'pdfkit';

export const reportDataSchema = z.object({
  businessInfo: z.object({
    name: z.string(),
    sector: z.string(),
    industry: z.string(),
    stage: z.string(),
  }),
  valuation: z.object({
    amount: z.number(),
    methodology: z.string(),
    confidence: z.number(),
  }),
  analysis: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

export type ReportData = z.infer<typeof reportDataSchema>;

export async function generatePdfReport(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFKit();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate report content
      doc.fontSize(24).text('Startup Valuation Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(16).text('Business Information');
      doc.fontSize(12)
        .text(`Name: ${data.businessInfo.name}`)
        .text(`Sector: ${data.businessInfo.sector}`)
        .text(`Industry: ${data.businessInfo.industry}`)
        .text(`Stage: ${data.businessInfo.stage}`);
      doc.moveDown();

      doc.fontSize(16).text('Valuation Summary');
      doc.fontSize(12)
        .text(`Valuation Amount: $${data.valuation.amount.toLocaleString()}`)
        .text(`Methodology: ${data.valuation.methodology}`)
        .text(`Confidence Score: ${(data.valuation.confidence * 100).toFixed(1)}%`);
      doc.moveDown();

      // Add SWOT Analysis
      doc.fontSize(16).text('SWOT Analysis');
      doc.fontSize(12);
      doc.text('Strengths:');
      data.analysis.strengths.forEach(s => doc.text(`• ${s}`));
      doc.moveDown();
      
      doc.text('Weaknesses:');
      data.analysis.weaknesses.forEach(w => doc.text(`• ${w}`));
      doc.moveDown();
      
      doc.text('Opportunities:');
      data.analysis.opportunities.forEach(o => doc.text(`• ${o}`));
      doc.moveDown();
      
      doc.text('Threats:');
      data.analysis.threats.forEach(t => doc.text(`• ${t}`));
      doc.moveDown();

      // Add recommendations
      doc.fontSize(16).text('Recommendations');
      doc.fontSize(12);
      data.recommendations.forEach(r => doc.text(`• ${r}`));

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
