/**
 * A little Markdown, safe for text people type: **bold**, lists ("- ", "* "
 * or "1. " at the start of a line) and blank lines between paragraphs, with a
 * single line break kept. Anything else shows as typed. Parsed into plain
 * data for React to draw, never into HTML, so the text can't inject markup.
 */
export type Inline = { text: string; bold: boolean };
export type Line = Inline[];
export type Block =
  | { kind: "paragraph"; lines: Line[] }
  | { kind: "bullets"; items: Line[] }
  | { kind: "numbers"; items: Line[]; start: number };

const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBER = /^\s*(\d+)[.)]\s+(.*)$/;

/** "**bold** and plain" into its runs; an unpaired ** stays as typed. */
export function parseInline(text: string): Line {
  const runs: Line = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) runs.push({ text: text.slice(last, at), bold: false });
    runs.push({ text: match[1], bold: true });
    last = at + match[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), bold: false });
  return runs;
}

export function parseMarkdownLite(body: string): Block[] {
  const blocks: Block[] = [];
  const push = (kind: "bullets" | "numbers" | "paragraph", line: Line, start = 1) => {
    const previous = blocks.at(-1);
    if (previous && previous.kind === kind) {
      if (previous.kind === "paragraph") previous.lines.push(line);
      else previous.items.push(line);
      return;
    }
    if (kind === "paragraph") blocks.push({ kind, lines: [line] });
    else if (kind === "bullets") blocks.push({ kind, items: [line] });
    else blocks.push({ kind, items: [line], start });
  };

  let broken = true;
  for (const raw of body.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      broken = true;
      continue;
    }
    const bullet = BULLET.exec(line);
    const number = NUMBER.exec(line);
    if (bullet) push("bullets", parseInline(bullet[1]));
    else if (number) push("numbers", parseInline(number[2]), Number(number[1]));
    else if (broken || blocks.at(-1)?.kind !== "paragraph")
      blocks.push({ kind: "paragraph", lines: [parseInline(line.trim())] });
    else push("paragraph", parseInline(line.trim()));
    broken = false;
  }
  return blocks;
}

/** The text as one plain line, e.g. for a folded preview. */
export const plainText = (body: string) =>
  body
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^\s*(?:[-*]|\d+[.)])\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
