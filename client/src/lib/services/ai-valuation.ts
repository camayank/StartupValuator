import { type ValuationFormData } from '../validations';
import axios from 'axios';

interface AIValuationResponse {
  valuation: number;
  rationale: string;
  confidenceScore: number;
  recommendations: string[];
}

export class AIValuationService {
  async generateValuation(data: ValuationFormData): Promise<AIValuationResponse> {
    try {
      const response = await axios.post('/api/ai-valuation', data);
      return response.data;
    } catch (error) {
      console.error('AI Valuation Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate AI-powered valuation');
    }
  }
}

export const aiValuationService = new AIValuationService();