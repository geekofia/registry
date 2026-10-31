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

  it("uses ThemeProvider's default key and theme", () => {
    expect(script).toContain('var STORAGE_KEY = "theme";');
    expect(script).toContain('var DEFAULT_THEME = "system";');
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
