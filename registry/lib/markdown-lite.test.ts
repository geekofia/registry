import { describe, expect, it } from "vitest";
import { parseMarkdownLite, parseInline, plainText } from "./markdown-lite";

describe("markdown-lite", () => {
  it("bolds **runs**, and leaves an unpaired ** as typed", () => {
    expect(parseInline("Choose **Sign-in security**, then **Set up**.")).toEqual([
      { text: "Choose ", bold: false },
      { text: "Sign-in security", bold: true },
      { text: ", then ", bold: false },
      { text: "Set up", bold: true },
      { text: ".", bold: false },
    ]);
    expect(parseInline("2 ** 3")).toEqual([{ text: "2 ** 3", bold: false }]);
  });

  it("splits paragraphs at blank lines, keeps a single line break, and finds lists", () => {
    const blocks = parseMarkdownLite(
      "To protect your data, EaseHR asks for a code.\n\n**Set it up:**\n1. Open your name.\n2. Choose **Sign-in security**.\n\nKeep in mind:\n- one\n* two\nLast line",
    );

    expect(blocks.map((block) => block.kind)).toEqual([
      "paragraph",
      "paragraph",
      "numbers",
      "paragraph",
      "bullets",
      "paragraph",
    ]);
    expect(blocks[2]).toMatchObject({ kind: "numbers", start: 1 });
    expect(blocks[4]).toMatchObject({ items: [[{ text: "one" }], [{ text: "two" }]] });
  });

  it("keeps a numbered list's first number, and joins lines of one paragraph", () => {
    const [list] = parseMarkdownLite("3. three\n4. four");
    expect(list).toMatchObject({ kind: "numbers", start: 3 });

    const [paragraph] = parseMarkdownLite("one line\nand the next");
    expect(paragraph).toMatchObject({
      kind: "paragraph",
      lines: [[{ text: "one line" }], [{ text: "and the next" }]],
    });
  });

  it("never treats the text as HTML", () => {
    expect(parseMarkdownLite("<img src=x onerror=alert(1)>")).toEqual([
      { kind: "paragraph", lines: [[{ text: "<img src=x onerror=alert(1)>", bold: false }]] },
    ]);
  });

  it("gives a plain one-line glance", () => {
    expect(plainText("**Set it up:**\n1. Open your name.\n- Save codes")).toBe(
      "Set it up: Open your name. Save codes",
    );
  });
});
