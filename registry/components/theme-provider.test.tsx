import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakeOs } from "../../test/fake-os";
import { ThemeProvider, useTheme } from "./theme-provider";

const root = document.documentElement;

const Shown = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <>
      <output>{`${theme}:${resolvedTheme}`}</output>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("system")}>System</button>
    </>
  );
};

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    root.className = "";
  });
  afterEach(() => vi.restoreAllMocks());

  it("follows the OS as it changes when the theme is System", () => {
    const os = fakeOs(false);
    render(
      <ThemeProvider>
        <Shown />
      </ThemeProvider>,
    );
    expect(root.className).toBe("light");
    expect(screen.getByRole("status")).toHaveTextContent("system:light");

    os.switchTo(true);
    expect(root.className).toBe("dark");
    expect(screen.getByRole("status")).toHaveTextContent("system:dark");
  });

  it("saves a chosen theme, ignores the OS and stops listening until System again", async () => {
    const user = userEvent.setup();
    const os = fakeOs(true);
    render(
      <ThemeProvider storageKey="app-theme">
        <Shown />
      </ThemeProvider>,
    );
    expect(os.listeners.size).toBe(1);

    await user.click(screen.getByRole("button", { name: "Light" }));
    expect(localStorage.getItem("app-theme")).toBe("light");
    expect(os.listeners.size).toBe(0);
    os.switchTo(true);
    expect(root.className).toBe("light");

    await user.click(screen.getByRole("button", { name: "System" }));
    expect(root.className).toBe("dark");
    expect(os.listeners.size).toBe(1);
  });

  it("starts from the saved theme, or the default when it's unknown", () => {
    fakeOs(false);
    localStorage.setItem("theme", "dark");
    const { unmount } = render(<ThemeProvider>app</ThemeProvider>);
    expect(root.className).toBe("dark");
    unmount();

    localStorage.setItem("theme", "purple");
    render(<ThemeProvider defaultTheme="dark">app</ThemeProvider>);
    expect(root.className).toBe("dark");
  });

  it("works when storage is blocked", async () => {
    const user = userEvent.setup();
    fakeOs(true);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(
      <ThemeProvider>
        <Shown />
      </ThemeProvider>,
    );
    expect(root.className).toBe("dark");
    await user.click(screen.getByRole("button", { name: "Light" }));
    expect(root.className).toBe("light");
  });

  it("stops listening when it goes away, and useTheme needs it", () => {
    const os = fakeOs(false);
    const { unmount } = render(<ThemeProvider>app</ThemeProvider>);
    unmount();
    expect(os.listeners.size).toBe(0);

    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Shown />)).toThrow("useTheme must be used within a ThemeProvider");
  });
});
