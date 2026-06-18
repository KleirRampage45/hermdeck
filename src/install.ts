/**
 * HermDeck — Hermes Agent Installation
 *
 * Uses the official Nous Research install script, handles SteamOS edge cases.
 * Everything installs to ~/.hermes/ and ~/.local/ — survives SteamOS updates.
 */

import { execSync } from 'child_process';
import { mkdir, writeFile, readFile, access } from 'fs/promises';
import { sudoNoPassword, sudoExec } from './sudo';

export interface InstallResult {
  success: boolean;
  message: string;
}

/**
 * Run the official Hermes Agent install script non-interactively.
 * Installs to ~/.hermes/hermes-agent/ by default (non-root = survives updates).
 */
export async function installHermesAgent(homeDir: string): Promise<InstallResult> {
  try {
    const scriptUrl = 'https://hermes-agent.nousresearch.com/install.sh';
    const cmd = `curl -fsSL "${scriptUrl}" | bash -s -- --non-interactive --skip-setup`;

    execSync(cmd, {
      stdio: 'pipe',
      timeout: 120000,
      env: { ...process.env, HOME: homeDir },
    });

    // Verify installation
    const paths = [
      `${homeDir}/.hermes/hermes-agent/venv/bin/hermes`,
      `${homeDir}/.hermes/hermes-agent/bin/hermes`,
    ];

    for (const p of paths) {
      try {
        execSync(`test -x "${p}"`, { stdio: 'ignore' });
        return { success: true, message: `Hermes Agent installed` };
      } catch {}
    }

    return {
      success: false,
      message: 'Installer ran but could not find hermes binary. Check ~/.hermes/hermes-agent/',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Install failed: ${err.message || err}`,
    };
  }
}

/**
 * Ensure Node.js is available. Installs to ~/.local/ if missing.
 */
export async function ensureNodeJS(homeDir: string): Promise<InstallResult> {
  try {
    execSync('node --version', { stdio: 'pipe' });
    return { success: true, message: 'Node.js already installed' };
  } catch {
    // Not found, install
  }

  const localBin = `${homeDir}/.local/bin`;
  const nodeVersion = '22.12.0';
  const arch = process.arch === 'x64' ? 'x64' : 'arm64';
  const url = `https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}-linux-${arch}.tar.xz`;

  try {
    await mkdir(localBin, { recursive: true });
    const tmpDir = `/tmp/hermdeck-node-${Date.now()}`;
    await mkdir(tmpDir, { recursive: true });

    execSync(`curl -fsSL "${url}" -o "${tmpDir}/node.tar.xz"`, {
      stdio: 'pipe',
      timeout: 60000,
    });

    execSync(`tar -xf "${tmpDir}/node.tar.xz" -C "${tmpDir}"`, { stdio: 'pipe' });

    const extractedDir = `${tmpDir}/node-v${nodeVersion}-linux-${arch}`;
    execSync(`cp -r "${extractedDir}/bin/"* "${localBin}/"`, { stdio: 'pipe' });

    process.env.PATH = `${localBin}:${process.env.PATH}`;
    execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });

    // Add to .bashrc
    try {
      const bashrc = await readFile(`${homeDir}/.bashrc`, 'utf-8');
      if (!bashrc.includes('.local/bin')) {
        await writeFile(`${homeDir}/.bashrc`, `${bashrc}\nexport PATH="$HOME/.local/bin:$PATH"\n`);
      }
    } catch {
      await writeFile(`${homeDir}/.bashrc`, `export PATH="$HOME/.local/bin:$PATH"\n`);
    }

    return { success: true, message: `Node.js v${nodeVersion} installed to ~/.local/bin/` };
  } catch (err: any) {
    return { success: false, message: `Failed to install Node.js: ${err.message || err}` };
  }
}

/**
 * Ensure git is available. On SteamOS it's usually pre-installed.
 * If missing, handles the read-only filesystem dance.
 */
export async function ensureGit(homeDir: string): Promise<InstallResult> {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return { success: true, message: 'Git already installed' };
  } catch {
    // Git not found
  }

  try {
    // Check if sudo needs password
    if (sudoNoPassword()) {
      // No password needed — just run
      sudoExec('steamos-readonly disable');
      sudoExec('pacman -S --noconfirm git');
      sudoExec('steamos-readonly enable');
    } else {
      // Password is cached via the earlier sudo -v prompt
      sudoExec('steamos-readonly disable');
      sudoExec('pacman -S --noconfirm git');
      sudoExec('steamos-readonly enable');
    }

    execSync('git --version', { stdio: 'pipe' });
    return { success: true, message: 'Git installed via pacman' };
  } catch (err: any) {
    return {
      success: false,
      message: `Could not install git: ${err.message}. Try: sudo steamos-readonly disable && sudo pacman -S git && sudo steamos-readonly enable`,
    };
  }
}
