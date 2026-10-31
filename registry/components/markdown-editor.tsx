import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { Tooltip } from "@base-ui/react/tooltip";
import { BoldIcon, ListIcon, ListOrderedIcon } from "lucide-react";
import { MarkdownLite } from "@/components/markdown-lite";
import { toggleBold, toggleList, type Edit } from "@/lib/markdown-shortcuts";

export type MarkdownEditorLabels = {
  write: string;
  preview: string;
  toolbar: string;
  bold: string;
  bullets: string;
  numbers: string;
  title: string;
  body: string;
  bodyPlaceholder: string;
  empty: string;
};

const ENGLISH: MarkdownEditorLabels = {
  write: "Write",
  preview: "Preview",
  toolbar: "Formatting",
  bold: "Bold",
  bullets: "Bulleted list",
  numbers: "Numbered list",
  title: "Title",
  body: "Message",
  bodyPlaceholder: "Write here…",
  empty: "Nothing to preview.",
};

/** A toolbar control, named in a tooltip. */
export function ToolbarTip({ tip, children }: { tip: ReactNode; children: ReactElement }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6} className="z-50">
          <Tooltip.Popup className="bg-foreground text-background max-w-xs rounded-lg px-2.5 py-1.5 text-xs">
            {tip}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

const TOOL =
  "text-foreground hover:bg-muted focus-visible:ring-ring/50 inline-flex size-8 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";
const TAB =
  "text-muted-foreground hover:text-foreground data-active:text-foreground relative h-full px-3 text-sm font-medium outline-none after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-foreground after:opacity-0 data-active:after:opacity-100 focus-visible:ring-ring/50 focus-visible:ring-[3px]";

/**
 * Writing with a little Markdown, like a comment on GitHub: Write and Preview
 * tabs, and a toolbar for bold and lists that stays on Preview. Give it an
 * optional title (shown when `onTitleChange` is set), more toolbar controls
 * (`toolbar`), and your own `preview`; by default the preview is the title
 * in bold and the text drawn with markdown-lite. On a narrow screen the tools
 * scroll sideways beside the tabs.
 */
export function MarkdownEditor({
  value,
  onChange,
  title,
  onTitleChange,
  maxLength,
  titleMaxLength,
  toolbar,
  preview,
  footer,
  labels = ENGLISH,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  maxLength?: number;
  titleMaxLength?: number;
  /** More controls at the end of the toolbar. */
  toolbar?: ReactNode;
  /** What Preview shows; markdown-lite's drawing by default. */
  preview?: ReactNode;
  /** Under the editor, e.g. a hint or how many characters are left. */
  footer?: ReactNode;
  labels?: MarkdownEditorLabels;
  className?: string;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const field = useRef<HTMLTextAreaElement>(null);
  const writing = tab === "write";

  const format = (change: (edit: Edit) => Edit) => {
    const textarea = field.current;
    if (!textarea) return;
    const next = change({
      text: value,
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    });
    if (maxLength !== undefined && next.text.length > maxLength) return;
    onChange(next.text);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(next.start, next.end);
    });
  };

  const tool = (label: string, icon: ReactNode, change: (edit: Edit) => Edit) => (
    <ToolbarTip tip={label}>
      <button
        type="button"
        className={TOOL}
        disabled={!writing}
        aria-label={label}
        onClick={() => format(change)}
      >
        {icon}
      </button>
    </ToolbarTip>
  );

  return (
    <Tabs.Root
      value={tab}
      onValueChange={(next) => setTab(next as "write" | "preview")}
      className={`focus-within:border-ring focus-within:ring-ring/50 flex flex-col overflow-hidden rounded-2xl border focus-within:ring-[3px] ${className}`}
    >
      <div
        role="toolbar"
        aria-label={labels.toolbar}
        className="bg-muted/40 flex min-h-11 items-center gap-1 border-b px-2"
      >
        <Tabs.List className="flex shrink-0 self-stretch">
          <Tabs.Tab value="write" className={TAB}>
            {labels.write}
          </Tabs.Tab>
          <Tabs.Tab value="preview" className={TAB}>
            {labels.preview}
          </Tabs.Tab>
        </Tabs.List>
        {/* The tools scroll sideways when they don't fit; ml-auto keeps them at the end when they do. */}
        <div className="min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <div className="ml-auto flex w-max items-center gap-1 py-1.5">
            {tool(labels.bold, <BoldIcon />, toggleBold)}
            {tool(labels.bullets, <ListIcon />, (edit) => toggleList(edit, "bullets"))}
            {tool(labels.numbers, <ListOrderedIcon />, (edit) => toggleList(edit, "numbers"))}
            {toolbar}
          </div>
        </div>
      </div>

      <Tabs.Panel value="write" className="flex flex-col gap-1 px-4 pt-3 pb-2 outline-none">
        {onTitleChange && (
          <input
            aria-label={labels.title}
            placeholder={labels.title}
            maxLength={titleMaxLength}
            value={title ?? ""}
            onChange={(event) => onTitleChange(event.target.value)}
            className="placeholder:text-muted-foreground bg-transparent py-1 text-base font-semibold outline-none"
          />
        )}
        <textarea
          ref={field}
          aria-label={labels.body}
          placeholder={labels.bodyPlaceholder}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="placeholder:text-muted-foreground [field-sizing:content] max-h-72 min-h-40 resize-none overflow-y-auto bg-transparent py-1 text-sm outline-none"
        />
      </Tabs.Panel>
      <Tabs.Panel value="preview" className="min-h-52 p-4 text-sm outline-none">
        {preview ??
          (value.trim() || title?.trim() ? (
            <div className="flex flex-col gap-1">
              {title?.trim() && <p className="font-semibold">{title.trim()}</p>}
              <MarkdownLite text={value} />
            </div>
          ) : (
            <p className="text-muted-foreground">{labels.empty}</p>
          ))}
      </Tabs.Panel>

      {footer && <div className="text-muted-foreground border-t px-4 py-2 text-xs">{footer}</div>}
    </Tabs.Root>
  );
}
