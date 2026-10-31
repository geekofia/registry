import { useEffect } from "react";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

declare global {
  interface Window {
    StarlightThemeProvider?: { updatePickers: (theme?: string) => void };
  }
}

const Shown = () => {
  const { theme, resolvedTheme } = useTheme();
  // Starlight's own picker shows the same setting ("system" is its "auto").
  useEffect(() => {
    window.StarlightThemeProvider?.updatePickers(theme === "system" ? "auto" : theme);
  }, [theme]);
  return (
    <div className="flex items-center gap-4 text-sm">
      <ThemeToggle />
      <span>
        Chosen: <strong>{theme}</strong>, on screen: <strong>{resolvedTheme}</strong>
      </span>
    </div>
  );
};

/** The toggle, sharing its setting with these docs' own theme picker. */
export default function ThemeDemo() {
  return (
    <ThemeProvider storageKey="starlight-theme">
      <Shown />
    </ThemeProvider>
  );
}
