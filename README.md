# create-sosk-scaf

A CLI scaffolding tool that generates a new project from the [`sosk-scaf`](https://github.com/Meisosk/sosk-scaf) Vite + React template.

## Usage

```bash
npx create-sosk-scaf
```

or

```bash
npm create sosk-scaf
```

You'll be prompted for a project name. The tool will then download the latest version of the `sosk-scaf` template from GitHub into a new folder with that name.

After it finishes:

```bash
cd <your-project-name>
npm install
npm run dev
```

## How it works

This package is a thin CLI wrapper — it does not bundle the template itself. Instead, it fetches the current `main` branch of [`Meisosk/sosk-scaf`](https://github.com/Meisosk/sosk-scaf) at runtime using [`giget`](https://github.com/unjs/giget), then rewrites the generated `package.json`'s `name` field to match the project name you provided.

```
bin/cli.js
  1. Prompts for a project name
  2. Downloads github:Meisosk/sosk-scaf into that folder via giget
  3. Rewrites package.json "name" to match the project name
  4. Prints next steps (cd, npm install, npm run dev)
```

## Project structure (source repos)

```
Personal Projects/
├── sosk-scaf/              → Vite + React template (GitHub: Meisosk/sosk-scaf)
└── create-sosk-scaf/       → this CLI wrapper (published to npm)
    ├── package.json        → "bin": { "create-sosk-scaf": "./bin/cli.js" }
    └── bin/cli.js          → CLI logic (prompts + giget + package.json rewrite)
```

## Dependencies

- [`giget`](https://www.npmjs.com/package/giget) — downloads the template from GitHub without cloning full git history
- [`prompts`](https://www.npmjs.com/package/prompts) — interactive CLI prompt for the project name
- [`kleur`](https://www.npmjs.com/package/kleur) — terminal output coloring

## Updating the template vs. updating the CLI

These are decoupled — updating one does not require touching the other.

- **Template changes** (anything about the generated site itself): edit `sosk-scaf`, commit, push to GitHub. No npm republish needed — the next `create-sosk-scaf` run picks it up automatically since it always fetches the current `main` branch.
- **CLI changes** (prompts, flags, messaging, new logic in `bin/cli.js`): bump the version in `create-sosk-scaf`'s `package.json`, then run:

  ```bash
  npm publish --access public
  ```

## Publishing notes

- npm account uses a security key for 2FA. Publishing triggers a browser-based auth prompt (a link like `npm.com/auth/cli/...`) rather than a typed OTP code — just press Enter to open it and approve in the browser.
- Package name (`create-sosk-scaf`) matches the `create-*` npm convention, which is what enables the `npm create sosk-scaf` shorthand in addition to `npx create-sosk-scaf`.

## Roadmap ideas (not yet implemented)

- Pin the template fetch to a specific git tag/release once `sosk-scaf` stabilizes, instead of always tracking `main`
- Add a `--yes` flag to skip prompts for CI/non-interactive use
- Support multiple template variants (would move this from a single-template `giget` fetch to a template-selection prompt)
