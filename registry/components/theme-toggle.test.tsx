import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fakeOs } from "../../test/fake-os";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

const root = document.documentElement;

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    root.className = "";
  });

  it("opens a menu of Light, Dark and System, with the chosen one ticked", async () => {
    const user = userEvent.setup();
    fakeOs(false);
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Theme" }));
    const options = await screen.findAllByRole("menuitemradio");
    expect(options.map((option) => option.textContent)).toEqual(["Light", "Dark", "System"]);
    expect(screen.getByRole("menuitemradio", { name: "System" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await user.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(root.className).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("lets classNames win over its own", () => {
    fakeOs(false);
    render(
      <ThemeProvider>
        <ThemeToggle classNames={{ trigger: "size-8 rounded-md" }} />
      </ThemeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Theme" });
    expect(trigger).toHaveClass("size-8", "rounded-md");
    expect(trigger).not.toHaveClass("size-9");
  });

  it("takes translated labels", async () => {
    const user = userEvent.setup();
    fakeOs(false);
    render(
      <ThemeProvider>
        <ThemeToggle
          labels={{ toggle: "Thème", light: "Clair", dark: "Sombre", system: "Système" }}
        />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Thème" }));
    expect(await screen.findByRole("menuitemradio", { name: "Sombre" })).toBeInTheDocument();
  });
});
