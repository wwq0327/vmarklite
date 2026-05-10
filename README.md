# VMark Lite

**Read-Only Preview for Markdown, Code, and Data Files**

A minimal, local-first file viewer for developers. Opens markdown, YAML, JSON, TOML, Mermaid diagrams, SVG, HTML, and more — with schema-aware views and smart formatting.

<p align="center">
  <img src="website/public/screenshots/editor-main.png" alt="VMark Lite" width="800">
</p>

VMark Lite is the lightweight preview-only edition of VMark. It renders your files beautifully without requiring an internet connection or accounts.

**[Download](https://github.com/wwq0327/vmarklite/releases)**

---

## Features

- **Multi-Format Preview** — Markdown (WYSIWYG), YAML, JSON, TOML, Mermaid, SVG, HTML, and code syntax highlighting
- **Schema-Aware Views** — `Cargo.toml`, `package.json`, and `pyproject.toml` show dependency trees
- **CJK Typography** — Smart spacing rules for Chinese, Japanese, and Korean text
- **International** — English, 简体中文, 繁體中文, 日本語, 한국어, Deutsch, Español, Français, Italiano, Português
- **5 Themes** — White, Paper, Mint, Sepia, Night
- **Local-First** — No cloud, no accounts, no analytics. Files stay on your machine
- **Customizable** — All keyboard shortcuts configurable in Settings

---

## Install

Download the latest DMG from the [Releases page](https://github.com/wwq0327/vmarklite/releases).

- Apple Silicon: `VMark Lite_x.x.x_aarch64.dmg`

> macOS 10.15+ required. Only macOS builds are currently available.

---

## Building from Source

**Prerequisites:** Node.js 20+, pnpm 10+, Rust (stable), [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

```bash
git clone https://github.com/wwq0327/vmarklite.git
cd vmarklite
pnpm install
pnpm tauri dev        # Development
pnpm tauri build      # Production
pnpm check:all        # Lint + test + build
```

**Tech Stack:** Tauri v2 (Rust), React 19, TypeScript, Zustand v5, Tiptap, Tailwind CSS v4

---

## License

[ISC License](LICENSE)
