import { describe, expect, it } from "vitest";
import { importsOf, packageOf, problemsWith, strayFiles } from "./check-standalone";

const item = (overrides = {}) => ({
  name: "theme-toggle",
  dependencies: ["@base-ui/react", "lucide-react"],
  registryDependencies: ["@geekofia/theme-provider"],
  files: [{ path: "registry/components/theme-toggle.tsx" }],
  ...overrides,
});
const source = (code: string) => ({ "registry/components/theme-toggle.tsx": code });

describe("check-standalone", () => {
  it("finds imports and their packages", () => {
    expect(
      importsOf('import { Menu } from "@base-ui/react/menu";\nimport type { X } from "react";'),
    ).toEqual(["@base-ui/react/menu", "react"]);
    expect(packageOf("@base-ui/react/menu")).toBe("@base-ui/react");
    expect(packageOf("react/jsx-runtime")).toBe("react");
  });

  it("passes an item importing React, its packages and the items it lists", () => {
    const code = [
      'import { useState } from "react";',
      'import { Menu } from "@base-ui/react/menu";',
      'import { SunIcon } from "lucide-react";',
      'import { useTheme } from "@/components/theme-provider";',
    ].join("\n");
    expect(problemsWith(item(), source(code))).toEqual([]);
  });

  it("refuses shadcn's ui, unlisted packages and items, relative imports and other packages", () => {
    const code = [
      'import { Button } from "@/components/ui/button";',
      'import clsx from "clsx";',
      'import { Thing } from "@/components/other-item";',
      'import { x } from "./helper";',
    ].join("\n");
    expect(problemsWith(item({ dependencies: ["@base-ui/react", "zod"] }), source(code))).toEqual([
      "theme-toggle: depends on zod, which isn't allowed",
      "theme-toggle: registry/components/theme-toggle.tsx imports shadcn's @/components/ui/button",
      "theme-toggle: registry/components/theme-toggle.tsx imports clsx, which it doesn't list",
      "theme-toggle: registry/components/theme-toggle.tsx imports @/components/other-item without @geekofia/other-item",
      "theme-toggle: registry/components/theme-toggle.tsx imports ./helper; use @/components/...",
    ]);
  });

  it("lets an item's files import each other", () => {
    expect(
      problemsWith(
        {
          name: "markdown-lite",
          files: [
            { path: "registry/lib/markdown-lite.ts" },
            { path: "registry/components/markdown-lite-text.tsx" },
          ],
        },
        {
          "registry/lib/markdown-lite.ts": "export const x = 1;",
          "registry/components/markdown-lite-text.tsx": 'import { x } from "@/lib/markdown-lite";',
        },
      ),
    ).toEqual([]);
  });

  it("wants ~/ on a public file's target, as shadcn would put it under src/", () => {
    const item = (target: string) => ({
      name: "theme-init",
      files: [{ path: "registry/public/theme-init.js", target }],
    });
    expect(problemsWith(item("public/theme-init.js"), {})).toEqual([
      "theme-init: registry/public/theme-init.js targets public/theme-init.js; use ~/public/theme-init.js",
    ]);
    expect(problemsWith(item("~/public/theme-init.js"), {})).toEqual([]);
  });

  it("leaves stylesheets alone, whose comments may show an @import", () => {
    expect(
      problemsWith(
        { name: "tokens", files: [{ path: "registry/styles/tokens.css" }] },
        { "registry/styles/tokens.css": '/* Use it: @import "./tokens.css"; */' },
      ),
    ).toEqual([]);
  });

  it("finds files in no item, leaving tests alone", () => {
    expect(
      strayFiles(
        [item()],
        [
          "registry/components/theme-toggle.tsx",
          "registry/components/theme-toggle.test.tsx",
          "registry/components/forgotten.tsx",
        ],
      ),
    ).toEqual(["registry/components/forgotten.tsx"]);
  });
});
