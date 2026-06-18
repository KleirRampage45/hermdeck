/**
 * HermDeck — Systemd Service Setup
 *
 * Writes and enables the Hermes Agent systemd user service.
 *
 * Paths:
 *   Service file: ~/.config/systemd/user/hermes-agent.service
 *   Enable: systemctl --user enable hermes-agent.service
 *   Start: systemctl --user start hermes-agent.service
 */

export interface ServiceResult {
  success: boolean;
  message: string;
  enabled: boolean;
  running: boolean;
}

export async function setupService(): Promise<ServiceResult> {
  return { success: false, message: 'Not implemented yet', enabled: false, running: false };
}

export async function startService(): Promise<boolean> {
  return false;
}

export async function stopService(): Promise<boolean> {
  return false;
}

export async function isServiceRunning(): Promise<boolean> {
  return false;
}
