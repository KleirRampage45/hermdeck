/**
 * HermDeck — Hermes Agent Installation
 *
 * Uses the official Nous Research install script, handles SteamOS edge cases.
 * Everything installs to ~/.hermes/ and ~/.local/ — survives SteamOS updates.
 */

import { execSync, spawn } from 'child_process';
import { mkdir, writeFile, readFile } from 'fs/promises';
import * as path from 'path';

export interface InstallResult {
  success: boolean;
  message: string;
}

/**
 * Run the official Hermes Agent install script non-interactively.
 * Installs to ~/.hermes/hermes-agent/ by default (non-root = survives updates).
 */
export async function installHermesAgent(
  homeDir: string,
  onProgress?: (msg: string) => void
): Promise<InstallResult> {
  onProgress?.('Downloading and running Hermes Agent installer...');

  try {
    // The official script installs to ~/.hermes/hermes-agent/ when run as non-root
    const scriptUrl = 'https://hermes-agent.nousresearch.com/install.sh';
    const cmd = `curl -fsSL "${scriptUrl}" | bash -s -- --non-interactive --skip-setup`;

    execSync(cmd, {
      stdio: 'pipe',
      timeout: 120000, // 2 min
      env: { ...process.env, HOME: homeDir },
    });

    // Verify installation
    const hermesBin = `${homeDir}/.hermes/hermes-agent/venv/bin/hermes`;
    try {
      execSync(`test -x "${hermesBin}"`, { stdio: 'ignore' });
      return {
        success: true,
        message: `Hermes Agent installed at ${homeDir}/.hermes/hermes-agent/`,
      };
    } catch {
      // Try fallback path
      const altBin = `${homeDir}/.hermes/hermes-agent/bin/hermes`;
      try {
        execSync(`test -x "${altBin}"`, { stdio: 'ignore' });
        return {
          success: true,
          message: `Hermes Agent installed at ${homeDir}/.hermes/hermes-agent/`,
        };
      } catch {
        return {
          success: false,
          message: 'Installer ran but could not find hermes binary. Check ~/.hermes/hermes-agent/',
        };
      }
    }
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
export async function ensureNodeJS(
  homeDir: string,
  onProgress?: (msg: string) => void
): Promise<InstallResult> {
  // Check if node is already available
  try {
    execSync('node --version', { stdio: 'pipe' });
    return { success: true, message: 'Node.js already installed' };
  } catch {
    // Not found, install to ~/.local/
  }

  onProgress?.('Installing Node.js to ~/.local/ (survives updates)...');

  const localBin = `${homeDir}/.local/bin`;
  const nodeVersion = '22.4.1';
  const arch = process.arch === 'x64' ? 'x64' : 'arm64';
  const url = `https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}-linux-${arch}.tar.xz`;

  try {
    await mkdir(localBin, { recursive: true });

    // Download
    const tmpDir = `/tmp/hermdeck-node-${Date.now()}`;
    await mkdir(tmpDir, { recursive: true });

    execSync(`curl -fsSL "${url}" -o "${tmpDir}/node.tar.xz"`, {
      stdio: 'pipe',
      timeout: 60000,
    });

    onProgress?.('Extracting...');
    execSync(`tar -xf "${tmpDir}/node.tar.xz" -C "${tmpDir}"`, { stdio: 'pipe' });

    const extractedDir = `${tmpDir}/node-v${nodeVersion}-linux-${arch}`;
    execSync(`cp -r "${extractedDir}/bin/"* "${localBin}/"`, { stdio: 'pipe' });

    // Add to PATH for this process
    process.env.PATH = `${localBin}:${process.env.PATH}`;

    // Cleanup
    execSync(`rm -rf "${tmpDir}"`, { stdio: 'pipe' });

    // Add to .bashrc if not already there
    const bashrc = `${homeDir}/.bashrc`;
    try {
      const rcContent = await readFile(bashrc, 'utf-8');
      if (!rcContent.includes('.local/bin')) {
        await writeFile(bashrc, `${rcContent}\nexport PATH="$HOME/.local/bin:$PATH"\n`);
      }
    } catch {
      await writeFile(bashrc, `export PATH="$HOME/.local/bin:$PATH"\n`);
    }

    return {
      success: true,
      message: `Node.js v${nodeVersion} installed to ~/.local/bin/`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to install Node.js: ${err.message || err}`,
    };
  }
}

/**
 * Ensure git is available. On SteamOS it's usually pre-installed,
 * but if not, we try to install or guide the user.
 */
export async function ensureGit(
  homeDir: string,
  onProgress?: (msg: string) => void
): Promise<InstallResult> {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return { success: true, message: 'Git already installed' };
  } catch {
    // Git not found
  }

  onProgress?.('Git not found. Attempting to install...');

  // Try static git binary to ~/.local/bin/
  const localBin = `${homeDir}/.local/bin`;
  try {
    await mkdir(localBin, { recursive: true });

    // Download git portable binary
    const arch = process.arch === 'x64' ? 'x86_64' : 'aarch64';
    const gitUrl = `https://github.com/git-for-windows/git/releases/download/v2.45.1.windows.1/PortableGit-2.45.1-64-bit.7z.exe`;
    // Better approach: use the Arch package but with read-only workaround
    // Actually the simplest: offer to temporarily disable read-only and pacman install
    onProgress?.('Please enter your sudo password to temporarily disable read-only filesystem:');

    // Try steamos-readonly disable + pacman
    try {
      execSync('sudo steamos-readonly disable 2>/dev/null', { stdio: 'pipe', timeout: 10000 });
      execSync('sudo pacman -S --noconfirm git 2>/dev/null', {
        stdio: 'pipe',
        timeout: 30000,
      });
      execSync('sudo steamos-readonly enable 2>/dev/null', { stdio: 'pipe' });
      execSync('git --version', { stdio: 'pipe' });
      return { success: true, message: 'Git installed via pacman' };
    } catch {
      return {
        success: false,
        message: 'Could not install git automatically. Please run: sudo steamos-readonly disable && sudo pacman -S git && sudo steamos-readonly enable',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Git install failed: ${err.message}`,
    };
  }
}
