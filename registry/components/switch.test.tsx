import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./switch";

describe("Switch", () => {
  it("toggles, and is named by its label", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <label>
        <Switch defaultChecked onCheckedChange={change} />
        Notifications
      </label>,
    );
    const toggle = screen.getByRole("switch", { name: "Notifications" });
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(change).toHaveBeenCalledWith(false, expect.anything());
  });
});
