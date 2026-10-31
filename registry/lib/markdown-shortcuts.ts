/**
 * A Markdown editor's formatting buttons: each takes the text and the
 * selection and gives back both, with markdown-lite's syntax added, or taken
 * off when it's already there.
 */
export type Edit = { text: string; start: number; end: number };

/** **bold** around the selection, or an empty pair with the cursor inside. */
export function toggleBold({ text, start, end }: Edit): Edit {
  const before = text.slice(0, start);
  const selected = text.slice(start, end);
  const after = text.slice(end);
  if (before.endsWith("**") && after.startsWith("**")) {
    return {
      text: before.slice(0, -2) + selected + after.slice(2),
      start: start - 2,
      end: end - 2,
    };
  }
  if (selected.length > 4 && selected.startsWith("**") && selected.endsWith("**")) {
    return { text: before + selected.slice(2, -2) + after, start, end: end - 4 };
  }
  return { text: `${before}**${selected}**${after}`, start: start + 2, end: end + 2 };
}

const BULLET = /^(\s*)[-*]\s+/;
const NUMBER = /^(\s*)\d+[.)]\s+/;

/** "- " or "1. ", "2. "… at the start of each selected line; off again if they all have it. */
export function toggleList({ text, start, end }: Edit, kind: "bullets" | "numbers"): Edit {
  const from = text.lastIndexOf("\n", start - 1) + 1;
  const newline = text.indexOf("\n", Math.max(end - (end > start ? 1 : 0), start));
  const to = newline === -1 ? text.length : newline;
  const lines = text.slice(from, to).split("\n");
  const marker = kind === "bullets" ? BULLET : NUMBER;
  const on = lines.every((line) => marker.test(line));
  const changed = lines.map((line, index) => {
    const bare = line.replace(BULLET, "$1").replace(NUMBER, "$1");
    if (on) return bare;
    return kind === "bullets" ? `- ${bare}` : `${index + 1}. ${bare}`;
  });
  const block = changed.join("\n");
  return {
    text: text.slice(0, from) + block + text.slice(to),
    start: from,
    end: from + block.length,
  };
}
