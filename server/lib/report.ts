import htmlPdf from 'html-pdf-node';
import type { ValuationFormData } from "../../client/src/lib/validations";

function generateReportHtml(data: ValuationFormData & { 
  valuation: number;
  multiplier: number;
  revenue: number;
  growthRate: number;
  margins: number;
  details?: any;
  assumptions?: any;
  compliance?: any;
  businessName: string;
  stage: string;
  industry: string;
  region: string;
  currency: string;
}): string {
  const formatCurrency = (value: number) => {
    const currencyConfig = {
      USD: { symbol: "$", locale: "en-US" },
      INR: { symbol: "₹", locale: "en-IN" },
      EUR: { symbol: "€", locale: "de-DE" },
      GBP: { symbol: "£", locale: "en-GB" },
      JPY: { symbol: "¥", locale: "ja-JP" },
    } as const;

    const config = currencyConfig[data.currency as keyof typeof currencyConfig] || currencyConfig.USD;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: data.currency || 'USD',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Startup Valuation Report - ${data.businessName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }
        .valuation {
          font-size: 36px;
          color: #2563eb;
          font-weight: bold;
          margin: 20px 0;
        }
        .section {
          margin: 30px 0;
        }
        .section-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .metric-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }
        .metric-title {
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .metric-value {
          font-size: 24px;
          color: #2563eb;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Startup Valuation Report</h1>
        <p>Generated on ${formatDate()}</p>
      </div>

      <div class="section">
        <h2>${data.businessName}</h2>
        <p>
          ${data.industry} | ${data.stage} Stage<br>
          Region: ${data.region}
        </p>
        <div class="valuation">
          ${formatCurrency(data.valuation)}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Key Metrics</div>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">Annual Revenue</div>
            <div class="metric-value">${formatCurrency(data.revenue)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Growth Rate</div>
            <div class="metric-value">${data.growthRate}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Revenue Multiple</div>
            <div class="metric-value">${data.multiplier?.toFixed(1)}x</div>
          </div>
        </div>
      </div>

      ${data.assumptions ? `
        <div class="section">
          <div class="section-title">Valuation Assumptions</div>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">Operating Margins</div>
              <div class="metric-value">${data.margins}%</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Industry</div>
              <div class="metric-value">${data.industry}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Stage</div>
              <div class="metric-value">${data.stage}</div>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <p>This startup valuation report was generated using advanced financial modeling techniques 
        and market data analysis. The valuation represents an estimate based on the information 
        provided and current market conditions.</p>

        <p><strong>Disclaimer:</strong> This report is for informational purposes only and should 
        not be considered as financial advice. Actual market values may vary based on numerous 
        factors including market conditions, negotiation dynamics, and strategic considerations.</p>

        <p><strong>Report Details:</strong><br>
        Generated: ${formatDate()}<br>
        Business: ${data.businessName}<br>
        Industry: ${data.industry}<br>
        Stage: ${data.stage}<br>
        Region: ${data.region}</p>
      </div>
    </body>
    </html>
  `;
}

export async function generatePdfReport(data: any): Promise<Buffer> {
  try {
    const html = generateReportHtml(data);

    const options = {
      format: 'A4',
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      printBackground: true,
      preferCSSPageSize: true,
    };

    const pdfBuffer = await htmlPdf.generatePdf({ content: html }, options);
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}