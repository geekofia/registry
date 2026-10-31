import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkdownEditor } from "./markdown-editor";

const Editor = ({ withTitle = false }: { withTitle?: boolean }) => {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  return (
    <MarkdownEditor
      value={value}
      onChange={setValue}
      title={title}
      onTitleChange={withTitle ? setTitle : undefined}
      maxLength={100}
      toolbar={<button type="button">Extra</button>}
      footer={`${100 - value.length} left`}
    />
  );
};

describe("MarkdownEditor", () => {
  it("bolds and lists the selection from its toolbar", async () => {
    const user = userEvent.setup();
    render(<Editor />);
    const message = screen.getByLabelText("Message") as HTMLTextAreaElement;

    await user.type(message, "Choose Save");
    message.setSelectionRange(7, 11);
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(message).toHaveValue("Choose **Save**");
    await user.click(screen.getByRole("button", { name: "Numbered list" }));
    expect(message).toHaveValue("1. Choose **Save**");
    expect(screen.getByText("82 left")).toBeInTheDocument();
  });

  it("previews the title and text, keeps them across tabs, and disables formatting there", async () => {
    const user = userEvent.setup();
    render(<Editor withTitle />);
    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
    expect(within(toolbar).getByRole("button", { name: "Extra" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Preview" }));
    expect(screen.getByText("Nothing to preview.")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Write" }));

    await user.type(screen.getByLabelText("Title"), "Heads up");
    await user.type(screen.getByLabelText("Message"), "- one");
    await user.click(screen.getByRole("tab", { name: "Preview" }));
    expect(screen.getByText("Heads up")).toHaveClass("font-semibold");
    expect(screen.getByRole("listitem")).toHaveTextContent("one");
    expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();

    await user.click(screen.getByRole("tab", { name: "Write" }));
    expect(screen.getByLabelText("Title")).toHaveValue("Heads up");
    expect(screen.getByLabelText("Message")).toHaveValue("- one");
  });

  it("has no title field unless asked for one", () => {
    render(<Editor />);
    expect(screen.queryByLabelText("Title")).not.toBeInTheDocument();
  });
});
