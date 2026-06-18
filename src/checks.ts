/**
 * HermDeck — System Checks
 *
 * Verifies the environment before installation:
 * - SteamOS detection
 * - User is 'deck'
 * - Internet connectivity
 * - Disk space
 * - Existing Hermes installation
 */

export interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

export interface SystemInfo {
  isSteamOS: boolean;
  user: string;
  hasInternet: boolean;
  diskFreeGB: number;
  hasHermes: boolean;
  hasNode: boolean;
  nodeVersion: string | null;
  hasPython: boolean;
  pythonVersion: string | null;
  hasGit: boolean;
}

export async function checkSystem(): Promise<SystemInfo> {
  return {
    isSteamOS: await detectSteamOS(),
    user: await getUser(),
    hasInternet: await checkInternet(),
    diskFreeGB: await getDiskFree(),
    hasHermes: await checkExistingHermes(),
    hasNode: await checkCommand('node'),
    nodeVersion: await getVersion('node --version'),
    hasPython: await checkCommand('python3'),
    pythonVersion: await getVersion('python3 --version'),
    hasGit: await checkCommand('git'),
  };
}

async function detectSteamOS(): Promise<boolean> {
  try {
    const osRelease = await readFile('/etc/os-release');
    return osRelease.toLowerCase().includes('steamos');
  } catch {
    return false;
  }
}

async function getUser(): Promise<string> {
  try {
    const { execSync } = await import('child_process');
    return execSync('whoami').toString().trim();
  } catch {
    return 'unknown';
  }
}

async function checkInternet(): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    execSync('curl -s --connect-timeout 5 https://google.com > /dev/null');
    return true;
  } catch {
    return false;
  }
}

async function getDiskFree(): Promise<number> {
  try {
    const { execSync } = await import('child_process');
    const home = execSync('df -BG /home 2>/dev/null || df -BG ~').toString();
    const match = home.match(/(\d+)G\s+(\d+)G\s+(\d+)G/);
    if (match) return parseInt(match[3]);
    return -1;
  } catch {
    return -1;
  }
}

async function checkExistingHermes(): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    await fs.access(`${process.env.HOME}/.hermes/config.yaml`);
    return true;
  } catch {
    return false;
  }
}

async function checkCommand(cmd: string): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function getVersion(cmd: string): Promise<string | null> {
  try {
    const { execSync } = await import('child_process');
    return execSync(cmd).toString().trim();
  } catch {
    return null;
  }
}

async function readFile(path: string): Promise<string> {
  const fs = await import('fs/promises');
  return fs.readFile(path, 'utf-8');
}

/**
 * Returns an array of check results for display in the TUI.
 */
export async function runChecks(): Promise<CheckResult[]> {
  const info = await checkSystem();
  return [
    {
      name: 'SteamOS',
      status: info.isSteamOS ? 'pass' : 'warn',
      message: info.isSteamOS ? 'SteamOS detected' : 'Not detected as SteamOS (proceeding anyway)',
    },
    {
      name: 'User',
      status: info.user === 'deck' ? 'pass' : 'warn',
      message: info.user === 'deck' ? 'Running as deck' : `Running as '${info.user}' (expected 'deck')`,
    },
    {
      name: 'Internet',
      status: info.hasInternet ? 'pass' : 'fail',
      message: info.hasInternet ? 'Connected' : 'No internet connection detected',
    },
    {
      name: 'Disk space',
      status: info.diskFreeGB >= 2 ? 'pass' : info.diskFreeGB >= 0.5 ? 'warn' : 'fail',
      message: info.diskFreeGB >= 0 ? `${info.diskFreeGB}GB free on /home` : 'Could not check disk space',
    },
    {
      name: 'Node.js',
      status: info.hasNode ? 'pass' : 'warn',
      message: info.hasNode ? `Found: ${info.nodeVersion}` : 'Not found (will install)',
    },
    {
      name: 'Python 3',
      status: info.hasPython ? 'pass' : 'fail',
      message: info.hasPython ? `Found: ${info.pythonVersion}` : 'Not found',
    },
    {
      name: 'Git',
      status: info.hasGit ? 'pass' : 'warn',
      message: info.hasGit ? 'Found' : 'Not found (will install)',
    },
    {
      name: 'Existing Hermes',
      status: info.hasHermes ? 'warn' : 'pass',
      message: info.hasHermes
        ? 'Hermes config found at ~/.hermes/ (will upgrade)'
        : 'Fresh install',
    },
  ];
}
