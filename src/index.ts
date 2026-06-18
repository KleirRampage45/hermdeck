#!/usr/bin/env node
/**
 * HermDeck — 🎮 One-command Hermes Agent installer for Steam Deck
 *
 * Usage: npx @asukat/hermdeck
 *   or:  curl -fsSL https://raw.githubusercontent.com/KleirRampage45/hermdeck/main/scripts/bootstrap.sh | sh
 *
 * Zero external dependencies. Pure Node.js + ANSI colors.
 */

import { execSync } from 'child_process';
import { checkSystem, formatBytes } from './checks';
import { installHermesAgent, ensureNodeJS, ensureGit } from './install';
import { configWizard, writeHermesConfig } from './config';
import { setupService, isServiceRunning } from './systemd';
import { setupDesktopEntries } from './desktop';
import { sudoNoPassword, promptAndCacheSudo } from './sudo';

// ── ANSI Helpers ──────────────────────────────────────
const c = {
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

const BANNER = `
${c.cyan('╔══════════════════════════════════════════╗')}
${c.cyan('║')}          ${c.bold('🎮 HermDeck v0.1.2')}          ${c.cyan('║')}
${c.cyan('║')}     ${c.dim('"Deck your agent in one command"')}     ${c.cyan('║')}
${c.cyan('╚══════════════════════════════════════════╝')}
`;

function step(n: number, label: string) {
  console.log(c.cyan(`\n  ── [${n}/8] ${label} ──\n`));
}

function ok(msg: string) { console.log(`  ${c.green('✓')} ${msg}`); }
function warn(msg: string) { console.log(`  ${c.yellow('⚠')} ${msg}`); }
function fail(msg: string) { console.log(`  ${c.red('✗')} ${msg}`); }
function info(msg: string) { console.log(`  ${c.dim('→')} ${msg}`); }

async function progress(label: string, fn: () => Promise<{ success: boolean; message: string }>) {
  process.stdout.write(`  ${c.yellow('◌')} ${label}...\r`);
  const spinner = setInterval(() => {
    process.stdout.write(`  ${c.yellow('◌')} ${label}...\r`);
  }, 500);
  try {
    const result = await fn();
    clearInterval(spinner);
    process.stdout.write(' '.repeat(60) + '\r');
    if (result.success) ok(result.message || label);
    else fail(`${label}: ${result.message}`);
    return result;
  } catch (err: any) {
    clearInterval(spinner);
    process.stdout.write(' '.repeat(60) + '\r');
    fail(`${label}: ${err.message || 'failed'}`);
    throw err;
  }
}

// ── Main ───────────────────────────────────────────────

async function main() {
  console.log(BANNER);

  const homeDir = process.env.HOME || '/home/deck';
  const startTime = Date.now();

  // ── Step 1: System Checks ───────────────────────────
  step(1, 'System Checks');
  const sys = await checkSystem();

  if (sys.isSteamOS) ok('SteamOS detected');
  else warn('Not detected as SteamOS (proceeding anyway)');

  ok(`Running as user: ${sys.user}`);
  ok(`Internet: ${sys.hasInternet ? 'connected' : c.yellow('NOT CONNECTED')}`);
  ok(`Disk free: ${formatBytes(sys.diskFreeGB)}`);

  if (sys.hasGit) ok(`Git: ${execSync('git --version', { encoding: 'utf-8' }).trim()}`);
  else warn('Git not found');

  if (sys.hasNode) ok(`Node.js: ${sys.nodeVersion}`);
  else info('Node.js not found (will install)');

  if (sys.hasPython) ok('Python 3 found');
  else {
    fail('Python 3 is required. Try: sudo steamos-readonly disable && sudo pacman -S python && sudo steamos-readonly enable');
    process.exit(1);
  }

  if (sys.hasHermes) {
    warn('Existing Hermes Agent found at ~/.hermes/ — will upgrade');
  }

  // ── Step 2: Sudo Access ─────────────────────────────
  step(2, 'Sudo Access');
  if (sys.isSteamOS) {
    if (sudoNoPassword()) {
      ok('Passwordless sudo — no prompt needed');
    } else {
      info('SteamOS read-only filesystem requires sudo for some operations.');
      info('Your password is never stored — cached via sudo -v for 5 minutes.\n');
      const gotSudo = await promptAndCacheSudo();
      if (!gotSudo) {
        warn('Sudo access not granted. Git install will fail if missing, but other steps continue.');
      } else {
        ok('Sudo access granted');
      }
    }
  } else {
    info('Not SteamOS — skipping sudo setup');
  }

  // ── Step 3: Dependencies ────────────────────────────
  step(3, 'Dependencies');
  if (!sys.hasNode) {
    await progress('Installing Node.js to ~/.local/bin/', () => ensureNodeJS(homeDir));
  } else {
    ok('Node.js ready');
  }
  if (!sys.hasGit) {
    await progress('Installing Git', () => ensureGit(homeDir));
  } else {
    ok('Git ready');
  }

  // ── Step 4: Install Hermes Agent ────────────────────
  step(4, 'Install Hermes Agent');
  if (!sys.hasInternet) {
    fail('No internet connection. Cannot download Hermes Agent.');
    process.exit(1);
  }
  const installResult = await progress('Downloading & installing Hermes Agent', () =>
    installHermesAgent(homeDir)
  );
  if (!installResult?.success) {
    fail('Hermes Agent installation failed.');
    console.log(c.yellow(`\n  ${installResult?.message}`));
    console.log(c.dim('\n  Retry manually:'));
    console.log(c.dim('    curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash -s -- --non-interactive --skip-setup\n'));
    process.exit(1);
  }

  // ── Step 5: Configuration ───────────────────────────
  step(5, 'Configuration');
  console.log(c.dim('  Set up how your agent connects.\n'));
  const config = await configWizard(homeDir);
  await writeHermesConfig(homeDir, config);
  ok('Configuration saved to ~/.hermes/config.yaml');

  // ── Step 6: Systemd Service ─────────────────────────
  step(6, 'Auto-start Service');
  const serviceResult = await setupService(homeDir);
  ok(serviceResult.message);
  if (isServiceRunning()) ok('Hermes Agent is RUNNING');

  // ── Step 7: Desktop Integration ─────────────────────
  step(7, 'Desktop Integration');
  const desktopResult = await setupDesktopEntries(homeDir);
  ok(desktopResult.message);
  info('Find "Hermes Deck Agent" in your application menu');

  // ── Step 8: Done! ───────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n${c.green('╔══════════════════════════════════════════╗')}`);
  console.log(`${c.green('║')}     ${c.bold(`✅ HermDeck Complete! (${elapsed}s)`)}    ${c.green('║')}`);
  console.log(`${c.green('╚══════════════════════════════════════════╝')}`);

  console.log(c.cyan('\n  What now?\n'));
  console.log(`  ${c.bold('→')} Chat with your agent on Telegram via @YourBot`);
  console.log(`  ${c.bold('→')} Type ${c.cyan('hermes')} in Konsole for the TUI`);
  console.log(`  ${c.bold('→')} Find ${c.cyan('"Hermes Deck Agent"')} in your app menu\n`);

  console.log(c.green('  📌 Survives SteamOS updates'));
  console.log(c.green('  📌 Auto-starts at boot'));
  console.log(c.green('  📌 Reconnects after sleep/wake\n'));

  console.log(c.dim('  ─────────────────────────────────'));
  console.log(c.dim('  📢 Install Tailscale to link your'));
  console.log(c.dim('     desktop and Deck agents together!'));
  console.log(c.dim(`     ${c.cyan('github.com/KleirRampage45/hermdeck')}\n`));
}

main().catch((err) => {
  console.error(`\n${c.red('  ✗ HermDeck failed:')} ${err.message}`);
  process.exit(1);
});
