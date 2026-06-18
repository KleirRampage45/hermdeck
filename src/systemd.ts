/**
 * HermDeck — Systemd Service Management
 *
 * Creates and enables a user-scoped systemd service for Hermes Agent.
 * User services in ~/.config/systemd/user/ survive SteamOS updates.
 */

import { mkdir, writeFile } from 'fs/promises';
import { execSync } from 'child_process';

export interface ServiceResult {
  success: boolean;
  message: string;
}

/**
 * Write the systemd user service file and enable it.
 */
export async function setupService(homeDir: string): Promise<ServiceResult> {
  const serviceDir = `${homeDir}/.config/systemd/user`;
  await mkdir(serviceDir, { recursive: true });

  const serviceContent = `[Unit]
Description=HermDeck — Hermes Agent for Steam Deck
Documentation=https://github.com/KleirRampage45/hermdeck
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=${homeDir}/.hermes/hermes-agent/venv/bin/hermes gateway
WorkingDirectory=${homeDir}/.hermes/hermes-agent
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
`;

  await writeFile(`${serviceDir}/hermes-agent.service`, serviceContent, 'utf-8');

  try {
    // Reload systemd user daemon
    execSync('systemctl --user daemon-reload', { stdio: 'pipe', timeout: 10000 });
    // Enable at boot
    execSync('systemctl --user enable hermes-agent.service', {
      stdio: 'pipe',
      timeout: 10000,
    });
    // Start now
    execSync('systemctl --user start hermes-agent.service', {
      stdio: 'pipe',
      timeout: 10000,
    });

    return {
      success: true,
      message: 'Hermes Agent service created, enabled at boot, and started',
    };
  } catch (err: any) {
    // If it fails, it might be a desktop mode thing — still write the file
    return {
      success: true,
      message: `Service file written. Start manually: systemctl --user start hermes-agent.service`,
    };
  }
}

/**
 * Check if the Hermes Agent service is running.
 */
export function isServiceRunning(): boolean {
  try {
    execSync('systemctl --user is-active hermes-agent.service', {
      stdio: 'pipe',
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}
