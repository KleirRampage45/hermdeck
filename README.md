# 🎮 HermDeck

### One command. Your Steam Deck gets an agent.

```
curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh
```

> No Node.js? No problem. The bootstrap installs it for you.

Or if you already have Node.js:

```
npx @asukat/hermdeck
```

HermDeck installs **Hermes Agent** on your Steam Deck — a self-improving AI agent that runs on your device, survives system updates, and you can talk to from anywhere.

---

## What you get

- **🤖 A personal AI agent** running on your Steam Deck — secure, private, always available
- **💬 Chat with it** via Telegram, Discord, or the terminal
- **🛠️ Do things remotely** — manage downloads, check system status, automate tasks
- **⏰ Cron jobs** — scheduled tasks that run even while you're away
- **🖥️ Desktop GUI** — "Hermes Deck Agent" in your application menu
- **♻️ Survives updates** — every file lives in `/home/deck/`. Nothing gets wiped.

---

## Quick start

### Prerequisites
- Steam Deck in Desktop Mode
- Internet connection
- That's it.

### Install

Open **Konsole** (Steam button → type "Konsole" → Enter) and paste:

```bash
curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh
```

The bootstrap installs Node.js (if needed), then runs the interactive installer.

### After install

| Do this | How |
|---------|-----|
| Chat with your agent | Open Telegram and message your bot |
| Open the terminal TUI | Type `hermes` in Konsole |
| Launch the desktop app | Find "Hermes Deck Agent" in the app menu |
| Manage skills & config | `npx @asukat/hermdeck --configure` |

---

## How it works

```
┌─ Steam Deck (Desktop Mode) ──────────────────────┐
│                                                    │
│  ~/.hermes/hermes-agent/    ← Hermes Agent + venv │
│  ~/.hermes/                 ← Config, skills      │
│  ~/.local/bin/              ← Node.js + tools     │
│  ~/.config/systemd/user/    ← Auto-start service  │
│                                                    │
│  ┌─ Gateway (Telegram/Discord) ──┐                │
│  │  Chat with your agent         │                │
│  │  from anywhere                │                │
│  └───────────────────────────────┘                │
└────────────────────────────────────────────────────┘
         │                             │
         ▼                             ▼
  ┌────────────┐            ┌──────────────┐
  │ OpenRouter │            │ LM Studio    │
  │ (Cloud LLM)│            │ (Your PC)    │
  │ Free tier  │            │ Tailscale    │
  └────────────┘            └──────────────┘
```

---

## Why HermDeck?

| Problem | Solution |
|---------|----------|
| SteamOS wipes `/usr` on updates | Everything installs to `/home/deck/` |
| Systemd services get lost | User services in `~/.config/systemd/user/` persist |
| No Node.js on Steam Deck | Bootstrap installs to `~/.local/bin/` |
| Sudo password changed | Prompts for password once, caches via `sudo -v` |
| Manual config is tedious | Interactive TUI handles everything |
| "How do I even start?" | One command. That's the point. |

---

## Commands

| Command | What it does |
|---------|-------------|
| `curl -fsSL ...bootstrap.sh \| sh` | Bootstrap + install (recommended) |
| `npx @asukat/hermdeck` | Full install wizard (if Node.js is available) |
| `npx @asukat/hermdeck --upgrade` | Update Hermes Agent to latest |
| `npx @asukat/hermdeck --uninstall` | Remove Hermes Agent and all artifacts |

---

## Project

- GitHub: [github.com/KleirRampage45/hermdeck](https://github.com/KleirRampage45/hermdeck)
- npm: `@asukat/hermdeck`
- License: MIT

Built by [@asukat](https://github.com/KleirRampage45) for the Steam Deck community.
