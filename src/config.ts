/**
 * HermDeck — Configuration Wizard
 *
 * Interactive configuration for the Hermes Agent:
 * - LLM Provider (OpenRouter, local LM Studio, custom)
 * - API keys
 * - Telegram/Discord gateway tokens
 * - Writes ~/.hermes/config.yaml
 *
 * Uses ink's <TextInput> and <Select> components for interactivity.
 */

export interface HermDeckConfig {
  provider: {
    type: 'openrouter' | 'lm-studio' | 'custom';
    apiKey?: string;
    endpoint?: string;
    model?: string;
  };
  gateway: {
    type: 'none' | 'telegram' | 'discord' | 'both';
    telegramToken?: string;
    discordWebhook?: string;
  };
  sudoPassword?: string;
}

export function generateConfigYaml(config: HermDeckConfig): string {
  // Takes the user's choices and generates a valid Hermes config.yaml
  return '';
}

export function generateSystemdService(): string {
  // Generates the systemd user service file content
  return `[Unit]
Description=HermDeck — Hermes Agent for Steam Deck
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=%h/hermes-agent/venv/bin/hermes gateway
WorkingDirectory=%h/hermes-agent
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
`;
}

export function generateDesktopEntry(): string {
  // Generates the .desktop file for Hermes Desktop
  return `[Desktop Entry]
Name=Hermes Desktop
Comment=HermDeck — AI Agent for Steam Deck
Exec=%h/hermes-agent/venv/bin/hermes desktop
Terminal=false
Type=Application
Categories=Utility;AI;
`;
}
