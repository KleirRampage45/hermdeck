#!/usr/bin/env bash
# HermDeck Bootstrap v0.1.2
# ==========================
# Primary entry point for Steam Deck users without Node.js.
# Installs Node.js to ~/.local/bin/ then runs HermDeck.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}  →${NC} $1"; }
ok()    { echo -e "${GREEN}  ✓${NC} $1"; }
warn()  { echo -e "${YELLOW}  ⚠${NC} $1"; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      🎮 HermDeck Bootstrap           ║${NC}"
echo -e "${CYAN}║   Installing Hermes Agent for Deck   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── 1. Detect SteamOS ──
info "Checking system..."
if [ -f /etc/os-release ] && grep -qi "steamos" /etc/os-release 2>/dev/null; then
    ok "SteamOS detected"
else
    warn "Not detected as SteamOS — proceeding anyway"
fi

# ── 2. Install Node.js if missing ──
if command -v node &>/dev/null; then
    ok "Node.js $(node --version) found"
else
    info "Node.js not found. Installing to ~/.local/bin/..."

    mkdir -p "$HOME/.local/bin"

    ARCH="$(uname -m)"
    case "$ARCH" in
        x86_64)  NODE_ARCH="x64" ;;
        aarch64) NODE_ARCH="arm64" ;;
        *)       warn "Unsupported arch: $ARCH"; NODE_ARCH="x64" ;;
    esac

    NODE_VERSION="22.4.1"
    NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"

    info "Downloading Node.js v${NODE_VERSION}..."
  curl -fsSL "$NODE_URL" -o /tmp/node.tar.xz
    tar -xf /tmp/node.tar.xz -C /tmp/
    cp -r "/tmp/node-v${NODE_VERSION}-linux-${NODE_ARCH}/bin/"* "$HOME/.local/bin/"
    cp -r "/tmp/node-v${NODE_VERSION}-linux-${NODE_ARCH}/lib/"* "$HOME/.local/lib/"
    rm -rf "/tmp/node-v${NODE_VERSION}-linux-${NODE_ARCH}" /tmp/node.tar.xz

    export PATH="$HOME/.local/bin:$PATH"

    # Persist in .bashrc
    if ! grep -q '\.local/bin' "$HOME/.bashrc" 2>/dev/null; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    fi

    ok "Node.js $(node --version) installed to ~/.local/bin/"
fi

# ── 3. Ensure npm is available ──
if ! command -v npx &>/dev/null; then
    warn "npx not found — npm may not be installed correctly"
    warn "Trying: npm install -g npx..."
    npm install -g npx 2>/dev/null || true
fi

# ── 4. Run HermDeck ──
echo ""
echo -e "${GREEN}  🚀 Launching HermDeck...${NC}"
echo ""

if command -v npx &>/dev/null; then
    npx @asukat/hermdeck
else
    # Fallback: run via node directly from npm global
    warn "npx still unavailable — installing package globally..."
    npm install -g @asukat/hermdeck 2>/dev/null || {
        warn "npm install failed. Trying direct node execution..."
        node -e "
            const { execSync } = require('child_process');
            execSync('curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash -s -- --non-interactive --skip-setup', { stdio: 'inherit' });
            console.log('✅ Hermes Agent installed via fallback path');
        "
    }
fi
