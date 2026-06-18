# HermDeck — Concept & Design

> `npx hermdeck` — One command. Your Steam Deck gets an agent.

---

## The Problem

SteamOS is an immutable Arch Linux. Installing self-hosted software requires:
- Disabling read-only filesystem
- Remembering what gets wiped on updates
- Manual systemd service setup
- Config editing
- Pain

Every Deck is identical. Every user hits the same walls. Nobody should have to repeat this.

## The Solution

A single NPX command that handles everything:
- Detects SteamOS
- Installs all deps to persistent user-space paths
- Clones, configures, and starts Hermes Agent
- Sets up systemd user services (survives updates)
- Interactive TUI for provider/gateway configuration
- Optionally installs Hermes Desktop app via Flatpak

---

## The User's Journey (Complete)

### Discovery
User finds HermDeck on GitHub, Reddit, or hears about it.

README says: **"One command. That's it."**

```
npx hermdeck
```

### Prerequisites (documented clearly)
- Steam Deck, Desktop Mode
- Internet connection
- No technical skill required beyond pasting one command

### Step-by-step

#### 0. Pre-execution
User opens Konsole in Desktop Mode.
- Shortcut: Steam Button → type "Konsole" → Enter
- They paste: `npx hermdeck`

#### 1. Bootstrap Phase (seconds 0-2)
npm downloads the `hermdeck` package from npmjs.com. No dependencies needed yet — the package itself is small (<1MB).

#### 2. Welcome Screen (TUI appears)
```
╔══════════════════════════════════════════════╗
║          🎮 HermDeck v1.0                    ║
║     "Deck your agent in one command"         ║
╚══════════════════════════════════════════════╝
```

#### 3. System Checks (~2 seconds)
| Check | What | Pass | Fail |
|-------|------|------|------|
| OS | `/etc/os-release ID=steamos` | Continue | "This tool is for Steam Deck. Abort." |
| User | `whoami == deck` | Continue | "This tool must run as user 'deck'. Abort." |
| Internet | `curl google.com` | Continue | "No internet. Connect and retry." |
| Disk | `df /home` > 2GB free | Continue | "Need 2GB free on /home. Free up space." |
| Arch | `uname -m` == x86_64 | Continue | "Steam Deck is x86_64. Something is wrong." |

#### 4. Dependency Resolution (~10-60 seconds)
SteamOS does NOT ship with Node.js by default. So we handle it:

| Dep | Ships with SteamOS? | Action |
|-----|---------------------|--------|
| `python3` | ✅ Yes (3.11+) | Verify |
| `git` | ✅ Yes (usually) | Verify, offer pacman if missing |
| `pip3` | ✅ Yes | Verify |
| `node` / `npm` | ❌ No | **Install to `~/.local/`** using either: (a) NodeSource binary, (b) nvm in home, or (c) pacman with sudo prompt |

The TUI shows progress:
```
📦 Installing dependencies...
  → Python 3.11... ✓ found
  → Git... ✓ found
  → pip... ✓ found
  → Node.js... installing to ~/.local/bin/...
  [████████░░░░░░░░░░░░] 40%
```

For Node.js, the BEST approach is installing to `~/.local/` using the prebuilt Node.js tarballs from nodejs.org (no root needed, survives updates). This is what nvm does under the hood.

#### 5. Hermes Agent Install (~60-120 seconds)
```
🤖 Installing Hermes Agent...
  → Cloning NousResearch/hermes-agent... [████████████░░░░░░░░] 60%
  → Creating Python venv... █
  → Installing packages...
```

Steps:
- `git clone https://github.com/NousResearch/hermes-agent.git ~/hermes-agent`
- `python3 -m venv ~/hermes-agent/venv`
- `~/hermes-agent/venv/bin/pip install -e ~/hermes-agent/`

