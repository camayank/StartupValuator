// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import OpenAI from "openai";
import type { ComplianceCheckData } from "../../client/src/lib/validations";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateComplianceReport(data: ComplianceCheckData) {
  const prompt = `As a compliance expert, analyze this startup's regulatory requirements based on the following information:

Industry: ${data.industry}
Region: ${data.region}
Company Size: ${data.companySize}
Handles Personal Data: ${data.hasPersonalData}
Handles Financial Data: ${data.hasFinancialData}
International Operations: ${data.operatesInternationally}
Has Sensitive Data: ${data.hasSensitiveData}
Annual Revenue: ${data.annualRevenue}
Funding Stage: ${data.fundingStage}

Provide a comprehensive compliance analysis in JSON format with the following structure:
{
  "summary": "Overview of compliance status",
  "riskLevel": "low|medium|high",
  "requirements": {
    "data_protection": {
      "name": "Data Protection & Privacy",
      "compliant": boolean,
      "description": "Relevant regulations and requirements",
      "recommendations": "Steps to achieve/maintain compliance"
    },
    "financial_regulations": {
      "name": "Financial Regulations",
      "compliant": boolean,
      "description": "Applicable financial regulations",
      "recommendations": "Compliance steps and requirements"
    },
    "international_compliance": {
      "name": "International Business Compliance",
      "compliant": boolean,
      "description": "Cross-border regulations",
      "recommendations": "Required actions for international compliance"
    },
    "industry_specific": {
      "name": "Industry-Specific Regulations",
      "compliant": boolean,
      "description": "Sector-specific requirements",
      "recommendations": "Industry compliance guidelines"
    },
    "operational_compliance": {
      "name": "Operational Compliance",
      "compliant": boolean,
      "description": "Business operation requirements",
      "recommendations": "Operational compliance measures"
    }
  }
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert compliance consultant who provides detailed regulatory analysis for startups.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateComplianceChecklist(industry: string, region: string) {
  const prompt = `Create a compliance checklist for a ${industry} startup operating in ${region}. 
  Include key regulations, required documentation, and important deadlines in JSON format.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a compliance expert creating actionable checklists for startup founders.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
}
