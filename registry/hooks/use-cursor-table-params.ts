export type SortDirection = "asc" | "desc";

/** Search params and a way to update them, as any router gives them. */
type SearchParamsState = [
  URLSearchParams,
  (update: (previous: URLSearchParams) => URLSearchParams) => void,
];

/**
 * A server-paginated, searchable, sortable table's state, kept in the URL:
 * search, sort direction, page size and a Relay-style cursor (after or
 * before). Cursors only go next or previous, so there's no page number, and
 * changing search, sort or page size goes back to the first page, as an old
 * cursor wouldn't line up with the new results.
 *
 * Pass your router's search params state, e.g. react-router's
 * `useCursorTableParams(useSearchParams())`.
 */
export function useCursorTableParams(
  [searchParams, setSearchParams]: SearchParamsState,
  { defaultPerPage = 20 }: { defaultPerPage?: number } = {},
) {
  const perPage = Number(searchParams.get("perPage"));
  const sortDirection = searchParams.get("sortDirection");

  const patch = (updates: Record<string, string | undefined>) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined) next.delete(key);
        else next.set(key, value);
      }
      return next;
    });
  const firstPage = { after: undefined, before: undefined };

  return {
    search: searchParams.get("search") ?? "",
    sortDirection:
      sortDirection === "asc" || sortDirection === "desc"
        ? (sortDirection as SortDirection)
        : undefined,
    perPage: Number.isInteger(perPage) && perPage > 0 ? perPage : defaultPerPage,
    after: searchParams.get("after") ?? undefined,
    before: searchParams.get("before") ?? undefined,

    setSearch: (value: string) => patch({ search: value || undefined, ...firstPage }),
    setSortDirection: (value: SortDirection | undefined) =>
      patch({ sortDirection: value, ...firstPage }),
    setPerPage: (value: number) => patch({ perPage: String(value), ...firstPage }),
    goToNextPage: (endCursor: string) => patch({ after: endCursor, before: undefined }),
    goToPreviousPage: (startCursor: string) => patch({ before: startCursor, after: undefined }),
  };
}
