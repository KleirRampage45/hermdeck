#!/usr/bin/env bash
# HermDeck Bootstrap — Installs Node.js + runs npx hermdeck
# Usage: curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh
# For Steam Deck users who don't have Node.js installed yet.

set -euo pipefail

# ── Colors ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}  →${NC} $1"; }
ok()    { echo -e "${GREEN}  ✓${NC} $1"; }
warn()  { echo -e "${YELLOW}  ⚠${NC} $1"; }
fail()  { echo -e "${RED}  ✗${NC} $1"; exit 1; }

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      🎮 HermDeck Bootstrap           ║${NC}"
echo -e "${CYAN}║   Installing Node.js for hermdeck    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── Detect SteamOS ─────────────────────────────────────
info "Checking system..."
if [ ! -f /etc/os-release ] || ! grep -qi "steamos" /etc/os-release 2>/dev/null; then
    # Not SteamOS — warn but don't block
    warn "Not detected as SteamOS. HermDeck targets Steam Deck."
    warn "Proceeding anyway — your mileage may vary."
else
    ok "SteamOS detected"
fi

# ── Check for Node.js ──────────────────────────────────
if command -v node &>/dev/null; then
    NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
    ok "Node.js found: $NODE_VERSION"
else
    info "Node.js not found. Installing to ~/.local/..."

    # Create local bin dir
    mkdir -p "$HOME/.local/bin"

    # Detect architecture
    ARCH="$(uname -m)"
    case "$ARCH" in
        x86_64)  NODE_ARCH="x64" ;;
        aarch64) NODE_ARCH="arm64" ;;
        *)       fail "Unsupported architecture: $ARCH (Steam Deck should be x86_64)" ;;
    esac

    # Use the latest LTS
    NODE_VERSION="22.4.1"
    NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"

    info "Downloading Node.js v${NODE_VERSION} (${NODE_ARCH})..."
    curl -fsSL "$NODE_URL" -o /tmp/node.tar.xz
    tar -xf /tmp/node.tar.xz -C /tmp/
    cp -r "/tmp/node-v${NODE_VERSION}-linux-${NODE_ARCH}/bin/"* "$HOME/.local/bin/"
    cp -r "/tmp/node-v${NODE_VERSION}-linux-${NODE_ARCH}/lib/"* "$HOME/.local/lib/"
    rm -rf /tmp/node-v${NODE_VERSION}-linux-${NODE_ARCH} /tmp/node.tar.xz

    # Add to PATH for this session
    export PATH="$HOME/.local/bin:$PATH"

    # Also persist in shell rc
    if ! grep -q '\.local/bin' "$HOME/.bashrc" 2>/dev/null; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    fi

    ok "Node.js $(node --version) installed to ~/.local/"
fi

# ── Install npm packages if needed ─────────────────────
if ! npm list -g @asukat/hermdeck &>/dev/null; then
    info "Installing npm packages for HermDeck..."
fi

# ── Run HermDeck ───────────────────────────────────────
echo ""
echo -e "${GREEN}  🚀 Launching HermDeck...${NC}"
echo ""
npx @asukat/hermdeck "$@"
