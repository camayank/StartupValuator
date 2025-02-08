import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { setupErrorMonitoring } from "./lib/error-monitoring";
import App from './App';
import "./index.css";

// Initialize error monitoring
setupErrorMonitoring();

const root = createRoot(document.getElementById("root")!);

// Store UI state before HMR updates
let uiState = {
  scrollPosition: 0,
  formData: null as Record<string, any> | null,
  selectedTab: null as string | null
};

function saveUIState() {
  uiState = {
    scrollPosition: window.scrollY,
    formData: document.querySelector('form') 
      ? Object.fromEntries(new FormData(document.querySelector('form') as HTMLFormElement))
      : null,
    selectedTab: localStorage.getItem('selectedTab')
  };
}

function restoreUIState() {
  if (uiState.scrollPosition) {
    window.scrollTo(0, uiState.scrollPosition);
  }

  if (uiState.formData) {
    window.dispatchEvent(new CustomEvent('restoreFormState', { 
      detail: uiState.formData 
    }));
  }

  if (uiState.selectedTab) {
    window.dispatchEvent(new CustomEvent('restoreTabState', { 
      detail: uiState.selectedTab 
    }));
  }
}

function render() {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
      </QueryClientProvider>
    </StrictMode>
  );
}

render();

// Enhanced Hot Module Replacement
if (import.meta.hot) {
  // Save state before updates
  import.meta.hot.on('vite:beforeUpdate', () => {
    saveUIState();
  });

  // Handle module updates
  import.meta.hot.accept(['./App', './lib/queryClient'], (modules) => {
    requestAnimationFrame(() => {
      render();
      // Restore UI state after re-render
      setTimeout(restoreUIState, 50);
    });
  });

  // Error recovery
  import.meta.hot.on('vite:error', (error) => {
    console.error('HMR Error:', error);
    // Attempt recovery by full page reload if needed
    if (error.message.includes('syntax error')) {
      window.location.reload();
    }
  });
}

// Prevent accidental navigation with unsaved changes
window.addEventListener('beforeunload', (e) => {
  const form = document.querySelector('form');
  if (form?.querySelector('[data-dirty="true"]')) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// Listen for form state restore events
window.addEventListener('restoreFormState', ((e: CustomEvent) => {
  const form = document.querySelector('form');
  if (form && e.detail) {
    Object.entries(e.detail).forEach(([name, value]) => {
      const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
      if (input) {
        input.value = value as string;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
}) as EventListener);