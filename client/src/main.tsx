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

// Hot Module Replacement with state preservation
if (import.meta.hot) {
  import.meta.hot.accept(['./App', './lib/queryClient'], (modules) => {
    const scrollY = window.scrollY;
    const formState = localStorage.getItem('formState');

    // Batch updates for smooth transitions
    setTimeout(() => {
      render();
      // Restore scroll position
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
        if (formState) {
          try {
            const state = JSON.parse(formState);
            // Dispatch event to restore form state
            window.dispatchEvent(new CustomEvent('restoreFormState', { detail: state }));
          } catch (e) {
            console.error('Failed to restore form state:', e);
          }
        }
      });
    }, 50);
  });

  // Error resilience - continue running after fixes
  import.meta.hot.on('vite:beforeUpdate', () => {
    // Save current form state before update
    const currentState = document.querySelector('form')?.elements;
    if (currentState) {
      const formData = new FormData(currentState as HTMLFormElement);
      localStorage.setItem('formState', JSON.stringify(Object.fromEntries(formData)));
    }
  });
}

// Prevent sudden page reloads
window.addEventListener('beforeunload', (e) => {
  const form = document.querySelector('form');
  if (form && form.elements.length > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});