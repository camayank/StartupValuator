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
        root.classList.remove("light", "dark");

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
    }
  )
);

// Initialize theme
if (typeof window !== "undefined") {
  const theme = useTheme.getState().theme;
  useTheme.getState().setTheme(theme);

  // Watch system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", () => {
    if (theme === "system") {
      useTheme.getState().setTheme("system");
    }
  });
}
