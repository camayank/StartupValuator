import htmlPdf from 'html-pdf-node';
import type { ValuationFormData } from "../../client/src/lib/validations";

function generateReportHtml(data: ValuationFormData & { 
  valuation: number;
  multiplier: number;
  methodology: string;
  confidenceScore: number;
  details: any;
  assumptions: any;
  compliance?: any;
  businessName: string;
  stage: string;
  industry: string;
  region: string;
  growthRate: number;
  margins: number;
  currency: string;
}): string {
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
      <title>Startup Valuation Analysis Report</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1000px;
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
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .subsection {
          margin: 25px 0;
        }
        .subsection-title {
          font-size: 18px;
          font-weight: bold;
          color: #374151;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          background: white;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .metric-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
        .insight-box {
          background: #f0f9ff;
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin: 20px 0;
        }
        .warning-box {
          background: #fff7ed;
          border-left: 4px solid #ea580c;
          padding: 20px;
          margin: 20px 0;
        }
        .chart-container {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          height: 300px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        .compliance-badge {
          display: inline-block;
          background: #f0fdf4;
          border: 1px solid #22c55e;
          color: #15803d;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 14px;
          margin: 4px;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 2px solid #eee;
          font-size: 12px;
          color: #6b7280;
        }
        .disclaimer {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          padding: 15px;
          margin-top: 20px;
          border-radius: 8px;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Startup Valuation Analysis Report</h1>
        <p>Generated on ${formatDate()}</p>
        ${data.compliance ? `
          <div>
            ${data.compliance.standards.map(standard => 
              `<span class="compliance-badge">${standard}</span>`
            ).join('')}
          </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="valuation">
          ${formatCurrency(data.valuation)}
        </div>
        <p>Enterprise Valuation (${data.currency})</p>
        <div class="insight-box">
          <p><strong>Confidence Score:</strong> ${data.confidenceScore}%</p>
          <p><strong>Methodology:</strong> ${data.methodology}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Executive Summary</div>
        <p>
          Based on our comprehensive analysis of ${data.businessName}, a ${data.stage} stage company 
          in the ${data.industry} sector, we estimate the enterprise value at ${formatCurrency(data.valuation)}.
          This valuation reflects the company's current financial position, market dynamics, and growth potential.
        </p>

        <div class="grid">
          <div class="metric-card">
            <div class="metric-title">Revenue Multiple</div>
            <div class="metric-value">${data.multiplier?.toFixed(1)}x</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Growth Rate</div>
            <div class="metric-value">${formatPercentage(data.growthRate || 0)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Operating Margins</div>
            <div class="metric-value">${formatPercentage(data.margins || 0)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Valuation Methodology</div>
        <p>This valuation employs a weighted average approach combining:</p>
        <div class="subsection">
          <div class="subsection-title">DCF Analysis (Present Value)</div>
          <table>
            <tr>
              <th>Year</th>
              <th>Free Cash Flow</th>
              <th>Present Value</th>
              <th>Working Capital</th>
              <th>CapEx</th>
            </tr>
            ${data.details.methods.dcf.stages.map(stage => `
              <tr>
                <td>Year ${stage.year}</td>
                <td>${formatCurrency(stage.fcf)}</td>
                <td>${formatCurrency(stage.presentValue)}</td>
                <td>${formatCurrency(stage.workingCapital)}</td>
                <td>${formatCurrency(stage.capex)}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div class="subsection">
          <div class="subsection-title">Market Comparables Analysis</div>
          <table>
            <tr>
              <th>Metric</th>
              <th>Multiple Range</th>
              <th>Selected Multiple</th>
              <th>Rationale</th>
            </tr>
            ${data.details.methods.comparables.multiples.details.map(detail => `
              <tr>
                <td>${detail.metric}</td>
                <td>${detail.range.min.toFixed(1)}x - ${detail.range.max.toFixed(1)}x</td>
                <td>${detail.selectedMultiple.toFixed(1)}x</td>
                <td>${detail.reasoning}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Scenario Analysis</div>
        <table>
          <tr>
            <th>Scenario</th>
            <th>Value</th>
            <th>Growth Rate</th>
            <th>Operating Margin</th>
            <th>Discount Rate</th>
          </tr>
          <tr>
            <td>Conservative Case</td>
            <td>${formatCurrency(data.details.scenarios.worst.value)}</td>
            <td>${formatPercentage(data.details.scenarios.worst.assumptions.growthRate)}</td>
            <td>${formatPercentage(data.details.scenarios.worst.assumptions.margins)}</td>
            <td>${formatPercentage(data.details.scenarios.worst.assumptions.discountRate * 100)}</td>
          </tr>
          <tr>
            <td>Base Case</td>
            <td>${formatCurrency(data.details.scenarios.base.value)}</td>
            <td>${formatPercentage(data.details.scenarios.base.assumptions.growthRate)}</td>
            <td>${formatPercentage(data.details.scenarios.base.assumptions.margins)}</td>
            <td>${formatPercentage(data.details.scenarios.base.assumptions.discountRate * 100)}</td>
          </tr>
          <tr>
            <td>Optimistic Case</td>
            <td>${formatCurrency(data.details.scenarios.best.value)}</td>
            <td>${formatPercentage(data.details.scenarios.best.assumptions.growthRate)}</td>
            <td>${formatPercentage(data.details.scenarios.best.assumptions.margins)}</td>
            <td>${formatPercentage(data.details.scenarios.best.assumptions.discountRate * 100)}</td>
          </tr>
        </table>

        <div class="subsection">
          <div class="subsection-title">Sensitivity Analysis</div>
          <table>
            <tr>
              <th>Factor</th>
              <th>-20%</th>
              <th>-10%</th>
              <th>Base</th>
              <th>+10%</th>
              <th>+20%</th>
            </tr>
            ${data.details.sensitivityAnalysis.map(analysis => `
              <tr>
                <td>${analysis.factor}</td>
                ${analysis.impact.map(point => 
                  `<td>${formatCurrency(point.value)}</td>`
                ).join('')}
              </tr>
            `).join('')}
          </table>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Key Assumptions</div>
        <div class="grid">
          <div class="metric-card">
            <div class="metric-title">Discount Rate (WACC)</div>
            <div class="metric-value">${formatPercentage(data.assumptions.discountRate * 100)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Terminal Growth Rate</div>
            <div class="metric-value">${formatPercentage(data.assumptions.terminalGrowthRate * 100)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Market Risk Premium</div>
            <div class="metric-value">${formatPercentage(data.assumptions.marketRiskPremium * 100)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Beta</div>
            <div class="metric-value">${data.assumptions.beta.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>This startup valuation report was generated using advanced financial modeling techniques and proprietary algorithms. 
        The analysis incorporates industry standards, market conditions, and company-specific factors to provide a comprehensive valuation assessment.</p>

        <div class="disclaimer">
          <p><strong>Disclaimer:</strong> This valuation represents an estimate based on the information provided and current market conditions. 
          It should not be considered as financial advice. Actual market values may vary based on numerous factors including market conditions, 
          negotiation dynamics, and strategic considerations. Past performance does not guarantee future results.</p>
        </div>

        <p><strong>Report Details:</strong></p>
        <p>Generated: ${formatDate()}</p>
        <p>Business Name: ${data.businessName}</p>
        <p>Industry: ${data.industry} | Stage: ${data.stage}</p>
        <p>Region: ${data.region} | Currency: ${data.currency}</p>
      </div>
    </body>
    </html>
  `;
}

export async function generatePdfReport(data: any): Promise<Buffer> {
  const html = generateReportHtml(data);
  const options = {
    format: 'A4',
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    printBackground: true,
    preferCSSPageSize: true,
  };

  try {
    const pdfBuffer = await htmlPdf.generatePdf({ content: html }, options);
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}