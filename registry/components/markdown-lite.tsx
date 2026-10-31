import { Fragment } from "react";
import { parseMarkdownLite, type Line } from "@/lib/markdown-lite";

const Runs = ({ line }: { line: Line }) =>
  line.map((run, index) =>
    run.bold ? (
      <strong key={index} className="font-semibold">
        {run.text}
      </strong>
    ) : (
      <Fragment key={index}>{run.text}</Fragment>
    ),
  );

/** Text with a little Markdown (bold, lists, paragraphs), drawn safely. */
export function MarkdownLite({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {parseMarkdownLite(text).map((block, index) => {
        if (block.kind === "paragraph") {
          return (
            <p key={index}>
              {block.lines.map((line, at) => (
                <Fragment key={at}>
                  {at > 0 && <br />}
                  <Runs line={line} />
                </Fragment>
              ))}
            </p>
          );
        }
        const items = block.items.map((line, at) => (
          <li key={at}>
            <Runs line={line} />
          </li>
        ));
        return block.kind === "bullets" ? (
          <ul key={index} className="list-disc space-y-0.5 pl-5">
            {items}
          </ul>
        ) : (
          <ol key={index} start={block.start} className="list-decimal space-y-0.5 pl-5">
            {items}
          </ol>
        );
      })}
    </div>
  );
}
