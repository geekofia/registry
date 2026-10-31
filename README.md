# @geekofia registry

Reusable React components for [shadcn](https://ui.shadcn.com) and Tailwind v4
projects. Each item stands alone: React, Tailwind, and at most
[Base UI](https://base-ui.com), lucide-react and (for the data table)
TanStack Table, never shadcn's `components/ui`,
so it works with or without shadcn.

Docs and install commands: **https://geekofia.github.io/registry**

## Use it

**With shadcn**, add the registry to `components.json` once:

```json
"registries": {
  "@geekofia": "https://geekofia.github.io/registry/r/{name}.json"
}
```

then add items:

```sh
npx shadcn@latest add @geekofia/theme-toggle
```

**With only Tailwind**, copy an item's files from the docs, install the packages
it lists, and import `tokens.css` after Tailwind so its colours work.

## Items

| Item                      | What                                                                  |
| ------------------------- | --------------------------------------------------------------------- |
| `tokens`                  | shadcn's colour and radius tokens, light and dark, for Tailwind only  |
| `theme-init`              | Sets the theme before the app starts: no light flash                  |
| `theme-provider`          | Light, dark or system, saved, following the OS as it changes          |
| `theme-toggle`            | A button with a menu to choose Light, Dark or System                  |
| `markdown-lite`           | Bold, lists and paragraphs from typed text, drawn as data, never HTML |
| `markdown-editor`         | Write and Preview tabs with a toolbar, like a GitHub comment          |
| `announcement-banner`     | A banner or notice in five tones, folding long text                   |
| `async-multi-select`      | Options from a server search as chips, with an optional All           |
| `switch`                  | An on/off switch                                                      |
| `data-table`              | A server-driven table with search, sorting and cursor pages           |
| `use-debounced-value`     | A value once it stops changing                                        |
| `use-media-query`         | A media query kept up to date, and `useIsMobile`                      |
| `use-cursor-table-params` | A server table's state in the URL, with any router                    |

## Develop

```sh
npm install
npm run dev               # the docs site, with the registry built
npm test                  # the items' tests
npm run check:standalone  # every item stands alone
npm run build             # r/*.json and the site, into dist/
```

Items live in `registry/`, laid out as they land in a project
(`registry/components/...`), and import each other as `@/components/...`, which
shadcn rewrites to the project's aliases. Add an item to `registry.json` with
the packages and `@geekofia/...` items it needs; CI checks that every item
stands alone and installs into a fresh shadcn project.

## License

MIT
