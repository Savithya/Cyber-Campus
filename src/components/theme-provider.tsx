"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  themes: { id: Theme; label: string; icon: string }[];
}

const THEME_STORAGE_KEY = "cc-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: "light", label: "Light", icon: "sun" },
  { id: "dark", label: "Dark", icon: "moon" },
];

export function ThemeScript() {
  const code = `(function() {
    try {
      var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
      var theme = stored;
      if (!theme || (theme !== "light" && theme !== "dark" && theme !== "cyber")) {
        theme = "light";
      }
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.classList.remove("dark", "light", "cyber");
      document.documentElement.classList.add(theme);
    } catch (e) {}
  })();`;

  return (
    <script
      id="theme-initializer"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}

function applyTheme(t: Theme | string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", t);
  root.classList.remove("dark", "light", "cyber");
  root.classList.add(t);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored && (stored === "dark" || stored === "light" || (stored as string) === "cyber")) {
        setThemeState(stored as Theme);
        applyTheme(stored);
      } else {
        // First-time visitors without a stored preference receive Light mode
        setThemeState("light");
        applyTheme("light");
      }
    } catch {
      applyTheme("light");
    }
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "light" ? "dark" : "light";

      applyTheme(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        themes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
