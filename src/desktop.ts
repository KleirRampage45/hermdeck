/**
 * HermDeck — Desktop Integration
 *
 * Creates KDE Plasma desktop entries that survive SteamOS updates.
 * Searches for the hermes binary in multiple possible locations.
 */

import { mkdir, writeFile, access } from 'fs/promises';

export interface DesktopResult {
  success: boolean;
  message: string;
}

/**
 * Search multiple paths for the hermes binary, return first found.
 */
async function findHermesBin(homeDir: string): Promise<string> {
  const paths = [
    `${homeDir}/.hermes/hermes-agent/venv/bin/hermes`,
    `${homeDir}/.hermes/hermes-agent/bin/hermes`,
    `${homeDir}/.local/bin/hermes`,
    // System paths as last resort
    '/usr/local/bin/hermes',
    '/usr/bin/hermes',
  ];

  for (const p of paths) {
    try {
      await access(p);
      return p;
    } catch {}
  }

  // Fallback — just use 'hermes' and hope it's on PATH
  return 'hermes';
}

/**
 * Create ~/.local/share/applications/hermes-deck.desktop
 * and optionally launch Hermes Desktop after install.
 */
export async function setupDesktopEntries(
  homeDir: string,
  autoLaunch = false
): Promise<DesktopResult> {
  const appsDir = `${homeDir}/.local/share/applications`;
  await mkdir(appsDir, { recursive: true });

  const hermesBin = await findHermesBin(homeDir);

  // Use konsole -e so clicking opens a terminal with Hermes TUI
  // If hermes has a desktop mode, use that
  const desktopContent = `[Desktop Entry]
Name=Hermes Deck
Comment=AI Agent for Steam Deck — installed by HermDeck
Exec=${hermesBin} desktop
Icon=utilities-terminal
Terminal=false
Type=Application
Categories=Utility;AI;System;
StartupNotify=true
X-KDE-StartupNotify=true
`;

  await writeFile(`${appsDir}/hermes-deck.desktop`, desktopContent, 'utf-8');

  // Also create a TUI shortcut (opens in terminal)
  const tuiContent = `[Desktop Entry]
Name=Hermes Deck (Terminal)
Comment=Open Hermes Agent TUI in Konsole
Exec=konsole -e ${hermesBin}
Icon=utilities-terminal
Terminal=false
Type=Application
Categories=Utility;AI;System;
StartupNotify=true
X-KDE-StartupNotify=true
`;

  await writeFile(`${appsDir}/hermes-deck-tui.desktop`, tuiContent, 'utf-8');

  let message = `Desktop entries created at ~/.local/share/applications/`;
  message += `\n  → "Hermes Deck" in your app menu`;

  return { success: true, message };
}
