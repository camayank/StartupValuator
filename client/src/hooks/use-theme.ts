import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Theme, getSystemTheme } from "@/lib/theme";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => {
        const root = window.document.documentElement;

        // Remove existing theme classes
        root.classList.remove("light", "dark");

        // Apply the new theme
        if (theme === "system") {
          const systemTheme = getSystemTheme();
          root.classList.add(systemTheme);
        } else {
          root.classList.add(theme);
        }

        set({ theme });
      },
    }),
    {
      name: "theme",
      onRehydrateStorage: () => (state) => {
        // Ensure theme is applied after storage rehydration
        if (state) {
          state.setTheme(state.theme);
        }
      },
    }
  )
);

// Initialize theme on mount
if (typeof window !== "undefined") {
  // Get the stored theme or default to system
  const theme = useTheme.getState().theme;
  useTheme.getState().setTheme(theme);

  // Watch system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", () => {
    const currentTheme = useTheme.getState().theme;
    if (currentTheme === "system") {
      useTheme.getState().setTheme("system");
    }
  });
}