# @serenedb/ui — SereneDB design kit

Design tokens, primitives and the **platform header** shared by every SereneDB
front end: the playground, serenedb.com, serene-ui and the docs search.

```
src/
  styles/tokens.css     design tokens as plain CSS variables (no Tailwind needed)
  styles/theme.css      Tailwind v4 entry: tokens + @theme mapping + base layer
  styles/fonts.css      Urbanist, variable weights 100–900, normal and italic
  components/           Button, ThemeToggle, GithubButton, icons
  theme/                ThemeProvider + useTheme (class-based dark mode)
  platform/             PlatformHeader, ServiceSwitcher, the service registry
```

The kit is consumed as a **git submodule** — there is no npm registry involved.
See [Using the kit](#using-the-kit) and, before your first submodule bump, the
[submodule checklist](#submodule-checklist).

## Using the kit

**1. Add it as a submodule** (path is a convention: `packages/ui` in a workspace
repo, `vendor/serene-ui` elsewhere):

```bash
git submodule add https://github.com/serenedb/serene-design.git packages/ui
```

**2. Depend on it.** In a workspaces repo, list the path in `workspaces` and use
`"@serenedb/ui": "*"`. Otherwise:

```json
{ "dependencies": { "@serenedb/ui": "file:./vendor/serene-ui" } }
```

**3. Wire the CSS.** In the app's Tailwind entry, in this order:

```css
@import "tailwindcss";
@import "@serenedb/ui/styles.css";
@source "../../../packages/ui/src";
```

The `@source` line is **required**. Tailwind v4 does not scan `node_modules`
(nor a symlinked workspace), so without it the kit's own utility classes are
never generated and the header renders unstyled. Point it at the kit's `src`.

**4. Render the header:**

```tsx
import { PlatformHeader, ThemeProvider } from '@serenedb/ui';
import { Link } from 'react-router-dom';

<ThemeProvider storageKey="playground-theme">
  <PlatformHeader
    serviceId="hn-analyze"
    internal                                  // link by SPA path, not absolute URL
    renderLink={({ href, children, ...rest }) => <Link to={href} {...rest}>{children}</Link>}
    right={<LiveCounter />}
  />
</ThemeProvider>
```

Outside the playground drop `internal` and `renderLink`: the switcher then
points at `https://playground.serenedb.com/<path>` with plain anchors.

## The service registry

`src/platform/services.ts` is the single list of playground services. Every
switcher — wherever it renders — reads it, so a new service is one entry here
plus a submodule bump in each consumer. Each entry also carries `source`, the
GitHub directory the header's GitHub button points at, so every service links
to its own code.

## Tokens

`tokens.css` is the design-system export: light on `:root`, dark under `.dark`
on `<html>` (the `ThemeProvider` owns that class). `theme.css` maps every token
onto a Tailwind utility — `bg-background`, `text-secondary-foreground`,
`border-border`, `text-thirdly` — and forces `--radius-*: 0`, because the
design language is square.

`--thirdly` is the SereneDB violet. Note for the chess app: it currently calls
that colour `--primary`; when it moves onto the kit, those usages become
`thirdly`, and `--primary` goes back to meaning the neutral surface it means
everywhere else.

## Submodule checklist

Submodules are pinned by commit, and the sharp edges all come from that. Each
item below exists because of a specific failure:

- **`npm install` initialises the submodule.** Consumers run
  `git submodule update --init --recursive` from a `postinstall` script, so a
  plain `git clone` + `npm install` never leaves `packages/ui` empty (the empty
  directory shows up as an unhelpful `Module not found: @serenedb/ui`).
- **A pre-push hook refuses to push an unpushed bump.** Committing here and
  bumping the pointer there, then pushing only the parent, gives everyone else
  `fatal: reference is not a tree: <sha>` with no hint about which repo is at
  fault. The hook checks the submodule commit exists on its remote first.
- **Every CI checkout uses `submodules: recursive`.** `actions/checkout`
  defaults to `false`; a build that skips it fails at install, not at checkout,
  which sends you looking in the wrong place. This repo is public, so the
  default `GITHUB_TOKEN` is enough — no deploy key needed.
- **Turn on `git config --global submodule.recurse true`.** Otherwise
  `git pull` and `git checkout` leave the submodule at the old commit and you
  build against a stale kit while everyone else sees your "impossible" bug.
- **Bump deliberately.** `git submodule update --remote packages/ui` moves the
  pointer to the kit's default branch; commit that pointer change on its own,
  with the kit change it corresponds to named in the message.
- **A conflict on `packages/ui` is a conflict between two commit ids.**
  `--ours` / `--theirs` do not merge anything: `cd packages/ui`, look at both
  commits, check out the right one, then `git add packages/ui`.

## Development

```bash
npm install
npm run build      # tsup → dist/, then styles + fonts copied alongside
npm run typecheck
```

`prepare` runs the build, so a consumer installing this repo gets `dist/`
without doing anything special.

Urbanist is bundled under the [SIL Open Font License 1.1](src/assets/fonts/Urbanist/OFL.txt).
Keep that license and its copyright notice when redistributing the font files.
The kit's code remains Apache-2.0. Both font faces cover Latin and Latin extended;
characters outside that coverage use the system fallbacks in `--font-sans`.
