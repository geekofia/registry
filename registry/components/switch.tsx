import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { twMerge } from "tailwind-merge";

/** An on/off switch: Base UI's, styled with shadcn's tokens; `className` wins over its own. */
export function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props & { className?: string }) {
  return (
    <SwitchPrimitive.Root
      className={twMerge(
        "peer focus-visible:ring-ring/50 data-checked:bg-primary data-unchecked:bg-input inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="bg-background pointer-events-none block size-4 rounded-full shadow-sm transition-transform data-checked:translate-x-4 data-unchecked:translate-x-0" />
    </SwitchPrimitive.Root>
  );
}
