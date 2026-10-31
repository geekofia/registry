import { useState } from "react";
import { useCursorTableParams } from "@/hooks/use-cursor-table-params";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useIsMobile, useMediaQuery } from "@/hooks/use-media-query";

const BOX = "border-input h-9 rounded-xl border bg-transparent px-3 text-sm outline-none";
const BUTTON = "rounded-lg border px-3 py-1 text-xs font-medium";

export function DebouncedValueDemo() {
  const [text, setText] = useState("");
  const debounced = useDebouncedValue(text, 500);
  return (
    <div className="flex flex-col gap-2 text-sm">
      <input
        aria-label="Type"
        className={BOX}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Type quickly"
      />
      <span>
        Debounced (500 ms): <strong>{debounced || "…"}</strong>
      </span>
    </div>
  );
}

export function MediaQueryDemo() {
  const mobile = useIsMobile();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  return (
    <ul className="flex flex-col gap-1 text-sm">
      <li>
        useIsMobile(): <strong>{String(mobile)}</strong> (resize the window)
      </li>
      <li>
        (prefers-reduced-motion: reduce): <strong>{String(reduced)}</strong>
      </li>
      <li>
        (prefers-color-scheme: dark): <strong>{String(dark)}</strong>
      </li>
    </ul>
  );
}

/** The params in a pretend URL, as a router would keep them. */
export function CursorTableParamsDemo() {
  const [params, setParams] = useState(new URLSearchParams());
  const table = useCursorTableParams([
    params,
    (update) => setParams((previous) => update(previous)),
  ]);
  return (
    <div className="flex flex-col gap-3 text-sm">
      <input
        aria-label="Search"
        className={BOX}
        value={table.search}
        onChange={(event) => table.setSearch(event.target.value)}
        placeholder="Search"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={BUTTON}
          onClick={() => table.setSortDirection(table.sortDirection === "asc" ? "desc" : "asc")}
        >
          Sort {table.sortDirection === "asc" ? "descending" : "ascending"}
        </button>
        <button type="button" className={BUTTON} onClick={() => table.goToNextPage("cursor-123")}>
          Next page
        </button>
        <button
          type="button"
          className={BUTTON}
          onClick={() => table.goToPreviousPage("cursor-100")}
        >
          Previous page
        </button>
        <button type="button" className={BUTTON} onClick={() => table.setPerPage(50)}>
          50 per page
        </button>
      </div>
      <code className="bg-muted rounded-lg px-3 py-2 text-xs">?{params.toString()}</code>
    </div>
  );
}
