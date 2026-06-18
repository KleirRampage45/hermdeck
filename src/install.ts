/**
 * HermDeck — Hermes Agent Installation
 *
 * Clones and installs Hermes Agent to ~/hermes-agent/.
 *
 * Steps:
 *   1. git clone https://github.com/NousResearch/hermes-agent.git ~/hermes-agent
 *   2. python3 -m venv ~/hermes-agent/venv
 *   3. ~/hermes-agent/venv/bin/pip install -e ~/hermes-agent/
 *   4. Verify hermes binary works
 */

export interface InstallResult {
  success: boolean;
  message: string;
  hermesPath?: string;
}

export async function installHermesAgent(progress: (pct: number) => void): Promise<InstallResult> {
  return { success: false, message: 'Not implemented yet' };
}
