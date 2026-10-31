import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeOs } from "../../test/fake-os";
import script from "./theme-init.js?raw";

const root = document.documentElement;
const run = () => new Function(script)();

describe("theme-init.js", () => {
  beforeEach(() => {
    localStorage.clear();
    root.className = "";
  });
  afterEach(() => vi.restoreAllMocks());

  /** Runs it as if loaded from a <script> tag with these data- attributes. */
  const runFromTag = (data: Record<string, string>) => {
    const tag = document.createElement("script");
    Object.assign(tag.dataset, data);
    Object.defineProperty(document, "currentScript", { value: tag, configurable: true });
    try {
      run();
    } finally {
      Object.defineProperty(document, "currentScript", { value: null, configurable: true });
    }
  };

  it("reads its key and default from its script tag, else ThemeProvider's", () => {
    fakeOs(false);
    localStorage.setItem("app-theme", "dark");
    runFromTag({ storageKey: "app-theme" });
    expect(root.className).toBe("dark");

    root.className = "";
    runFromTag({ storageKey: "other", defaultTheme: "dark" });
    expect(root.className).toBe("dark");

    root.className = "";
    localStorage.setItem("theme", "dark");
    run();
    expect(root.className).toBe("dark");
  });

  it("sets the saved theme, or the OS's for System, and ignores unknown ones", () => {
    fakeOs(true);
    run();
    expect(root.className).toBe("dark");

    root.className = "";
    localStorage.setItem("theme", "light");
    run();
    expect(root.className).toBe("light");

    root.className = "";
    localStorage.setItem("theme", "purple");
    run();
    expect(root.className).toBe("dark");
  });

  it("uses the default when storage is blocked", () => {
    fakeOs(false);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    run();
    expect(root.className).toBe("light");
  });
});
