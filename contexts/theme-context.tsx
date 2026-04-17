"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

// Theme types
export type ColorTheme = "ocean" | "sky" | "navy" | "indigo" | "royal" | "rose" | "ruby" | "sunset" | "amber" | "emerald" | "forest" | "slate";
export type ShapeStyle = "rounded" | "sharp" | "pill";
export type FontFamily = "sans" | "serif" | "mono";
export type ShadowIntensity = "subtle" | "medium" | "bold";
export type SpacingScale = "compact" | "comfortable" | "spacious";
export type FontSize = "small" | "normal" | "large";
export type AnimationSpeed = "slow" | "normal" | "fast" | "none";
export type BackgroundStyle = "clean" | "paper" | "mist" | "graphite";

export interface ThemeConfig {
  // Color theming
  color: ColorTheme;
  darkMode: boolean;

  // Shape and borders
  shape: ShapeStyle;

  // Typography
  fontFamily: FontFamily;
  fontSize: FontSize;

  // Visual depth
  shadowIntensity: ShadowIntensity;

  // Layout spacing
  spacingScale: SpacingScale;

  // Animation & Interaction
  animationSpeed: AnimationSpeed;

  // Background styling
  backgroundStyle: BackgroundStyle;

  // Additional customizations
  accentColor?: string;
  customLogo?: string;
}

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (partial: Partial<ThemeConfig>) => void;
  setColorTheme: (color: ColorTheme) => void;
  setShapeStyle: (shape: ShapeStyle) => void;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
  setShadowIntensity: (shadow: ShadowIntensity) => void;
  setSpacingScale: (spacing: SpacingScale) => void;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  setBackgroundStyle: (style: BackgroundStyle) => void;
  toggleDarkMode: () => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeConfig = {
  color: "ocean",
  darkMode: false,
  shape: "rounded",
  fontFamily: "sans",
  fontSize: "normal",
  shadowIntensity: "medium",
  spacingScale: "comfortable",
  animationSpeed: "normal",
  backgroundStyle: "clean",
  accentColor: undefined,
  customLogo: undefined,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Initialize theme from localStorage
function getInitialTheme(): ThemeConfig {
  if (typeof window === "undefined") return defaultTheme;
  try {
    const stored = localStorage.getItem("ezyschool-theme");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse stored theme", e);
  }
  return defaultTheme;
}

// Apply theme to document
function applyTheme(config: ThemeConfig) {
  const root = document.documentElement;

  // Apply color theme
  root.setAttribute("data-theme", config.color);

  // Apply shape style
  root.setAttribute("data-shape", config.shape);

  // Apply typography
  root.setAttribute("data-font-family", config.fontFamily);
  root.setAttribute("data-font-size", config.fontSize);

  // Apply visual effects
  root.setAttribute("data-shadow", config.shadowIntensity);

  // Apply spacing
  root.setAttribute("data-spacing", config.spacingScale);

  // Apply animation speed
  root.setAttribute("data-animation-speed", config.animationSpeed);

  // Apply background style
  root.setAttribute("data-background", config.backgroundStyle);

  // Apply dark mode
  if (config.darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(() => getInitialTheme());

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const updateTheme = useCallback((partial: Partial<ThemeConfig>) => {
    setTheme((prev) => {
      const newTheme = { ...prev, ...partial };
      applyTheme(newTheme);
      try {
        localStorage.setItem("ezyschool-theme", JSON.stringify(newTheme));
      } catch (e) {
        console.error("Failed to save theme", e);
      }
      return newTheme;
    });
  }, []);

  const setColorTheme = (color: ColorTheme) => {
    updateTheme({ color });
  };

  const setShapeStyle = (shape: ShapeStyle) => {
    updateTheme({ shape });
  };

  const setFontFamily = (fontFamily: FontFamily) => {
    updateTheme({ fontFamily });
  };

  const setFontSize = (fontSize: FontSize) => {
    updateTheme({ fontSize });
  };

  const setShadowIntensity = (shadowIntensity: ShadowIntensity) => {
    updateTheme({ shadowIntensity });
  };

  const setSpacingScale = (spacingScale: SpacingScale) => {
    updateTheme({ spacingScale });
  };

  const setAnimationSpeed = (animationSpeed: AnimationSpeed) => {
    updateTheme({ animationSpeed });
  };

  const setBackgroundStyle = (backgroundStyle: BackgroundStyle) => {
    updateTheme({ backgroundStyle });
  };

  const toggleDarkMode = () => {
    updateTheme({ darkMode: !theme.darkMode });
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    applyTheme(defaultTheme);
    try {
      localStorage.removeItem("ezyschool-theme");
    } catch (e) {
      console.error("Failed to clear theme", e);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        setColorTheme,
        setShapeStyle,
        setFontFamily,
        setFontSize,
        setShadowIntensity,
        setSpacingScale,
        setAnimationSpeed,
        setBackgroundStyle,
        toggleDarkMode,
        resetTheme,
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
