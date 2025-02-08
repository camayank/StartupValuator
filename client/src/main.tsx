import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { setupErrorMonitoring } from "./lib/error-monitoring";
import App from './App';
import "./index.css";

// Initialize error monitoring
setupErrorMonitoring();

const root = createRoot(document.getElementById("root")!);

function render() {
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
}

render();

// Enhanced Hot Module Replacement
if (import.meta.hot) {
  import.meta.hot.accept(['./App'], () => {
    requestAnimationFrame(() => {
      render();
    });
  });

  // Error recovery
  import.meta.hot.on('vite:error', (error) => {
    console.error('HMR Error:', error);
    // Only reload on syntax errors
    if (error.message?.includes('syntax error')) {
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