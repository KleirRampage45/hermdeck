/**
 * HermDeck — System Checks
 *
 * Verifies the Steam Deck environment before installation.
 */

import { execSync } from 'child_process';
import { readFile } from 'fs/promises';
import * as os from 'os';

export interface SystemInfo {
  isSteamOS: boolean;
  user: string;
  hasInternet: boolean;
  diskFreeGB: number;
  hasHermes: boolean;
  hasNode: boolean;
  nodeVersion: string;
  hasPython: boolean;
  hasGit: boolean;
  homeDir: string;
}

export async function checkSystem(): Promise<SystemInfo> {
  const homeDir = process.env.HOME || '/home/deck';
  return {
    isSteamOS: await detectSteamOS(),
    user: await getUser(),
    hasInternet: await checkInternet(),
    diskFreeGB: await getDiskFree(homeDir),
    hasHermes: await checkExistingHermes(homeDir),
    hasNode: await checkExists('node'),
    nodeVersion: await getVersion('node --version'),
    hasPython: await checkExists('python3'),
    hasGit: await checkExists('git'),
    homeDir,
  };
}

async function detectSteamOS(): Promise<boolean> {
  try {
    const release = await readFile('/etc/os-release', 'utf-8');
    return release.toLowerCase().includes('steamos');
  } catch {
    return false;
  }
}

async function getUser(): Promise<string> {
  try {
    return execSync('whoami', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

async function checkInternet(): Promise<boolean> {
  try {
    execSync('curl -s --connect-timeout 5 https://google.com > /dev/null 2>&1', {
      stdio: 'ignore',
      timeout: 8000,
    });
    return true;
  } catch {
    return false;
  }
}

async function getDiskFree(homeDir: string): Promise<number> {
  try {
    const out = execSync(`df -BG "${homeDir}"`, {
      encoding: 'utf-8',
      timeout: 5000,
    });
    const lines = out.trim().split('\n');
    const last = lines[lines.length - 1];
    const parts = last.split(/\s+/);
    // Format: Filesystem 1B-blocks Used Available Use% Mounted
    const availStr = parts[3];
    if (availStr?.endsWith('G')) {
      return parseFloat(availStr);
    }
    return parseFloat(availStr || '0');
  } catch {
    return -1;
  }
}

async function checkExistingHermes(homeDir: string): Promise<boolean> {
  try {
    await readFile(`${homeDir}/.hermes/config.yaml`, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

async function checkExists(cmd: string): Promise<boolean> {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function getVersion(cmd: string): Promise<string> {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 0) return 'unknown';
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}TB`;
  return `${bytes}GB`;
}
