import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { ValuationFormData } from '@/lib/validations';
import { useQueryClient } from '@tanstack/react-query';

const AUTO_SAVE_DELAY = 2000; // 2 seconds
const STORAGE_KEY = 'valuation_form_data';

export function useFormAutoSave(formData: Partial<ValuationFormData>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        toast({
          description: 'Progress saved',
          duration: 2000,
        });
      } catch (error) {
        console.error('Failed to auto-save form:', error);
        toast({
          variant: 'destructive',
          title: 'Auto-save failed',
          description: 'Your progress could not be saved.',
        });
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, toast]);

  // Load saved data
  const loadSavedData = (): Partial<ValuationFormData> | null => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return null;

      return JSON.parse(savedData);
    } catch (error) {
      console.error('Failed to load saved form data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not recover your saved progress.',
      });
      return null;
    }
  };

  // Clear saved data
  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: ['formData'] });
      toast({
        description: 'Saved progress cleared',
      });
    } catch (error) {
      console.error('Failed to clear saved form data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not clear saved progress.',
      });
    }
  };

  return {
    loadSavedData,
    clearSavedData,
  };
}

export default useFormAutoSave;
