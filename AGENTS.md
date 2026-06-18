# HermDeck — Agent Instructions

This file is READ by AI agents working on this project (including me). Keep it up to date.

## Project

`hermdeck` — One-command Hermes Agent installer for Steam Deck.
- `npx @asukat/hermdeck`
- npm user: **asukat** (token stored in Asuka's memory)
- GitHub: KleirRampage45/hermdeck

## Build & Publish

```bash
npm run build     # compiles src/ → dist/
npm publish       # publishes to npm under @asukat/hermdeck
```

## Project Structure

```
hermdeck/
├── package.json
├── README.md
├── AGENTS.md           ← this file
├── CONCEPT.md          ← design doc / vision
├── LICENSE             ← MIT
├── scripts/
│   └── bootstrap.sh    ← curl | sh bootstrap for users without Node.js
├── src/
│   ├── index.ts        ← entry point
│   ├── tui.ts          ← Ink/React terminal UI
│   ├── checks.ts       ← system checks (OS, user, disk, etc.)
│   ├── deps.ts         ← dependency installation
│   ├── install.ts      ← Hermes Agent installation
│   ├── config.ts       ← configuration wizard
│   ├── systemd.ts      ← service file generation
│   └── desktop.ts      ← desktop integration
├── templates/          ← raw template files (not in npm package, reference only)
│   ├── hermes-config.yaml
│   ├── hermes.service
│   └── desktop.desktop
└── dist/               ← compiled JS (what npm publishes)
```

## Design Principles

1. **Zero system-level installs.** Everything goes to `~/.local/` or `~/hermes-agent/`. Nothing in `/usr/`, `/opt/`, `/etc/`.
2. **Survives updates.** Every file we create lives under `/home/deck/`. SteamOS wipes root, not home.
3. **One command, zero friction.** `npx hermdeck` should be all the user types.
4. **Beautiful TUI.** The install experience should feel polished, not like a script vomiting text.
5. **Smart defaults.** OpenRouter free tier, no gateway → the user can configure later. Default should work out of the box.

## Important Paths (Steam Deck)

| What | Path |
|------|------|
| User home | `/home/deck/` |
| Local binaries | `~/.local/bin/` |
| Node.js | `~/.local/bin/node` (installed by us) |
| Hermes install | `~/hermes-agent/` |
| Hermes config | `~/.hermes/` |
| Systemd user | `~/.config/systemd/user/` |
| Desktop entries | `~/.local/share/applications/` |

## Contact

- GitHub Issues: github.com/KleirRampage45/hermdeck/issues
- npm: @asukat
