# DCF Valuation API Documentation

## Overview

The DCF (Discounted Cash Flow) valuation endpoint provides a comprehensive valuation for Indian startups using the DCF methodology. This method is most suitable for startups with established revenue and predictable growth patterns.

## Endpoint

```
POST /api/valuation/dcf
```

## Request

### Headers

```
Content-Type: application/json
```

### Request Body

```typescript
{
  // Required fields
  revenue: number;           // Current annual revenue in INR
  growthRate: number;        // Expected annual growth rate (e.g., 0.5 for 50%)

  // Optional but recommended
  sector?: string;           // e.g., "saas", "fintech", "ecommerce", "edtech"
  stage?: string;            // e.g., "pre-seed", "seed", "series-a", "series-b"
  burnRate?: number;         // Monthly burn rate in INR
  runway?: number;           // Months of runway remaining

  // Additional context (optional)
  companyName?: string;
  location?: string;
  margins?: number;
  arr?: number;              // Annual Recurring Revenue (for SaaS)
}
```

### Example Request

```json
{
  "companyName": "TechStartup India",
  "sector": "saas",
  "stage": "series-a",
  "revenue": 25000000,
  "growthRate": 1.2,
  "burnRate": 1500000,
  "runway": 18,
  "location": "Bangalore"
}
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "method": "DCF",
  "result": {
    "valuation": 450000000,
    "enterpriseValue": 455000000,
    "equityValue": 482000000,
    "methodology": "DCF",
    "confidenceScore": 75,
    "assumptions": {
      "wacc": 0.18,
      "terminalGrowthRate": 0.04,
      "projectionYears": 5,
      "grossMargin": 0.70,
      "taxRate": 0.25
    },
    "projections": {
      "fcf": [15000000, 28500000, 45200000, 67800000, 99500000],
      "revenue": [55000000, 121000000, 266200000, 585640000, 1288408000],
      "discountFactors": [0.8475, 0.7181, 0.6086, 0.5158, 0.4371],
      "discountedFCF": [12712500, 20476500, 27508720, 34976640, 43483450]
    },
    "terminalValue": 2075000000,
    "pvTerminalValue": 907047500,
    "presentValueFCF": 139157810,
    "ranges": {
      "conservative": 315000000,
      "base": 450000000,
      "aggressive": 585000000
    },
    "insights": [
      "✅ Strong cash flow generation projected in upcoming years",
      "🚀 Exceptional growth rate - ensure scalable infrastructure to support expansion",
      "⚠️ High risk premium applied - reducing execution risk can significantly boost valuation"
    ]
  },
  "timestamp": "2025-11-08T10:30:00.000Z"
}
```

### Error Responses

#### 400 Bad Request - Invalid Input

```json
{
  "error": "Invalid input for DCF valuation",
  "details": [
    "Revenue must be greater than 0 for DCF valuation",
    "Growth rate must be greater than 0"
  ]
}
```

#### 500 Internal Server Error

```json
{
  "error": "Failed to calculate DCF valuation",
  "message": "Detailed error message"
}
```

## Field Descriptions

### Input Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| revenue | number | Yes | Current annual revenue in INR | 25000000 (₹2.5Cr) |
| growthRate | number | Yes | Expected annual growth rate as decimal | 1.2 (120%) |
| sector | string | No | Business sector/industry | "saas", "fintech" |
| stage | string | No | Funding stage | "seed", "series-a" |
| burnRate | number | No | Monthly cash burn in INR | 1500000 (₹15L) |
| runway | number | No | Months of runway | 18 |

### Output Fields

| Field | Type | Description |
|-------|------|-------------|
| valuation | number | Final DCF valuation (INR) |
| enterpriseValue | number | Total enterprise value (INR) |
| equityValue | number | Equity value before adjustments (INR) |
| confidenceScore | number | Confidence score (0-100) |
| wacc | number | Weighted Average Cost of Capital |
| terminalGrowthRate | number | Perpetual growth rate used |
| fcf | number[] | Free cash flow projections (5 years) |
| revenue | number[] | Revenue projections (5 years) |

