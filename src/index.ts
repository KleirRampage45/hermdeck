#!/usr/bin/env node
/**
 * HermDeck — Entry Point
 *
 * The user runs `npx @asukat/hermdeck` and this is what executes.
 *
 * Flow:
 *   1. Parse CLI flags (--yes, --sudo-password, etc.)
 *   2. Run system checks (OS, user, disk, internet)
 *   3. Install missing dependencies (Node.js, python deps)
 *   4. Clone and install Hermes Agent
 *   5. Configuration wizard (provider, gateway)
 *   6. Generate systemd service + enable at boot
 *   7. Desktop integration
 *   8. Print success message
 */

import { render } from 'ink';
import React from 'react';
import { HermDeckApp } from './tui.js';

// ── CLI flags ──────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {
  yes: args.includes('--yes') || args.includes('-y'),
  sudoPassword: extractFlag('--sudo-password'),
  token: extractFlag('--token'), // npm publish token (for dev)
};

function extractFlag(name: string): string | undefined {
  const idx = args.indexOf(name);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return undefined;
}

// ── Main ───────────────────────────────────────────────
async function main() {
  const { waitUntilExit } = render(
    React.createElement(HermDeckApp, { flags })
  );
  await waitUntilExit();
}

main().catch((err) => {
  console.error('❌ HermDeck failed:', err.message);
  process.exit(1);
});
