import { act } from "@testing-library/react";
import { vi } from "vitest";

/** A fake OS colour scheme that can change, and the listeners waiting on it. */
export function fakeOs(dark: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const media = {
    get matches() {
      return dark;
    },
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
      listeners.delete(listener),
  };
  window.matchMedia = vi.fn().mockReturnValue(media) as unknown as typeof matchMedia;
  return {
    listeners,
    switchTo(next: boolean) {
      dark = next;
      act(() =>
        listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent)),
      );
    },
  };
}
