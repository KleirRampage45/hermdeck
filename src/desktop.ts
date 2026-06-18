/**
 * HermDeck — Desktop Integration
 *
 * Creates KDE Plasma desktop entries that survive SteamOS updates
 * (everything in ~/.local/share/applications/ is preserved).
 */

import { mkdir, writeFile } from 'fs/promises';

export interface DesktopResult {
  success: boolean;
  message: string;
}

/**
 * Create ~/.local/share/applications/hermes.desktop
 */
export async function setupDesktopEntries(homeDir: string): Promise<DesktopResult> {
  const appsDir = `${homeDir}/.local/share/applications`;
  await mkdir(appsDir, { recursive: true });

  // Find hermes binary
  const possiblePaths = [
    `${homeDir}/.hermes/hermes-agent/venv/bin/hermes`,
    `${homeDir}/.hermes/hermes-agent/bin/hermes`,
  ];

  let hermesBin = 'hermes'; // fallback
  const { access } = await import('fs/promises');
  for (const p of possiblePaths) {
    try {
      await access(p);
      hermesBin = p;
      break;
    } catch {}
  }

  // Create TUI launcher
  const desktopContent = `[Desktop Entry]
Name=Hermes Deck Agent
Comment=Chat with your Hermes AI agent on Steam Deck
Exec=konsole -e ${hermesBin}
Icon=utilities-terminal
Terminal=false
Type=Application
Categories=Utility;AI;
StartupNotify=true
`;

  await writeFile(`${appsDir}/hermes-deck.desktop`, desktopContent, 'utf-8');

  // Create gateway launcher (runs in background)
  const gatewayDesktopContent = `[Desktop Entry]
Name=Hermes Deck (Gateway)
Comment=Background Hermes Agent service for Steam Deck
Exec=${hermesBin} gateway
Terminal=false
Type=Application
Categories=Utility;AI;
StartupNotify=false
`;

  await writeFile(`${appsDir}/hermes-deck-gateway.desktop`, gatewayDesktopContent, 'utf-8');

  return {
    success: true,
    message: `Desktop entries created at ~/.local/share/applications/`,
  };
}
