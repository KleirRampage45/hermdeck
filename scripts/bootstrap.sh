#!/usr/bin/env bash
# HermDeck Bootstrap v0.1.3
# ==========================
# Installs Node.js (if needed), then runs HermDeck installer.
# If npx isn't available, falls back to direct download.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}  →${NC} $1"; }
ok()    { echo -e "${GREEN}  ✓${NC} $1"; }
warn()  { echo -e "${YELLOW}  ⚠${NC} $1"; }

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        🎮 HermDeck Bootstrap v0.1.3       ║${NC}"
echo -e "${CYAN}║     One-command Hermes for Steam Deck      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Detect OS ──
if [ -f /etc/os-release ] && grep -qi "steamos" /etc/os-release 2>/dev/null; then
    ok "SteamOS detected"
else
    warn "Not SteamOS — proceeding anyway"
fi

# ── 2. Install Node.js if missing or < 22.12 ──
NEED_NODE=false
if command -v node &>/dev/null; then
    read -r NODE_MAJOR NODE_MINOR <<< "$(node --version 2>/dev/null | sed 's/v//' | awk -F. '{print $1, $2}')"
    if [ "${NODE_MAJOR:-0}" -lt 22 ] || { [ "${NODE_MAJOR:-0}" -eq 22 ] && [ "${NODE_MINOR:-0}" -lt 12 ]; }; then
        warn "Node.js $(node --version) is too old (< 22.12). Upgrading..."
        NEED_NODE=true
    else
        ok "Node.js $(node --version)"
    fi
else
    info "Node.js not found. Installing..."
    NEED_NODE=true
fi

if [ "$NEED_NODE" = true ]; then
    mkdir -p "$HOME/.local/bin"
    case "$(uname -m)" in
        x86_64)  NODE_ARCH="x64"  ;;
        aarch64) NODE_ARCH="arm64" ;;
        *)       NODE_ARCH="x64"  ;;
    esac
    NODE_VERSION="22.12.0"
    NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz"

    info "Downloading Node.js v${NODE_VERSION}..."
    curl -fsSL "$NODE_URL" -o /tmp/node.tar.xz
    info "Extracting..."
    tar -xf /tmp/node.tar.xz -C /tmp/
    cp "/tmp/node-v${NODE_VERSION}-linux-${NODE_ARCH}/bin/"* "$HOME/.local/bin/"
    cp -r "/tmp/node-v${NODE_VERSION}-linux-${NODE_ARCH}/lib/"* "$HOME/.local/lib/"
    rm -rf "/tmp/node-v${NODE_VERSION}-linux-${NODE_ARCH}" /tmp/node.tar.xz
    export PATH="$HOME/.local/bin:$PATH"
    if ! grep -q '\.local/bin' "$HOME/.bashrc" 2>/dev/null; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    fi
    ok "Node.js $(node --version) installed to ~/.local/bin/"
fi

# ── 3. Ensure PATH ──
case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) export PATH="$HOME/.local/bin:$PATH" ;; esac

# ── 4. Run HermDeck ──
echo ""
echo -e "${GREEN}  🚀 Launching HermDeck installer...${NC}"
echo ""

if command -v npx &>/dev/null; then
    # npx available — use it
    npx @asukat/hermdeck "$@"
elif command -v node &>/dev/null; then
    # No npx — download package and run directly
    info "Downloading HermDeck..."
    TMP_DIR=$(mktemp -d)
    cd "$TMP_DIR"
    # Get latest tarball URL from npm registry
    TARBALL=$(curl -fsSL https://registry.npmjs.org/@asukat/hermdeck/latest | grep -o '"tarball":"[^"]*"' | cut -d'"' -f4)
    curl -fsSL "$TARBALL" -o hermdeck.tgz
    tar -xf hermdeck.tgz
    node package/bin/hermdeck.js "$@"
    cd / && rm -rf "$TMP_DIR"
else
    warn "Node.js not available — running official installer."
    curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash -s -- --non-interactive --skip-setup
    echo ""
    echo -e "${GREEN}  ✅ Hermes Agent installed!${NC}"
    echo ""
    echo -e "${YELLOW}  ⚠ To finish setup (systemd + desktop), run:${NC}"
    echo -e "${CYAN}     curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh -s -- --setup${NC}"
    echo ""
fi
