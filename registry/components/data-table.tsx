import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export const dataTableFeatures = tableFeatures({ rowSortingFeature });

export type DataTableColumn<TData extends RowData> = ColumnDef<
  typeof dataTableFeatures,
  TData,
  unknown
>;

export type DataTableLabels = {
  loading: string;
  error: string;
  previous: string;
  next: string;
};

const ENGLISH: DataTableLabels = {
  loading: "Loading…",
  error: "Couldn't load this.",
  previous: "Previous",
  next: "Next",
};

/** Classes for its parts, winning over its own. */
export type DataTableClassNames = {
  search?: string;
  frame?: string;
  head?: string;
  cell?: string;
  pageButton?: string;
};

/** A column's own class, from `meta: { className }`, e.g. "hidden md:table-cell". */
const columnClassName = (columnDef: { meta?: unknown }) =>
  (columnDef.meta as { className?: string } | undefined)?.className ?? "";

const INTERACTIVE = "a, button, input, select, textarea, [role='menuitem']";
const CELL = "px-3 py-2.5 align-middle";
const PAGE =
  "border-input hover:bg-muted inline-flex h-8 items-center gap-1 rounded-lg border px-3 text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 pointer-coarse:h-10";

/**
 * A table whose rows come from a server: search, sorting and pages are the
 * caller's (kept in the URL with use-cursor-table-params, say), and pages go
 * next and previous, as with cursor pagination. Search is debounced; columns
 * are TanStack Table's, with `meta: { className }` to hide one on a phone.
 * `onRowClick` makes rows clickable; give each a real link too, for keyboards.
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  isError = false,
  search,
  searchPlaceholder,
  onSearchChange,
  filters,
  sorting,
  onSortingChange,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  emptyMessage,
  onRowClick,
  labels = ENGLISH,
  classNames = {},
}: {
  columns: DataTableColumn<TData>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  search: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  /** Beside the search, e.g. a filter. */
  filters?: ReactNode;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  emptyMessage: string;
  onRowClick?: (row: TData) => void;
  labels?: DataTableLabels;
  classNames?: DataTableClassNames;
}) {
  const [searchInput, setSearchInput] = useState(search);
  const [committedSearch, setCommittedSearch] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const firstRender = useRef(true);

  // Follows the caller's search when it changes from outside (the URL, Back),
  // adjusting state during render rather than in an effect.
  if (search !== committedSearch) {
    setCommittedSearch(search);
    setSearchInput(search);
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    onSearchChange(debouncedSearch);
    // onSearchChange may not be memoized by callers; the debounced value is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    state: { sorting },
    manualSorting: true,
    onSortingChange: (updater) =>
      onSortingChange(typeof updater === "function" ? updater(sorting) : updater),
  });
  const rows = table.getRowModel().rows;

  const message = (text: string) => (
    <tr>
      <td colSpan={columns.length} className="text-muted-foreground h-24 text-center">
        {text}
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className={twMerge(
            "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-xl border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] sm:max-w-sm pointer-coarse:h-11",
            classNames.search,
          )}
        />
        {filters}
      </div>

      <div className={twMerge("overflow-x-auto rounded-lg border", classNames.frame)}>
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const column = header.column;
                  const className = twMerge(
                    "text-muted-foreground h-10 px-3 text-left align-middle font-medium whitespace-nowrap",
                    classNames.head,
                    columnClassName(column.columnDef),
                  );
                  if (header.isPlaceholder) return <th key={header.id} className={className} />;
                  if (!column.getCanSort()) {
                    return (
                      <th key={header.id} className={className}>
                        <table.FlexRender header={header} />
                      </th>
                    );
                  }
                  const direction = column.getIsSorted();
                  const Sort =
                    direction === "asc"
                      ? ArrowUpIcon
                      : direction === "desc"
                        ? ArrowDownIcon
                        : ArrowUpDownIcon;
                  return (
                    <th
                      key={header.id}
                      className={className}
                      aria-sort={
                        direction === "asc"
                          ? "ascending"
                          : direction === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      <button
                        type="button"
                        onClick={column.getToggleSortingHandler()}
                        className="hover:text-foreground flex items-center gap-1.5 select-none"
                      >
                        <table.FlexRender header={header} />
                        <Sort className={`size-3.5 ${direction ? "" : "opacity-60"}`} aria-hidden />
                      </button>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {isLoading
              ? message(labels.loading)
              : isError
                ? message(labels.error)
                : rows.length === 0
                  ? message(emptyMessage)
                  : rows.map((row) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-muted/50 border-b transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                        onClick={
                          onRowClick
                            ? (event) => {
                                // Links, buttons and (portalled) menu items in a row act on their own.
                                if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
                                onRowClick(row.original);
                              }
                            : undefined
                        }
                      >
                        {row.getAllCells().map((cell) => (
                          <td
                            key={cell.id}
                            className={twMerge(
                              CELL,
                              classNames.cell,
                              columnClassName(cell.column.columnDef),
                            )}
                          >
                            <table.FlexRender cell={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          className={twMerge(PAGE, classNames.pageButton)}
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
        >
          <ChevronLeftIcon aria-hidden />
          {labels.previous}
        </button>
        <button
          type="button"
          className={twMerge(PAGE, classNames.pageButton)}
          onClick={onNextPage}
          disabled={!hasNextPage}
        >
          {labels.next}
          <ChevronRightIcon aria-hidden />
        </button>
      </div>
    </div>
  );
}