## Sector-Specific Parameters

The DCF model uses sector-specific parameters for Indian startups:

| Sector | Discount Rate | Terminal Growth | Typical Margin |
|--------|---------------|-----------------|----------------|
| SaaS | 18% | 4% | 70% |
| Enterprise | 16% | 3.5% | 60% |
| E-commerce | 20% | 4.5% | 35% |
| Fintech | 17% | 5% | 65% |
| Edtech | 19% | 4% | 55% |
| Healthtech | 17% | 4.5% | 50% |
| D2C | 19% | 4% | 40% |

## Stage-Based Risk Adjustments

Different funding stages have different risk profiles:

| Stage | Risk Multiplier | Confidence Discount |
|-------|----------------|---------------------|
| Pre-seed | 1.5x | 30% |
| Seed | 1.3x | 20% |
| Series A | 1.15x | 10% |
| Series B | 1.05x | 5% |
| Series C+ | 1.0x | 0% |

## Use Cases

### 1. Revenue-Stage Startups

**Best for:** Startups with ₹10L+ annual revenue

```bash
curl -X POST https://your-domain.com/api/valuation/dcf \
  -H "Content-Type: application/json" \
  -d '{
    "revenue": 5000000,
    "growthRate": 0.8,
    "sector": "saas",
    "stage": "seed"
  }'
```

### 2. Series A+ Companies

**Best for:** Companies with established revenue and growth metrics

```bash
curl -X POST https://your-domain.com/api/valuation/dcf \
  -H "Content-Type: application/json" \
  -d '{
    "revenue": 50000000,
    "growthRate": 1.0,
    "sector": "fintech",
    "stage": "series-a",
    "burnRate": 3000000,
    "runway": 24,
    "arr": 60000000
  }'
```

## Interpretation Guide

### Confidence Score

- **80-95:** Very High - Strong financials, mature stage
- **65-79:** High - Good revenue traction, reasonable assumptions
- **50-64:** Medium - Early stage with some uncertainty
- **30-49:** Low - Pre-revenue or highly speculative

### Valuation Ranges

- **Conservative (70%):** Downside scenario
- **Base (100%):** Most likely scenario
- **Aggressive (130%):** Upside scenario

## Limitations

The DCF method is **NOT suitable** for:

1. ❌ Pre-revenue startups (use Berkus or Scorecard instead)
2. ❌ Startups with negative/unstable cash flows
3. ❌ Very early-stage companies (pre-product)
4. ❌ Companies with unpredictable revenue patterns

## Best Practices

### ✅ Do:
- Provide realistic growth rates based on historical data
- Include burn rate and runway for more accurate cash analysis
- Use sector-specific classifications for better accuracy
- Consider the confidence score when presenting valuations

### ❌ Don't:
- Use for pre-revenue startups
- Input unrealistic growth rates (>500%)
- Ignore the confidence score
- Rely solely on DCF - combine with other methods

## Integration Example (JavaScript/TypeScript)

```typescript
async function getDCFValuation(companyData: {
  revenue: number;
  growthRate: number;
  sector: string;
  stage: string;
}) {
  const response = await fetch('/api/valuation/dcf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(companyData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const { result } = await response.json();
  return result;
}

// Usage
const valuation = await getDCFValuation({
  revenue: 25000000,  // ₹2.5Cr
  growthRate: 1.2,     // 120%
  sector: 'saas',
  stage: 'series-a',
});

console.log(`Valuation: ₹${(valuation.valuation / 10000000).toFixed(1)}Cr`);
console.log(`Confidence: ${valuation.confidenceScore}%`);
```

## Support

For issues or questions about the DCF API:
- Review this documentation
- Check input validation requirements
- Ensure revenue and growth rate are realistic values
- Consider using alternative methods (Berkus, Scorecard) for pre-revenue startups

## Changelog

### Version 1.0 (November 2025)
- Initial DCF implementation
- Indian market-specific parameters
- Sector and stage-based adjustments
- Comprehensive projections and insights
