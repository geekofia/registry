import { useEffect, useRef, useState } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { CheckIcon, XIcon } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export type Option = { id: string; label: string; description?: string };

export type AsyncMultiSelectLabels = {
  placeholder: string;
  noMatch: string;
  typeToSearch: string;
  remove: (label: string) => string;
};

const ENGLISH: AsyncMultiSelectLabels = {
  placeholder: "Search",
  noMatch: "No matches.",
  typeToSearch: "Type 2 letters to search.",
  remove: (label) => `Remove ${label}`,
};

const ALL_ID = "\u0000all";

/**
 * Choosing several options from a server search: one field, those chosen as
 * chips in it, and matches from `search` once `minQueryLength` letters are
 * typed, chosen ones ticked. Searches are debounced, and a newer one cancels
 * an older one (through `signal`). With `all`, the list starts with that
 * option, ticked while none are chosen; ticking it clears them, and choosing
 * one unticks it. Escape keeps the choice (Base UI would clear it).
 */
export function AsyncMultiSelect({
  id,
  value,
  onChange,
  search,
  all,
  minQueryLength = 2,
  debounceMs = 250,
  invalid,
  labels = ENGLISH,
}: {
  id?: string;
  value: Option[];
  onChange: (value: Option[]) => void;
  search: (query: string, signal: AbortSignal) => Promise<Option[]>;
  /** The label of an "all of them" first option, meaning none chosen. */
  all?: string;
  minQueryLength?: number;
  debounceMs?: number;
  invalid?: boolean;
  labels?: AsyncMultiSelectLabels;
}) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<{ query: string; options: Option[] }>({
    query: "",
    options: [],
  });
  const anchor = useRef<HTMLDivElement>(null);
  const term = useDebouncedValue(query.trim(), debounceMs);
  const searching = query.trim().length >= minQueryLength;

  useEffect(() => {
    if (term.length < minQueryLength) return;
    const controller = new AbortController();
    search(term, controller.signal).then(
      (options) => {
        if (!controller.signal.aborted) setFound({ query: term, options });
      },
      () => {
        // A failed or cancelled search shows no matches.
      },
    );
    return () => controller.abort();
    // `search` may not be memoized by callers; the term is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, minQueryLength]);

  const everyone = all ? { id: ALL_ID, label: all } : undefined;
  const matches = searching && found.query === query.trim() ? found.options : [];
  const items = [
    ...(everyone ? [everyone] : []),
    ...value,
    ...matches.filter((option) => !value.some((each) => each.id === option.id)),
  ];
  const selected = everyone && value.length === 0 ? [everyone] : value;

  const change = (next: Option[], details: Combobox.Root.ChangeEventDetails) => {
    // Escape would clear them all, which with `all` means everyone: keep them,
    // and let Escape reach whatever's around, e.g. a dialog.
    if (details.reason === "escape-key") {
      details.allowPropagation();
      return;
    }
    const allTicked = everyone && value.length > 0 && next.some((each) => each.id === ALL_ID);
    onChange(allTicked ? [] : next.filter((each) => each.id !== ALL_ID));
    setQuery("");
  };

  return (
    <Combobox.Root
      multiple
      items={items}
      value={selected}
      onValueChange={change}
      itemToStringLabel={(item: Option) => item.label}
      isItemEqualToValue={(item: Option, other: Option) => item.id === other.id}
      filter={null}
      inputValue={query}
      onInputValueChange={setQuery}
    >
      <Combobox.Chips
        ref={anchor}
        aria-invalid={invalid}
        className="border-input focus-within:border-ring focus-within:ring-ring/50 aria-invalid:border-destructive flex min-h-9 flex-wrap items-center gap-1.5 rounded-xl border bg-transparent px-2 py-1.5 text-sm focus-within:ring-[3px]"
      >
        <Combobox.Value>
          {(values: Option[]) => (
            <>
              {values.map((each) => (
                <Combobox.Chip
                  key={each.id}
                  className="bg-muted text-foreground flex h-6 items-center gap-1 rounded-full pr-1 pl-2.5 text-xs font-medium"
                >
                  {each.label}
                  {each.id !== ALL_ID && (
                    <Combobox.ChipRemove
                      aria-label={labels.remove(each.label)}
                      className="hover:bg-foreground/10 inline-flex size-4 items-center justify-center rounded-full opacity-60 hover:opacity-100"
                    >
                      <XIcon className="size-3" aria-hidden />
                    </Combobox.ChipRemove>
                  )}
                </Combobox.Chip>
              ))}
              <Combobox.Input
                id={id}
                aria-invalid={invalid}
                placeholder={values.length === 0 ? labels.placeholder : ""}
                className="placeholder:text-muted-foreground min-w-16 flex-1 bg-transparent px-1 outline-none"
              />
            </>
          )}
        </Combobox.Value>
      </Combobox.Chips>
      <Combobox.Portal>
        <Combobox.Positioner anchor={anchor} sideOffset={6} className="z-50">
          <Combobox.Popup className="bg-popover text-popover-foreground ring-foreground/10 max-h-(--available-height) w-(--anchor-width) overflow-hidden rounded-xl text-sm shadow-lg ring-1">
            <Combobox.Empty className="text-muted-foreground px-3 py-2 empty:hidden">
              {searching ? labels.noMatch : null}
            </Combobox.Empty>
            <Combobox.List className="max-h-72 overflow-y-auto p-1 data-empty:p-0">
              {(item: Option) => (
                <Combobox.Item
                  key={item.id}
                  value={item}
                  className="data-highlighted:bg-muted relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 outline-none select-none"
                >
                  <span className="truncate">{item.label}</span>
                  {item.description && (
                    <span className="text-muted-foreground text-xs">{item.description}</span>
                  )}
                  <Combobox.ItemIndicator className="absolute right-2">
                    <CheckIcon className="size-4" aria-hidden />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
            {!searching && (
              <p className="text-muted-foreground border-t px-3 py-2 text-xs">
                {labels.typeToSearch}
              </p>
            )}
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
