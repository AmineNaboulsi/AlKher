"use client";

import { createContext, useContext } from "react";
import { STORE_THEME } from "@/lib/site-config";
import type { Theme } from "@/lib/theme";

const ThemeContext = createContext<Theme>(STORE_THEME);

/**
 * Makes the resolved theme readable from Client Components.
 *
 * Almost nothing needs this — the palette travels through CSS variables, so a
 * component styled with `bg-surface` is already correct on both grounds. It
 * exists for the handful of places that must choose a *different asset* rather
 * than a different colour: the packshot plates are rendered twice, once graded
 * for each ground, and only one of them should be downloaded.
 */
export function ThemeProvider({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
