import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCursorTableParams } from "./use-cursor-table-params";
import { useDebouncedValue } from "./use-debounced-value";
import { useIsMobile, useMediaQuery } from "./use-media-query";

describe("useDebouncedValue", () => {
  it("gives the value once it has stopped changing", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: "a" },
    });
    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("abc");
    vi.useRealTimers();
  });
});

describe("useMediaQuery", () => {
  it("follows the query as it changes, and stops listening when unmounted", () => {
    let matches = false;
    const listeners = new Set<() => void>();
    window.matchMedia = vi.fn((query: string) => ({
      media: query,
      get matches() {
        return matches;
      },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    })) as unknown as typeof matchMedia;

    const { result, unmount } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");

    act(() => {
      matches = true;
      listeners.forEach((listener) => listener());
    });
    expect(result.current).toBe(true);
    unmount();
    expect(listeners.size).toBe(0);

    renderHook(() => useMediaQuery("(prefers-reduced-motion: reduce)"));
    expect(window.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
  });
});

describe("useCursorTableParams", () => {
  const withUrl = (initial: string) =>
    renderHook(() => {
      const [params, setParams] = useState(new URLSearchParams(initial));
      const table = useCursorTableParams([
        params,
        (update) => setParams((previous) => update(previous)),
      ]);
      return { table, url: params.toString() };
    });

  it("reads the URL, with defaults for what's missing or wrong", () => {
    const { result } = withUrl("search=acme&sortDirection=sideways&perPage=-3&after=c1");
    expect(result.current.table).toMatchObject({
      search: "acme",
      sortDirection: undefined,
      perPage: 20,
      after: "c1",
      before: undefined,
    });
  });

  it("pages with cursors, and goes back to the first page on a new search, sort or size", () => {
    const { result } = withUrl("search=acme");
    act(() => result.current.table.goToNextPage("end1"));
    expect(result.current.url).toBe("search=acme&after=end1");
    act(() => result.current.table.goToPreviousPage("start2"));
    expect(result.current.url).toBe("search=acme&before=start2");

    act(() => result.current.table.setSortDirection("desc"));
    expect(result.current.url).toBe("search=acme&sortDirection=desc");
    act(() => result.current.table.goToNextPage("end1"));
    act(() => result.current.table.setSearch(""));
    expect(result.current.url).toBe("sortDirection=desc");
    act(() => result.current.table.setPerPage(50));
    expect(result.current.table.perPage).toBe(50);
  });
});
