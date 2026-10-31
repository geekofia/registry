import { useState } from "react";
import { MarkdownLite } from "@/components/markdown-lite";

const SAMPLE = `Your account now needs a code from an **authenticator app**.

**Set it up:**
1. Open your name in the corner.
2. Choose **Security**, then **Set up**.

- Works with any authenticator app
- <b>HTML</b> shows as typed`;

export default function MarkdownLiteDemo() {
  const [text, setText] = useState(SAMPLE);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <textarea
        aria-label="Text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="border-input min-h-56 rounded-xl border bg-transparent p-3 font-mono text-xs outline-none"
      />
      <MarkdownLite text={text} className="text-sm" />
    </div>
  );
}
