import { useCallback, useEffect, useState } from "react";

/**
 * Light / dark theming.
 *
 * The choice is written to `data-theme` on <html>, which is all any component
 * needs — every colour in the app resolves through CSS variables keyed off
 * that attribute (see index.css).
 *
 * "system" is a real third state, not a synonym for a default: it keeps
 * following the OS as it changes (macOS/Windows flipping at sunset) instead of
 * freezing whatever the OS happened to say on first load.
 */

export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE = "studyquest.theme";

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(STORAGE);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* private mode */
  }
  return "dark"; // the app was designed dark-first; keep that as the default
}

function systemTheme(): ResolvedTheme {
  return typeof matchMedia === "function" &&
    matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function resolveTheme(pref: ThemePref): ResolvedTheme {
  return pref === "system" ? systemTheme() : pref;
}

/** Apply immediately, outside React, so the first paint is already correct. */
export function applyTheme(pref: ThemePref) {
  document.documentElement.setAttribute("data-theme", resolveTheme(pref));
}

export function useTheme() {
  const [pref, setPrefState] = useState<ThemePref>(readPref);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readPref()));

  useEffect(() => {
    const next = resolveTheme(pref);
    setResolved(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE, pref);
    } catch {
      /* private mode */
    }
  }, [pref]);

  // Keep following the OS while on "system".
  useEffect(() => {
    if (pref !== "system" || typeof matchMedia !== "function") return;
    const mq = matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const next = systemTheme();
      setResolved(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const setPref = useCallback((p: ThemePref) => setPrefState(p), []);

  /** Flip to the opposite of what's on screen right now. */
  const toggle = useCallback(() => {
    setPrefState(resolveTheme(readPref()) === "light" ? "dark" : "light");
  }, []);

  return { pref, resolved, setPref, toggle };
}
