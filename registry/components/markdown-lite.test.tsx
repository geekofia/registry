import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownLite } from "./markdown-lite";

describe("MarkdownLite", () => {
  it("draws bold, lists and paragraphs", () => {
    render(
      <MarkdownLite text={"Intro\n\n**Steps:**\n3. Open it.\n4. Choose **Save**.\n\n- one"} />,
    );
    expect(screen.getByText("Save").tagName).toBe("STRONG");
    const [numbered, bulleted] = screen.getAllByRole("list");
    expect(numbered.tagName).toBe("OL");
    expect(numbered).toHaveAttribute("start", "3");
    expect(bulleted.tagName).toBe("UL");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("shows HTML as text, never as markup", () => {
    const { container } = render(<MarkdownLite text="<img src=x onerror=alert(1)>" />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument();
  });
});
