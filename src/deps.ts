/**
 * HermDeck — Dependency Installation
 *
 * Installs missing dependencies to user-space paths (~/.local/).
 * NEVER uses pacman unless absolutely necessary (and prompts for sudo).
 *
 * Dependencies:
 *   - Node.js → tarball from nodejs.org to ~/.local/
 *   - Git → pacman (requires sudo, rare — SteamOS usually has git)
 *   - Python venv → pip install to ~/hermes-agent/venv/
 */

export interface DepInstallResult {
  name: string;
  success: boolean;
  message: string;
}

export async function installNodeJS(progress: (pct: number) => void): Promise<DepInstallResult> {
  // Downloads Node.js LTS tarball to ~/.local/bin/
  // Architecture: x64 (Steam Deck is x86_64)
  // Version: LTS (currently 22.x)
  //
  // Steps:
  //   1. curl https://nodejs.org/dist/v22.x/node-v22.x-linux-x64.tar.xz
  //   2. Extract to /tmp
  //   3. Copy bin/* to ~/.local/bin/
  //   4. Copy lib/* to ~/.local/lib/
  //   5. Add ~/.local/bin to PATH in .bashrc
  //   6. Verify node --version
  //
  // This is the same approach nvm uses — pure user-space, survives updates.

  return { name: 'Node.js', success: false, message: 'Not implemented yet' };
}

export async function installGit(progress: (pct: number) => void): Promise<DepInstallResult> {
  // SteamOS usually has git. If not:
  // 1. Prompt user for sudo (steamos-readonly disable)
  // 2. sudo pacman -S git
  // 3. sudo steamos-readonly enable
  // 4. Or build from source to ~/.local/

  return { name: 'Git', success: false, message: 'Not implemented yet' };
}

export async function ensurePip(): Promise<DepInstallResult> {
  // Python 3 comes with SteamOS. Ensure pip is available:
  // python3 -m ensurepip || python3 -m pip install --upgrade pip
  return { name: 'pip', success: false, message: 'Not implemented yet' };
}
