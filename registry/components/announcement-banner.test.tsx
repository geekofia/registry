import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Announcement } from "./announcement-banner";

const LONG =
  "EaseHR asks for a code.\n\n**Set it up:**\n1. Open your name.\n2. Choose **Security**.";

describe("Announcement", () => {
  it("puts the title on its own line, and folds a long banner until Show more", async () => {
    const user = userEvent.setup();
    render(<Announcement title="Authenticators" body={LONG} />);

    expect(screen.getByText("Authenticators")).toHaveClass("font-semibold");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).not.toHaveTextContent("**");
    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Security").tagName).toBe("STRONG");
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("shows a notice in full, and a short banner without Show more", () => {
    const { unmount } = render(<Announcement variant="notice" body={LONG} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    unmount();
    render(<Announcement body="Down 2-3 am." />);
    expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
  });

  it("gives each tone its colour and icon, an unknown one info's, and Close only when dismissible", async () => {
    const user = userEvent.setup();
    const dismiss = vi.fn();
    render(
      <>
        <Announcement tone="success" body="Live." onDismiss={dismiss} />
        <Announcement tone="purple" body="Odd." />
      </>,
    );
    const [success, unknown] = screen.getAllByRole("status");
    expect(success).toHaveClass("bg-emerald-500/10");
    expect(success.querySelector("svg")).toHaveClass("lucide-circle-check");
    expect(unknown).toHaveClass("bg-sky-500/10");

    expect(screen.getAllByRole("button", { name: "Close" })).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(dismiss).toHaveBeenCalled();
  });
});
