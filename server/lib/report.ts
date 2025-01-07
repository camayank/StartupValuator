import PDFDocument from 'pdfkit';
import type { ValuationFormData } from "../../client/src/lib/validations";
import { currencies } from "../../client/src/lib/validations";
import { Chart } from 'chart.js';
import { createCanvas } from 'canvas';

function formatCurrency(value: number, currency: string = 'USD'): string {
  const currencyInfo = currencies[currency as keyof typeof currencies];
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

async function generateValuationChart(data: {
  revenue: number;
  growthRate: number;
  years: number;
}): Promise<Buffer> {
  const canvas = createCanvas(600, 400);
  const ctx = canvas.getContext('2d');

  const years = Array.from({ length: data.years }, (_, i) => i + 1);
  const revenues = years.map(year =>
    data.revenue * Math.pow(1 + (data.growthRate / 100), year)
  );

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: years.map(year => `Year ${year}`),
      datasets: [{
        label: 'Projected Revenue',
        data: revenues,
        borderColor: '#2563eb',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => formatCurrency(Number(value), 'USD')
          }
        }
      }
    }
  });

  return canvas.toBuffer();
}

export async function generatePdfReport(data: ValuationFormData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting PDF generation with data:', JSON.stringify(data, null, 2));

      // Create a new PDF document with custom font and layout settings
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

      // Title Page
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('Startup Valuation Report', { align: 'center' })
        .fontSize(12)
        .font('Helvetica')
        .text(`Generated on ${formatDate()}`, { align: 'center' })
        .moveDown(2);

      // Company Details Section
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

      // Add page numbers
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(8)
           .text(
             `Page ${i + 1} of ${pages.count}`,
             50,
             doc.page.height - 50,
             { align: 'center' }
           );
      }

      // Footer with disclaimer
      doc
        .fontSize(10)
        .text('Disclaimer', { underline: true })
        .fontSize(8)
        .text(
          'This valuation report is generated using advanced financial modeling and market analysis. ' +
          'The results represent an estimate based on provided information and current market conditions. ' +
          'Actual values may vary based on numerous factors including market conditions, negotiation dynamics, and other considerations.',
          { color: '#666666' }
        );

      // Finalize the PDF
      doc.end();

    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(new Error('Failed to generate PDF report'));
    }
  });
}