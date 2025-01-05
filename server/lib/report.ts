import htmlPdf from 'html-pdf-node';
import type { ValuationData } from '../../client/src/lib/validations';

function generateReportHtml(data: ValuationData): string {
  const formatCurrency = (value: number) => {
    const currencyConfig = {
      USD: { symbol: "$", locale: "en-US" },
      INR: { symbol: "₹", locale: "en-IN" },
      EUR: { symbol: "€", locale: "de-DE" },
      GBP: { symbol: "£", locale: "en-GB" },
      JPY: { symbol: "¥", locale: "ja-JP" },
    };

    const config = currencyConfig[data.currency as keyof typeof currencyConfig] || currencyConfig.USD;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: data.currency || 'USD',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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
      <title>Professional Startup Valuation Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
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
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #1f2937;
        }
        .subsection {
          margin: 20px 0;
        }
        .subsection-title {
          font-size: 16px;
          font-weight: bold;
          color: #374151;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background-color: #f9fafb;
        }
        .metric-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
        }
        .metric-title {
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 5px;
        }
        .metric-value {
          font-size: 18px;
          color: #2563eb;
        }
        .scenario-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Professional Startup Valuation Report</h1>
        <p>Generated on ${formatDate()}</p>
      </div>

      <div class="section">
        <div class="valuation">
          ${formatCurrency(data.valuation)}
        </div>
        <p>Estimated Company Valuation (${data.currency})</p>
      </div>

      <div class="section">
        <div class="section-title">Executive Summary</div>
        <p>This valuation report provides a comprehensive analysis of the company's worth using ${data.methodology}. The valuation considers both quantitative metrics and qualitative factors to arrive at a fair market value.</p>
      </div>

      <div class="section">
        <div class="section-title">Company Profile</div>
        <div class="metric-card">
          <div class="metric-title">Industry</div>
          <div class="metric-value">${data.industry.charAt(0).toUpperCase() + data.industry.slice(1)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Stage</div>
          <div class="metric-value">${data.stage.charAt(0).toUpperCase() + data.stage.slice(1)}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Key Financial Metrics</div>
        <div class="metric-card">
          <div class="metric-title">Annual Revenue</div>
          <div class="metric-value">${formatCurrency(data.revenue)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Growth Rate</div>
          <div class="metric-value">${formatPercentage(data.growthRate)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Profit Margins</div>
          <div class="metric-value">${formatPercentage(data.margins)}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Revenue Multiple</div>
          <div class="metric-value">${data.multiplier.toFixed(1)}x</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Valuation Analysis</div>

        <div class="subsection">
          <div class="subsection-title">Methodology</div>
          <p>${data.methodology}</p>
        </div>

        <div class="subsection">
          <div class="subsection-title">Valuation Methods Comparison</div>
          <table>
            <tr>
              <th>Method</th>
              <th>Valuation</th>
            </tr>
            <tr>
              <td>DCF Analysis</td>
              <td>${formatCurrency(data.details.methods.dcf)}</td>
            </tr>
            <tr>
              <td>Market Comparables</td>
              <td>${formatCurrency(data.details.methods.comparables)}</td>
            </tr>
          </table>
        </div>

        <div class="subsection">
          <div class="subsection-title">Scenario Analysis</div>
          <div class="scenario-card">
            <table>
              <tr>
                <th>Scenario</th>
                <th>Valuation</th>
              </tr>
              <tr>
                <td>Conservative Case</td>
                <td>${formatCurrency(data.details.scenarios.worst)}</td>
              </tr>
              <tr>
                <td>Base Case</td>
                <td>${formatCurrency(data.details.scenarios.base)}</td>
              </tr>
              <tr>
                <td>Optimistic Case</td>
                <td>${formatCurrency(data.details.scenarios.best)}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      ${data.riskAssessment ? `
        <div class="section">
          <div class="section-title">Risk Assessment</div>
          <div class="metric-card">
            <div class="metric-title">Overall Risk Score</div>
            <div class="metric-value">${formatPercentage(data.riskAssessment.riskScore)}</div>
          </div>
          <table>
            <tr>
              <th>Risk Factor</th>
              <th>Impact</th>
            </tr>
            ${Object.entries(data.riskAssessment.factors)
              .map(([factor, impact]) => `
                <tr>
                  <td>${factor.replace(/([A-Z])/g, ' $1').trim()}</td>
                  <td>${impact}</td>
                </tr>
              `).join('')}
          </table>
        </div>
      ` : ''}

      <div class="footer">
        <p>This report was generated using advanced valuation methodologies, incorporating both quantitative metrics and qualitative factors. The valuation provided is an estimate based on the information provided and industry standards. It should not be considered as financial advice.</p>
        <p>Valuation Date: ${formatDate()}</p>
        <p>Currency: ${data.currency} | Industry: ${data.industry} | Stage: ${data.stage}</p>
      </div>
    </body>
    </html>
  `;
}

export async function generatePdfReport(data: ValuationData): Promise<Buffer> {
  const html = generateReportHtml(data);
  const options = {
    format: 'A4',
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    printBackground: true
  };

  try {
    const pdfBuffer = await htmlPdf.generatePdf({ content: html }, options);
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}