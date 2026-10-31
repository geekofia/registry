import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeState = {
  /** What was chosen: light, dark, or the system's. */
  theme: Theme;
  /** What's on screen now: System resolved to light or dark. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const THEMES: readonly string[] = ["light", "dark", "system"];
const DARK = "(prefers-color-scheme: dark)";

const ThemeContext = createContext<ThemeState | null>(null);

/** The saved theme, or the default if there's none, it's unknown, or storage is blocked. */
function savedTheme(storageKey: string, defaultTheme: Theme): Theme {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved && THEMES.includes(saved) ? (saved as Theme) : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

const systemIsDark = () => window.matchMedia(DARK).matches;

/**
 * Light, dark, or the system's, as a `light` or `dark` class on <html>, saved
 * in localStorage under `storageKey`. System follows the OS as it changes.
 * Pair it with theme-init.js (same key and default) so a dark theme doesn't
 * flash light before React runs.
 */
export function ThemeProvider({
  children,
  storageKey = "theme",
  defaultTheme = "system",
}: {
  children: ReactNode;
  storageKey?: string;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(() => savedTheme(storageKey, defaultTheme));
  // The OS's scheme, listened to only while System is chosen.
  const subscribe = useCallback(
    (notify: () => void) => {
      if (theme !== "system") return () => {};
      const media = window.matchMedia(DARK);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    [theme],
  );
  const systemDark = useSyncExternalStore(subscribe, systemIsDark, () => false);
  const resolvedTheme: ResolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (next: Theme) => {
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // Storage blocked: the choice lasts until the page is closed.
    }
    setThemeState(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** The theme chosen, what's on screen, and a way to change it. */
export function useTheme(): ThemeState {
  const state = useContext(ThemeContext);
  if (!state) throw new Error("useTheme must be used within a ThemeProvider");
  return state;
}
