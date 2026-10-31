import { useState } from "react";
import { MarkdownEditor } from "@/components/markdown-editor";

const MAX = 500;

export default function MarkdownEditorDemo() {
  const [title, setTitle] = useState("Release notes");
  const [value, setValue] = useState(
    "We shipped:\n\n- **Dark mode** that follows your OS\n- Faster search",
  );
  return (
    <MarkdownEditor
      value={value}
      onChange={setValue}
      title={title}
      onTitleChange={setTitle}
      maxLength={MAX}
      footer={`**bold**, - or 1. lists, and a blank line between paragraphs. ${MAX - value.length} left.`}
    />
  );
}
