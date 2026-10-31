// Every item must work on its own, in a shadcn project or a plain Tailwind
// one: it may import React, the npm packages it lists (from a short allowed
// set), and other items it lists as registry dependencies, but never shadcn's
// components/ui/*. Run by CI: `npm run check:standalone`.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Item = {
  name: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: { path: string }[];
};

/** The only npm packages an item may depend on. */
export const ALLOWED_PACKAGES = ["@base-ui/react", "lucide-react", "@tanstack/react-table"];
const ALWAYS = ["react", "react-dom"];
const NAMESPACE = "@geekofia/";

const SCRIPT = /\.(?:[cm]?js|tsx?|jsx)$/;
const IMPORT = /(?:import|export)\s+(?:[^"';]*?\s+from\s+)?["']([^"']+)["']/g;

/** "@base-ui/react/menu" → "@base-ui/react", "react/jsx-runtime" → "react". */
export const packageOf = (specifier: string) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/");

export function importsOf(source: string): string[] {
  return [...source.matchAll(IMPORT)].map((match) => match[1]);
}

/** What's wrong with one item, given its files' sources. */
export function problemsWith(item: Item, sources: Record<string, string>): string[] {
  const problems: string[] = [];
  const listed = item.dependencies ?? [];
  const items = (item.registryDependencies ?? [])
    .filter((each) => each.startsWith(NAMESPACE))
    .map((each) => each.slice(NAMESPACE.length));
  // Its own files, e.g. a component importing its item's @/lib/... parser.
  const own = item.files.map((file) =>
    file.path
      .split("/")
      .at(-1)!
      .replace(/\.[^.]+$/, ""),
  );

  for (const name of listed) {
    if (!ALLOWED_PACKAGES.includes(packageOf(name))) {
      problems.push(`${item.name}: depends on ${name}, which isn't allowed`);
    }
  }
  // Only scripts import; a stylesheet's comments may show an @import.
  for (const file of item.files.filter((each) => SCRIPT.test(each.path))) {
    for (const specifier of importsOf(sources[file.path] ?? "")) {
      if (specifier.startsWith(".")) {
        problems.push(`${item.name}: ${file.path} imports ${specifier}; use @/components/...`);
      } else if (specifier.startsWith("@/components/ui/")) {
        problems.push(`${item.name}: ${file.path} imports shadcn's ${specifier}`);
      } else if (specifier.startsWith("@/")) {
        const name = specifier.split("/").at(-1)!;
        if (!items.includes(name) && !own.includes(name)) {
          problems.push(
            `${item.name}: ${file.path} imports ${specifier} without @geekofia/${name}`,
          );
        }
      } else if (![...ALWAYS, ...listed].includes(packageOf(specifier))) {
        problems.push(`${item.name}: ${file.path} imports ${specifier}, which it doesn't list`);
      }
    }
  }
  return problems;
}

/** Files under registry/ that belong to no item (tests aside). */
export function strayFiles(items: Item[], files: string[]): string[] {
  const owned = new Set(items.flatMap((item) => item.files.map((file) => file.path)));
  return files.filter((file) => !/\.test\.tsx?$/.test(file) && !owned.has(file));
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesUnder(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { items } = JSON.parse(readFileSync("registry.json", "utf8")) as { items: Item[] };
  const problems = items.flatMap((item) =>
    problemsWith(
      item,
      Object.fromEntries(item.files.map((file) => [file.path, readFileSync(file.path, "utf8")])),
    ),
  );
  problems.push(
    ...strayFiles(items, filesUnder("registry")).map((file) => `${file} is in no item`),
  );
  if (problems.length > 0) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`${items.length} items, each standalone.`);
}
