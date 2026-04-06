import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import themes from "../data/themes.json";

export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  border: string;
  surface: string;
  accentContrast: string;
}

export interface Theme {
  id: string;
  name: string;
  category: string;
  colors: ThemeColors;
  typography: {
    fontFamily: string;
    fontFamilyDisplay: string;
    headingWeight: number;
    bodyWeight: number;
    headingLetterSpacing: string;
    buttonTextTransform: string;
    buttonLetterSpacing: string;
    buttonWeight: number;
  };
  spacing: {
    borderRadius: string;
    borderRadiusLg: string;
    borderRadiusFull: string;
    buttonRadius: string;
  };
  effects: {
    shadow: string;
    shadowLg: string;
  };
  meta: {
    isDark: boolean;
    atmosphere: string;
  };
}

interface ThemeContextValue {
  theme: Theme;
  themes: Theme[];
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "portfolio-theme-id";
const DEFAULT_THEME_ID = "stripe";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const { colors, typography, spacing, effects, meta } = theme;

  root.style.setProperty("--color-bg", colors.background);
  root.style.setProperty("--color-bg-alt", colors.backgroundAlt);
  root.style.setProperty("--color-text", colors.text);
  root.style.setProperty("--color-text-secondary", colors.textSecondary);
  root.style.setProperty("--color-accent", colors.accent);
  root.style.setProperty("--color-accent-hover", colors.accentHover);
  root.style.setProperty("--color-border", colors.border);
  root.style.setProperty("--color-surface", colors.surface);
  root.style.setProperty("--color-accent-contrast", colors.accentContrast);

  root.style.setProperty("--font-family", typography.fontFamily);
  root.style.setProperty("--font-family-display", typography.fontFamilyDisplay);
  root.style.setProperty("--heading-weight", String(typography.headingWeight));
  root.style.setProperty("--body-weight", String(typography.bodyWeight));
  root.style.setProperty("--heading-letter-spacing", typography.headingLetterSpacing);
  root.style.setProperty("--button-letter-spacing", typography.buttonLetterSpacing);
  root.style.setProperty("--button-weight", String(typography.buttonWeight));

  root.style.setProperty("--radius", spacing.borderRadius);
  root.style.setProperty("--radius-lg", spacing.borderRadiusLg);
  root.style.setProperty("--radius-full", spacing.borderRadiusFull);
  root.style.setProperty("--radius-button", spacing.buttonRadius);

  root.style.setProperty("--shadow", effects.shadow);
  root.style.setProperty("--shadow-lg", effects.shadowLg);

  root.setAttribute("data-theme-mode", meta.isDark ? "dark" : "light");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<Theme>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    const found = (themes as Theme[]).find((t) => t.id === savedId);
    return found || (themes as Theme[]).find((t) => t.id === DEFAULT_THEME_ID) || (themes as Theme[])[0];
  });

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  const setTheme = useCallback((id: string) => {
    const found = (themes as Theme[]).find((t) => t.id === id);
    if (found) {
      setActiveTheme(found);
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, themes: themes as Theme[], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
