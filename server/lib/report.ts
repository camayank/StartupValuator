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

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function generateMetricsChart(data: ValuationFormData): Buffer {
  const canvas = createCanvas(600, 300);
  const ctx = canvas.getContext('2d');

  // Create bar chart for key metrics
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Revenue', 'Growth Rate', 'Operating Margins'],
      datasets: [{
        label: 'Key Financial Metrics',
        data: [data.revenue, data.growthRate, data.margins],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)',  // Blue
          'rgba(34, 197, 94, 0.8)',  // Green
          'rgba(249, 115, 22, 0.8)', // Orange
        ],
        borderColor: [
          'rgb(37, 99, 235)',
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              if (typeof value === 'number') {
                if (value > 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value > 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value;
              }
              return '';
            }
          }
        }
      }
    }
  });

  // Ensure the chart is rendered
  chart.draw();

  return canvas.toBuffer();
}

export async function generatePdfReport(data: ValuationFormData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting PDF generation with data:', JSON.stringify(data, null, 2));

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

      // Key Financial Metrics Section
      doc.addPage();
      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .text('Key Financial Metrics', { align: 'center' })
        .moveDown();

      // Create a grid layout for metrics
      const metrics = [
        { label: 'Annual Revenue', value: formatCurrency(data.revenue, data.currency) },
        { label: 'Growth Rate', value: formatPercentage(data.growthRate) },
        { label: 'Operating Margins', value: formatPercentage(data.margins) }
      ];

      // Draw metrics in a professional card layout
      let yPosition = doc.y;
      metrics.forEach((metric, index) => {
        const xPosition = 50 + (index * 170);

        // Draw metric card
        doc
          .rect(xPosition, yPosition, 150, 80)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        // Add metric label
        doc
          .font('Helvetica')
          .fontSize(12)
          .fillColor('#64748b')
          .text(metric.label, xPosition + 10, yPosition + 15);

        // Add metric value
        doc
          .font('Helvetica-Bold')
          .fontSize(16)
          .fillColor('#0f172a')
          .text(metric.value, xPosition + 10, yPosition + 40);
      });

      // Add metrics visualization
      try {
        doc.moveDown(6);
        const chartBuffer = generateMetricsChart(data);
        doc.image(chartBuffer, {
          fit: [500, 250],
          align: 'center'
        });
      } catch (error) {
        console.error('Error generating metrics chart:', error);
        doc
          .font('Helvetica')
          .fontSize(12)
          .fillColor('#ef4444')
          .text('Chart visualization unavailable', { align: 'center' });
      }

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
          { align: 'justify' }
        );

      // Finalize the PDF
      doc.end();

    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(new Error('Failed to generate PDF report'));
    }
  });
}