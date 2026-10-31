import { Menu } from "@base-ui/react/menu";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme-provider";

const ICONS = { light: SunIcon, dark: MoonIcon, system: MonitorIcon };

export type ThemeToggleLabels = Record<Theme, string> & { toggle: string };

const ENGLISH: ThemeToggleLabels = {
  toggle: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
};

/**
 * A button showing the theme on screen, opening a menu to choose Light, Dark
 * or System. Pass `labels` to translate it.
 */
export function ThemeToggle({
  labels = ENGLISH,
  className = "",
}: {
  labels?: ThemeToggleLabels;
  className?: string;
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const Shown = resolvedTheme === "dark" ? MoonIcon : SunIcon;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={labels.toggle}
        className={`text-foreground hover:bg-muted focus-visible:ring-ring/50 data-popup-open:bg-muted inline-flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] ${className}`}
      >
        <Shown className="size-4" aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="end" className="z-50">
          <Menu.Popup className="bg-popover text-popover-foreground ring-foreground/10 min-w-36 rounded-xl p-1 text-sm shadow-lg ring-1 outline-none">
            <Menu.RadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
              {(["light", "dark", "system"] as const).map((option) => {
                const Icon = ICONS[option];
                return (
                  <Menu.RadioItem
                    key={option}
                    value={option}
                    closeOnClick
                    className="data-highlighted:bg-muted relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 outline-none select-none"
                  >
                    <Icon className="text-muted-foreground size-4" aria-hidden />
                    {labels[option]}
                    <Menu.RadioItemIndicator className="absolute right-2">
                      <CheckIcon className="size-4" aria-hidden />
                    </Menu.RadioItemIndicator>
                  </Menu.RadioItem>
                );
              })}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
