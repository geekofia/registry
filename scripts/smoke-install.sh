#!/usr/bin/env bash
# Installs items into a fresh, minimal shadcn project with the real shadcn CLI,
# from the registry built and served locally, then type-checks the result: the
# items land where a project expects them, with imports that resolve. CI runs
# it after `npm run registry:build`.
set -euo pipefail
# Any other failure, reported with its line and command.
trap 'echo "::error title=smoke install: line $LINENO::$BASH_COMMAND"' ERR

registry="$(pwd)"
log="$(mktemp)"

# Runs a step quietly; on failure, reports it with the end of its output as a
# GitHub annotation (readable from the API, unlike the raw log) and stops.
step() {
  local name="$1"
  shift
  if ! "$@" >"$log" 2>&1; then
    local tail
    tail="$(tail -c 2500 "$log")"
    tail="${tail//%/%25}"
    tail="${tail//$'\n'/%0A}"
    echo "::error title=smoke install: $name::$tail"
    cat "$log"
    exit 1
  fi
}

port=4321
project="$(mktemp -d)"
trap 'kill "$server" 2>/dev/null || true; rm -rf "$project"' EXIT

python3 -m http.server "$port" --directory public >/dev/null 2>&1 &
server=$!
sleep 1

cd "$project"
cat > package.json <<JSON
{ "name": "smoke", "private": true, "type": "module" }
JSON
step "install react" npm install --no-audit --no-fund react@19 react-dom@19
step "install tools" npm install --no-audit --no-fund -D typescript @types/react @types/react-dom tailwindcss@4
mkdir -p src
echo '@import "tailwindcss";' > src/index.css
cat > tsconfig.json <<JSON
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["ES2023", "DOM"], "module": "ESNext",
    "moduleResolution": "bundler", "jsx": "react-jsx", "strict": true,
    "noEmit": true, "skipLibCheck": true, "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
JSON
cat > components.json <<JSON
{
  "\$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-maia",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui",
    "lib": "@/lib", "hooks": "@/hooks"
  },
  "registries": { "@geekofia": "http://localhost:$port/r/{name}.json" }
}
JSON

shadcn="shadcn@$(node -p "require('$registry/node_modules/shadcn/package.json').version")"
step "shadcn add" npx --yes "$shadcn" add @geekofia/theme-toggle --yes

for file in src/components/theme-toggle.tsx src/components/theme-provider.tsx public/theme-init.js; do
  step "installed $file" test -f "$file"
done
step "no shadcn ui imports" bash -c '! grep -rq "components/ui/" src/components' 
cat > src/app.tsx <<TSX
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const App = () => (
  <ThemeProvider storageKey="smoke-theme">
    <ThemeToggle />
  </ThemeProvider>
);
TSX
step "type-check" bash -c 'npx tsc || { find src public -type f; exit 1; }'
echo "Installed and type-checked: theme-toggle, theme-provider, theme-init."
