# 🎮 HermDeck

**One command. Your Steam Deck gets an agent.**

Copy and paste this into Konsole:

```
curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh
```

> No Node.js? No problem. The bootstrap installs it for you.  
> Changed your sudo password? It prompts you once and never stores it.  
> SteamOS updates? Everything survives in `/home/deck/`.

### Already have Node.js?

```
npx @asukat/hermdeck
```

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

Open **Konsole** (Steam button → type "Konsole" → Enter) and paste the command at the top of this page.

The bootstrap:
1. Detects SteamOS
2. Installs Node.js to `~/.local/bin/` (if missing)
3. Prompts for sudo password only if needed
4. Runs the interactive HermDeck installer
5. Guides you through provider + Telegram setup
6. Sets up auto-start via systemd

### After install

| Do this | How |
|---------|-----|
| Chat with your agent | Open Telegram and message your bot |
| Open the terminal TUI | Type `hermes` in Konsole |
| Launch the desktop app | Find "Hermes Deck Agent" in the app menu |

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
| Sudo password changed | Prompts once, caches via `sudo -v` |
| Manual config is tedious | Interactive wizard handles everything |
| "How do I even start?" | One command. That's the point. |

---

## Commands

| Command | What it does |
|---------|-------------|
| `curl -fsSL ...bootstrap.sh \| sh` | **Recommended** — bootstrap + install |
| `npx @asukat/hermdeck` | Full install wizard (if Node.js is available) |
| `npx @asukat/hermdeck --upgrade` | Update Hermes Agent to latest |

---

## Project

- GitHub: [github.com/KleirRampage45/hermdeck](https://github.com/KleirRampage45/hermdeck)
- npm: `@asukat/hermdeck`
- License: MIT

Built by [@asukat](https://github.com/KleirRampage45) for the Steam Deck community.
