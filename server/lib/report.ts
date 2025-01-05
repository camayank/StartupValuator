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
      <title>Enterprise Valuation Analysis Report</title>
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
        <h1>Enterprise Valuation Analysis Report</h1>
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
          ${data.compliance ? `
            <p><strong>Compliance:</strong> This valuation adheres to ${data.compliance.standards.join(', ')} standards</p>
          ` : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Executive Summary</div>
        <p>This enterprise valuation report provides a comprehensive analysis of your company using advanced financial modeling techniques and industry-specific metrics. The valuation incorporates both quantitative data and qualitative factors to arrive at a fair market value, adhering to international valuation standards.</p>
      </div>

      <div class="section">
        <div class="section-title">Market Position & Industry Analysis</div>
        <div class="metric-card">
          <div class="metric-title">Industry Classification</div>
          <div class="metric-value">${data.industry.charAt(0).toUpperCase() + data.industry.slice(1)}</div>
        </div>
        ${data.industryBenchmarks ? `
          <div class="subsection">
            <div class="subsection-title">Industry Benchmarks</div>
            <table>
              <tr>
                <th>Metric</th>
                <th>Company</th>
                <th>Industry Average</th>
                <th>Percentile</th>
              </tr>
              <tr>
                <td>Revenue Multiple</td>
                <td>${data.multiplier.toFixed(1)}x</td>
                <td>${data.industryBenchmarks.peerComparison.revenue_multiple.toFixed(1)}x</td>
                <td>${formatPercentage(data.multiplier / data.industryBenchmarks.peerComparison.revenue_multiple * 100)}</td>
              </tr>
              <tr>
                <td>Operating Margin</td>
                <td>${formatPercentage(data.margins)}</td>
                <td>${formatPercentage(data.industryBenchmarks.peerComparison.operating_margin * 100)}</td>
                <td>${formatPercentage(data.margins / (data.industryBenchmarks.peerComparison.operating_margin * 100) * 100)}</td>
              </tr>
              <tr>
                <td>Growth Rate</td>
                <td>${formatPercentage(data.growthRate)}</td>
                <td>${formatPercentage(data.industryBenchmarks.peerComparison.growth_rate * 100)}</td>
                <td>${formatPercentage(data.growthRate / (data.industryBenchmarks.peerComparison.growth_rate * 100) * 100)}</td>
              </tr>
            </table>
          </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">Financial Analysis</div>
        <div class="subsection">
          <div class="subsection-title">Key Financial Metrics</div>
          <div class="metric-card">
            <div class="metric-title">Annual Revenue</div>
            <div class="metric-value">${formatCurrency(data.revenue)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Growth Rate</div>
            <div class="metric-value">${formatPercentage(data.growthRate)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Operating Margins</div>
            <div class="metric-value">${formatPercentage(data.margins)}</div>
          </div>
        </div>

        ${data.details.assumptions ? `
          <div class="subsection">
            <div class="subsection-title">Valuation Parameters</div>
            <table>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Impact</th>
              </tr>
              <tr>
                <td>Cost of Capital (WACC)</td>
                <td>${formatPercentage(data.details.assumptions.wacc * 100)}</td>
                <td>Primary discount rate for future cash flows</td>
              </tr>
              <tr>
                <td>Beta (Market Risk)</td>
                <td>${data.details.assumptions.beta.toFixed(2)}</td>
                <td>Measure of systematic risk relative to market</td>
              </tr>
              <tr>
                <td>Risk-Free Rate</td>
                <td>${formatPercentage(data.details.assumptions.riskFreeRate * 100)}</td>
                <td>Base rate for cost of capital calculation</td>
              </tr>
              <tr>
                <td>Market Risk Premium</td>
                <td>${formatPercentage(data.details.assumptions.marketRiskPremium * 100)}</td>
                <td>Additional return required over risk-free rate</td>
              </tr>
            </table>
          </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">Valuation Analysis</div>

        <div class="subsection">
          <div class="subsection-title">Methodology</div>
          <p>${data.methodology}</p>
          <div class="insight-box">
            <p>The valuation methodology is tailored to your company's stage, industry context, and available data, combining multiple approaches to provide a balanced and comprehensive perspective.</p>
          </div>
        </div>

        <div class="subsection">
          <div class="subsection-title">DCF Analysis</div>
          ${data.details.methods.dcf.stages ? `
            <table>
              <tr>
                <th>Year</th>
                <th>Projected Revenue</th>
                <th>Free Cash Flow</th>
                <th>Present Value</th>
              </tr>
              ${data.details.methods.dcf.stages.map(stage => `
                <tr>
                  <td>Year ${stage.year}</td>
                  <td>${formatCurrency(stage.revenue)}</td>
                  <td>${formatCurrency(stage.fcf)}</td>
                  <td>${formatCurrency(stage.presentValue)}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
        </div>

        <div class="subsection">
          <div class="subsection-title">Market Comparables Analysis</div>
          ${data.details.methods.comparables.analysis ? `
            <table>
              <tr>
                <th>Valuation Metric</th>
                <th>Multiple</th>
                <th>Implied Value</th>
              </tr>
              ${data.details.methods.comparables.analysis.map(comp => `
                <tr>
                  <td>${comp.metric}</td>
                  <td>${comp.multiple.toFixed(2)}x</td>
                  <td>${formatCurrency(comp.value)}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
        </div>

        <div class="subsection">
          <div class="subsection-title">Scenario Analysis</div>
          <div class="insight-box">
            <p>The following scenarios represent potential valuations under different market conditions and growth trajectories, incorporating both operational and market factors.</p>
          </div>
          <table>
            <tr>
              <th>Scenario</th>
              <th>Valuation</th>
              <th>Growth Rate</th>
              <th>Operating Margin</th>
            </tr>
            <tr>
              <td>Conservative Case</td>
              <td>${formatCurrency(data.details.scenarios.worst.value)}</td>
              <td>${formatPercentage(data.details.scenarios.worst.assumptions.growthRate)}</td>
              <td>${formatPercentage(data.details.scenarios.worst.assumptions.margins)}</td>
            </tr>
            <tr>
              <td>Base Case</td>
              <td>${formatCurrency(data.details.scenarios.base.value)}</td>
              <td>${formatPercentage(data.details.scenarios.base.assumptions.growthRate)}</td>
              <td>${formatPercentage(data.details.scenarios.base.assumptions.margins)}</td>
            </tr>
            <tr>
              <td>Optimistic Case</td>
              <td>${formatCurrency(data.details.scenarios.best.value)}</td>
              <td>${formatPercentage(data.details.scenarios.best.assumptions.growthRate)}</td>
              <td>${formatPercentage(data.details.scenarios.best.assumptions.margins)}</td>
            </tr>
          </table>
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
            ${Object.entries(data.riskAssessment.categories)
              .map(([category, impact]) => `
                <tr>
                  <td>${category.charAt(0).toUpperCase() + category.slice(1)}</td>
                  <td>${impact}</td>
                </tr>
              `).join('')}
          </table>
          <div class="warning-box">
            <p><strong>Key Risk Mitigation Recommendations:</strong></p>
            <ul>
              ${data.riskAssessment.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <p>This enterprise valuation report was generated using advanced financial modeling techniques and proprietary algorithms. The analysis incorporates industry standards, market conditions, and company-specific factors to provide a comprehensive valuation assessment.</p>

        <div class="disclaimer">
          <p><strong>Disclaimer:</strong> This valuation represents an estimate based on the information provided and current market conditions. It should not be considered as financial advice. Actual market values may vary based on numerous factors including market conditions, negotiation dynamics, and strategic considerations. Past performance does not guarantee future results.</p>
        </div>

        <p><strong>Report Details:</strong></p>
        <p>Generated: ${formatDate()}</p>
        <p>Currency: ${data.currency} | Industry: ${data.industry} | Stage: ${data.stage}</p>
        ${data.compliance ? `
          <p>Compliant with: ${data.compliance.standards.join(', ')}</p>
          <p>Required Disclosures: ${data.compliance.requirements.join(', ')}</p>
        ` : ''}
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