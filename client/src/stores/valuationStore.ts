import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ValuationFormData } from '@/lib/validations';

export interface ValuationStep {
  id: string;
  title: string;
  completed: boolean;
  data: any;
  errors?: Record<string, string>;
}

interface ValuationState {
  // Current state
  currentStep: number;
  steps: ValuationStep[];
  formData: Partial<ValuationFormData>;
  
  // Session management
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Calculated values
  valuation: number | null;
  confidence: number | null;
  
  // Actions
  setCurrentStep: (step: number) => void;
  updateStepData: (stepId: string, data: any) => void;
  markStepComplete: (stepId: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  saveToBackend: () => Promise<void>;
  loadFromBackend: (sessionId: string) => Promise<void>;
  reset: () => void;
  calculateProgress: () => number;
}

const initialSteps: ValuationStep[] = [
  {
    id: 'businessInfo',
    title: 'Business Information',
    completed: false,
    data: {}
  },
  {
    id: 'financialMetrics',
    title: 'Financial Metrics',
    completed: false,
    data: {}
  },
  {
    id: 'marketAnalysis',
    title: 'Market Analysis',
    completed: false,
    data: {}
  },
  {
    id: 'riskAssessment',
    title: 'Risk Assessment',
    completed: false,
    data: {}
  },
  {
    id: 'valuation',
    title: 'Valuation Results',
    completed: false,
    data: {}
  }
];

export const useValuationStore = create<ValuationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentStep: 0,
        steps: initialSteps,
        formData: {},
        sessionId: null,
        isLoading: false,
        error: null,
        valuation: null,
        confidence: null,

        // Actions
        setCurrentStep: (step: number) => {
          set({ currentStep: step, error: null });
        },

        updateStepData: (stepId: string, data: any) => {
          const state = get();
          const updatedSteps = state.steps.map(step => 
            step.id === stepId 
              ? { ...step, data: { ...step.data, ...data }, errors: undefined }
              : step
          );
          
          set({ 
            steps: updatedSteps,
            formData: { ...state.formData, [stepId]: data },
            error: null
          });
        },

        markStepComplete: (stepId: string) => {
          const state = get();
          const updatedSteps = state.steps.map(step => 
            step.id === stepId ? { ...step, completed: true } : step
          );
          set({ steps: updatedSteps });
        },

        setError: (error: string | null) => {
          set({ error, isLoading: false });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading, error: null });
        },

        saveToBackend: async () => {
          const state = get();
          set({ isLoading: true, error: null });

          try {
            const response = await fetch('/api/valuation/draft', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId: state.sessionId,
                formData: state.formData,
                steps: state.steps,
                currentStep: state.currentStep
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            set({ 
              sessionId: result.sessionId,
              isLoading: false 
            });
          } catch (error) {
            console.error('Failed to save to backend:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to save data',
              isLoading: false 
            });
          }
        },

        loadFromBackend: async (sessionId: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await fetch(`/api/valuation/draft/${sessionId}`);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            set({
              sessionId: result.sessionId,
              formData: result.formData || {},
              steps: result.steps || initialSteps,
              currentStep: result.currentStep || 0,
              valuation: result.valuation,
              confidence: result.confidence,
              isLoading: false
            });
          } catch (error) {
            console.error('Failed to load from backend:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load data',
              isLoading: false 
            });
          }
        },

        reset: () => {
          set({
            currentStep: 0,
            steps: initialSteps,
            formData: {},
            sessionId: null,
            isLoading: false,
            error: null,
            valuation: null,
            confidence: null
          });
        },

        calculateProgress: () => {
          const state = get();
          const completedSteps = state.steps.filter(step => step.completed).length;
          return (completedSteps / state.steps.length) * 100;
        }
      }),
      {
        name: 'valuation-store',
        partialize: (state) => ({
          formData: state.formData,
          steps: state.steps,
          currentStep: state.currentStep,
          sessionId: state.sessionId
        })
      }
    ),
    { name: 'ValuationStore' }
  )
);