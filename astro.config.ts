import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";

const at = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Starlight marks the page dark with data-theme; the items use a `dark`
// class. Keep the two in step both ways, so demos follow the docs' theme and
// the theme demos can change it.
const THEME_SYNC = `(() => {
  const root = document.documentElement;
  const fromStarlight = () => {
    const dark = root.dataset.theme === "dark";
    if (root.classList.contains("dark") === dark && root.classList.contains(dark ? "dark" : "light")) return;
    root.classList.toggle("dark", dark);
    root.classList.toggle("light", !dark);
  };
  const fromClass = () => {
    if (!root.classList.contains("dark") && !root.classList.contains("light")) return;
    const theme = root.classList.contains("dark") ? "dark" : "light";
    if (root.dataset.theme !== theme) root.dataset.theme = theme;
  };
  fromStarlight();
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.attributeName === "data-theme") fromStarlight();
      else fromClass();
    }
  }).observe(root, { attributes: true, attributeFilter: ["data-theme", "class"] });
})();`;

export default defineConfig({
  site: "https://geekofia.github.io",
  base: "/registry",
  integrations: [
    starlight({
      title: "@geekofia registry",
      description: "Reusable React components for shadcn and Tailwind v4 projects.",
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/geekofia/registry" }],
      customCss: ["./src/styles/global.css"],
      head: [{ tag: "script", content: THEME_SYNC }],
      sidebar: [
        { label: "Start here", items: [{ slug: "getting-started" }] },
        { label: "Components", items: [{ autogenerate: { directory: "components" } }] },
        { label: "Hooks", items: [{ autogenerate: { directory: "hooks" } }] },
      ],
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@/components": at("./registry/components"),
        "@/hooks": at("./registry/hooks"),
        "@/lib": at("./registry/lib"),
      },
    },
  },
});