#### 6. Configuration Wizard (~30 seconds, interactive)
```
⚙️ Configure your agent

[?] LLM Provider (how does the agent think?):
    1) OpenRouter (free tier, no setup ← RECOMMENDED)
    2) Link to your desktop's LM Studio (via Tailscale)
    3) Custom API endpoint
  > 1

[?] Gateway (how do you talk to it?):
    1) Telegram bot (chat with it from anywhere ⭐)
    2) Discord webhook
    3) Both
    4) None (CLI-only, for now)
  > 1

[?] Telegram bot token: █
```

This is the most interactive part. The user pastes their Telegram token (from BotFather).

#### 7. Service Setup (~5 seconds)
```
🚀 Setting up services...
  → Generating systemd user service... ✓
  → Enabling at boot... ✓
  → Starting agent... ✓
```

The service file goes to `~/.config/systemd/user/hermes-agent.service`

#### 8. Desktop Integration (~3 seconds)
```
🖥️ Desktop integration...
  → Hermes Desktop available in Application Menu ✓
```

Create `~/.local/share/applications/hermes-desktop.desktop`
Or offer to install the Flatpak from Discover.

#### 9. Completion Screen
```
✅ HermDeck complete!

→ 💬 Chat with your agent: @YourTelegramBot
→ ⌨️  Konsole: type 'hermes' for the TUI
→ 🖥️  App Menu: "Hermes Desktop" for GUI

📌 This agent SURVIVES SteamOS updates.
📌 It auto-starts when your Deck boots.
📌 It reconnects after sleep/wake.

─────────────────────────────────────
🔧 Next steps:
  • Install Tailscale → connect desktop + Deck
  • Open the TUI to configure skills
  • Check ~/hermes-agent/ for logs
─────────────────────────────────────
```

---

## Edge Cases & Failures

| Scenario | Handling |
|----------|----------|
| No internet | Detect early, show error, abort |
| Node.js install fails | Offer manual instructions |
| Git clone fails | Retry with `--depth 1`, offer manual |
| Disk space low | Warn at 2GB, abort at 500MB |
| sudo required | Prompt once, cache for session |
| User already has Hermes | Detect `~/.hermes/config.yaml`, offer to upgrade |
| SteamOS update resets dependencies | Detect missing deps, auto-reinstall in home |
| User runs as root | "Dude. Don't run as root. Aborting." |
| Sleep during install | TUI resumes on wake (terminal session) |

---

## Persistence Strategy (Why This Survives Updates)

| Component | Path | Survives? |
|-----------|------|-----------|
| Hermes Agent | `~/hermes-agent/` | ✅ /home persists |
| Virtual env | `~/hermes-agent/venv/` | ✅ /home persists |
| Config | `~/.hermes/config.yaml` | ✅ /home persists |
| Skills/Memories | `~/.hermes/skills/`, `~/.hermes/memories/` | ✅ /home persists |
| Node.js binary | `~/.local/bin/node` | ✅ /home persists |
| Python packages | `~/.local/lib/python3.*/` | ✅ /home persists |
| Systemd user service | `~/.config/systemd/user/` | ✅ /home persists |
| Desktop entries | `~/.local/share/applications/` | ✅ /home persists |
| **pacman packages** | `/usr/bin/` | ❌ **WIPED** |

**Rule:** We NEVER install anything with pacman that we can install in `~/.local/`.

---

## Distribution

- **npm:** `@asukat/hermdeck` — primary distribution channel
- **GitHub:** github.com/KleirRampage45/hermdeck — source, issues, releases
- **Bootstrap:** `curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh` — fallback for users without Node.js (this script installs Node to ~/.local/ then runs npx)

---

## Package Size Strategy

Keep the npm package tiny:
- `src/*.ts` compiled to `dist/*.js`
- Templates as embedded strings (no external template files in the package)
- No binary dependencies
- Target: <500KB published package

Heavy lifting (Hermes Agent clone, pip install) happens at runtime, not in the package.
