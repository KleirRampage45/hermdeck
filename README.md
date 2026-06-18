# 🎮 HermDeck

### One command. Your Steam Deck gets an agent.

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
- **🖥️ Desktop GUI** — Hermes Desktop app in your application menu
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
npx @asukat/hermdeck
```

An interactive installer guides you through everything.

> No Node.js? No problem. Run this instead:
> ```bash
> curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh
> ```

### After install

| Do this | How |
|---------|-----|
| Chat with your agent | Open Telegram and message your bot |
| Open the terminal TUI | Type `hermes` in Konsole |
| Launch the desktop app | Find "Hermes Desktop" in the app menu |
| Manage skills & config | `npx @asukat/hermdeck --configure` |

---

## How it works

```
┌─ Steam Deck (Desktop Mode) ──────────────────────┐
│                                                    │
│  ~/hermes-agent/        ← Hermes Agent + venv     │
│  ~/.hermes/             ← Config, skills, memory  │
│  ~/.local/bin/          ← Node.js + tools         │
│  ~/.config/systemd/user/ ← Service (auto-start)   │
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

The agent needs an LLM to think. Two options:

1. **OpenRouter (recommended)** — free tier, works immediately, no setup
2. **Link to your desktop's LM Studio** — run local models, route over Tailscale

---

## Why HermDeck?

| Problem | Solution |
|---------|----------|
| SteamOS wipes `/usr` on updates | Everything installs to `/home/deck/` |
| Systemd services get lost | User services in `~/.config/systemd/user/` persist |
| No Node.js on Steam Deck | Installed to `~/.local/bin/` via official tarball |
| Manual config is tedious | Interactive TUI handles everything |
| "How do I even start?" | One command. That's the point. |

---

## Commands

| Command | What it does |
|---------|-------------|
| `npx @asukat/hermdeck` | Full install wizard |
| `npx @asukat/hermdeck --yes` | Non-interactive install (all defaults) |
| `npx @asukat/hermdeck --configure` | Re-run configuration only |
| `npx @asukat/hermdeck --upgrade` | Update Hermes Agent to latest |
| `npx @asukat/hermdeck --uninstall` | Remove Hermes Agent and all artifacts |

---

## Connecting to your desktop agent

If you also run Hermes Agent on your desktop, link them:

1. Install Tailscale on both devices (`flatpak install tailscale`)
2. Both agents discover each other automatically on the tailnet
3. Your desktop agent can delegate tasks to your Deck agent and vice versa

---

## Project structure

```
hermdeck/
├── package.json        # npm package
├── src/                # TypeScript source
│   ├── index.ts        # Entry point
│   ├── tui.tsx         # Interactive terminal UI (Ink/React)
│   ├── checks.ts       # System verification
│   ├── deps.ts         # Dependency installation
│   ├── install.ts      # Hermes Agent installation
│   ├── config.ts       # Configuration generation
│   ├── systemd.ts      # Service management
│   └── desktop.ts      # Desktop integration
├── scripts/
│   └── bootstrap.sh    # curl | sh bootstrap (installs Node.js)
├── templates/          # Reference templates
└── dist/               # Compiled output
```

---

## Development

```bash
git clone https://github.com/KleirRampage45/hermdeck.git
cd hermdeck
npm install
npm run build
```

---

## License

MIT — do what you want.

Built by [@asukat](https://github.com/KleirRampage45) with love for the Steam Deck community.
