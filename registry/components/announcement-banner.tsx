import { useState } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  MegaphoneIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { MarkdownLite } from "@/components/markdown-lite";
import { parseMarkdownLite, plainText } from "@/lib/markdown-lite";

/** Five tones, each its own colour and icon, so the meaning never rests on colour alone. */
export const TONES = {
  neutral: {
    icon: MegaphoneIcon,
    surface: "bg-muted/60 text-foreground",
    accent: "text-muted-foreground",
  },
  info: {
    icon: InfoIcon,
    surface: "bg-sky-500/10 text-sky-950 dark:text-sky-50",
    accent: "text-sky-600 dark:text-sky-400",
  },
  success: {
    icon: CircleCheckIcon,
    surface: "bg-emerald-500/10 text-emerald-950 dark:text-emerald-50",
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    icon: TriangleAlertIcon,
    surface: "bg-amber-500/15 text-amber-950 dark:text-amber-50",
    accent: "text-amber-600 dark:text-amber-400",
  },
  critical: {
    icon: OctagonAlertIcon,
    surface: "bg-red-500/10 text-red-950 dark:text-red-50",
    accent: "text-red-600 dark:text-red-400",
  },
} satisfies Record<string, { icon: LucideIcon; surface: string; accent: string }>;

export type Tone = keyof typeof TONES;

export type AnnouncementLabels = { dismiss: string; showMore: string; showLess: string };

const ENGLISH: AnnouncementLabels = {
  dismiss: "Close",
  showMore: "Show more",
  showLess: "Show less",
};

/**
 * A banner across the top of a page, or a notice card, in one of five tones:
 * a title on its own line and a body with a little Markdown. A banner folds a
 * long body (past `foldAfter` characters, or more than one paragraph or list)
 * to two lines with Show more; a notice shows it in full. Give `onDismiss` to
 * show Close.
 */
export function Announcement({
  title,
  body,
  tone = "info",
  variant = "banner",
  onDismiss,
  foldAfter = 180,
  labels = ENGLISH,
  className = "",
}: {
  title?: string | null;
  body: string;
  tone?: Tone | string;
  variant?: "banner" | "notice";
  onDismiss?: () => void;
  foldAfter?: number;
  labels?: AnnouncementLabels;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const look = TONES[tone as Tone] ?? TONES.info;
  const Icon = look.icon;
  const banner = variant === "banner";
  const long = banner && (body.length > foldAfter || parseMarkdownLite(body).length > 1);

  return (
    <div
      role="status"
      className={`flex items-start gap-3 text-sm ${
        banner ? "px-4 py-2.5 md:px-6" : "rounded-xl border p-4"
      } ${look.surface} ${className}`}
    >
      <Icon
        className={`mt-0.5 shrink-0 ${banner ? "size-4" : "size-5"} ${look.accent}`}
        aria-hidden
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {long && !open ? (
          <p className="line-clamp-2 opacity-90">{plainText(body)}</p>
        ) : (
          <MarkdownLite text={body} className="opacity-90" />
        )}
        {long && (
          <button
            type="button"
            className="self-start text-xs font-medium underline underline-offset-4"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? labels.showLess : labels.showMore}
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          aria-label={labels.dismiss}
          onClick={onDismiss}
          className="hover:bg-foreground/10 focus-visible:ring-ring/50 -my-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-[3px]"
        >
          <XIcon className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
