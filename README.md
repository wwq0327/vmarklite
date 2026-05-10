# VMark Lite

**Read-Only Preview for Markdown and Code**

A minimal, local-first file viewer for developers. Opens markdown, YAML, JSON, TOML, Mermaid diagrams, SVG, and more — with smart formatting and syntax highlighting.

<p align="center">
  <img src="website/public/screenshots/ai-workflow.png" alt="VMark Lite" width="800">
</p>

VMark Lite is the lightweight preview-only edition of [VMark](https://github.com/xiaolai/vmark). It renders your files beautifully without requiring an internet connection or accounts.

**[Download](https://github.com/xiaolai/vmark/releases)** · **[Documentation](https://vmark.app/guide/)**

---

## Features

- **Multi-Format Preview** — Markdown (WYSIWYG), YAML, JSON, TOML, Mermaid, SVG, HTML, and code syntax highlighting
- **Schema-Aware Views** — GitHub Actions workflows show a visual graph; `Cargo.toml` and `package.json` show dependency trees
- **CJK Formatting** — Smart spacing rules for Chinese, Japanese, and Korean text
- **International** — English, 简体中文, 繁體中文, 日本語, 한국어, Deutsch, Español, Français, Italiano, Português
- **Themes** — White, Paper, Mint, Sepia, Night
- **Local-First** — No cloud, no accounts, no analytics. Files stay on your machine
- **Customizable Shortcuts** — All keyboard shortcuts configurable in Settings

---

## Install

**macOS (Homebrew):**

```bash
brew install xiaolai/tap/vmark
```

**Manual:** Download from the [Releases page](https://github.com/xiaolai/vmark/releases).
- Apple Silicon: `VMark_x.x.x_aarch64.dmg`
- Intel: `VMark_x.x.x_x64.dmg`

**Windows & Linux:** Pre-built binaries on the [Releases page](https://github.com/xiaolai/vmark/releases).

---

## Building from Source

**Prerequisites:** Node.js 20+, pnpm 10+, Rust (stable), [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

```bash
git clone https://github.com/xiaolai/vmark.git
cd vmark
pnpm install
pnpm tauri dev        # Development
pnpm tauri build      # Production
pnpm check:all        # Lint + test + build
```

**Tech Stack:** Tauri v2 (Rust), React 19, TypeScript, Zustand v5, Tiptap, Tailwind CSS v4

---

## Contributing: Issues Only, No PRs

VMark is **vibe-coded** — written entirely by AI under human supervision. We welcome **issues** (bug reports, feature requests) but cannot safely merge external PRs.

When you file an issue, AI fixes it with full context of the project's conventions, test suite, and architecture.

- **[Bug Report](.github/ISSUE_TEMPLATE/bug_report.yml)** · **[Feature Request](.github/ISSUE_TEMPLATE/feature_request.yml)**

---

## Star History

<a href="https://star-history.com/#xiaolai/vmark&date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=xiaolai/vmark&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=xiaolai/vmark&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=xiaolai/vmark&type=date&legend=top-left" />
 </picture>
</a>

---

## License

[ISC License](LICENSE)
