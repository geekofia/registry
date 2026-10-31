import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import registry from "../../registry.json";

type Item = (typeof registry.items)[number] & {
  dependencies?: string[];
  registryDependencies?: string[];
};

const SITE = registry.homepage;
// Every registry file's source, for copying into a project without shadcn.
const sources = import.meta.glob<string>("../../registry/**/*.{ts,tsx,js,css}", {
  query: "?raw",
  import: "default",
  eager: true,
});
const sourceOf = (path: string) => sources[`../../${path}`] ?? "";

const REGISTRIES = `"registries": {
  "@geekofia": "${SITE}/r/{name}.json"
}`;

const Copy = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy"
      className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-2 right-2 rounded-md p-1.5"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
    </button>
  );
};

const Code = ({ children }: { children: string }) => (
  <div className="relative">
    <pre className="bg-muted overflow-x-auto rounded-xl p-4 pr-12 text-xs leading-relaxed">
      <code>{children}</code>
    </pre>
    <Copy text={children} />
  </div>
);

const Installing = ({ item }: { item: Item }) => {
  const [how, setHow] = useState<"shadcn" | "manual">("shadcn");
  const tab = (value: typeof how, label: string) => (
    <button
      type="button"
      aria-pressed={how === value}
      onClick={() => setHow(value)}
      className="aria-pressed:bg-muted aria-pressed:text-foreground text-muted-foreground rounded-full px-3 py-1 text-sm font-medium"
    >
      {label}
    </button>
  );
  const needs = item.registryDependencies?.map((each) => each.replace("@geekofia/", "")) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {tab("shadcn", "shadcn")}
        {tab("manual", "Tailwind only")}
      </div>
      {how === "shadcn" ? (
        <Code>{`npx shadcn@latest add @geekofia/${item.name}`}</Code>
      ) : (
        <>
          {item.dependencies && <Code>{`npm install ${item.dependencies.join(" ")}`}</Code>}
          {needs.length > 0 && (
            <p className="text-muted-foreground text-sm">
              Needs{" "}
              {needs.map((each, index) => (
                <span key={each}>
                  {index > 0 && ", "}
                  <a href={`#${each}`} className="underline underline-offset-4">
                    {each}
                  </a>
                </span>
              ))}{" "}
              too.
            </p>
          )}
          {item.files.map((file) => (
            <div key={file.path} className="flex flex-col gap-1.5">
              <span className="text-muted-foreground font-mono text-xs">
                {"target" in file ? file.target : file.path.replace("registry/", "")}
              </span>
              <Code>{sourceOf(file.path)}</Code>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export const App = () => (
  <div className="mx-auto flex max-w-3xl flex-col gap-10 px-5 py-10">
    <header className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">@geekofia registry</h1>
        <p className="text-muted-foreground">
          Reusable React components for shadcn and Tailwind v4 projects. Each one stands alone:
          React, Tailwind, and at most Base UI and lucide-react. MIT licensed.
        </p>
      </div>
      <ThemeToggle />
    </header>

    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Setup</h2>
      <p className="text-muted-foreground text-sm">
        With shadcn, add the registry to <code>components.json</code> once:
      </p>
      <Code>{REGISTRIES}</Code>
      <p className="text-muted-foreground text-sm">
        With only Tailwind, copy an item's files and install its packages, then import{" "}
        <a href="#tokens" className="underline underline-offset-4">
          tokens
        </a>{" "}
        after Tailwind so its colours work.
      </p>
    </section>

    {(registry.items as Item[]).map((item) => (
      <section key={item.name} id={item.name} className="flex scroll-mt-6 flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{item.title}</h2>
          <p className="text-muted-foreground text-sm">{item.description}</p>
        </div>
        <Installing item={item} />
      </section>
    ))}

    <footer className="text-muted-foreground border-t pt-6 text-sm">
      <a href="https://github.com/geekofia/registry" className="underline underline-offset-4">
        github.com/geekofia/registry
      </a>
    </footer>
  </div>
);
