/**
 * HermDeck — Configuration Generation
 *
 * Generates ~/.hermes/config.yaml with provider + gateway settings.
 */

import { mkdir, writeFile } from 'fs/promises';
import * as readline from 'readline';

const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

export interface HermDeckConfig {
  telegramToken?: string;
  discordWebhook?: string;
  provider: 'openrouter' | 'lm-studio' | 'custom';
  providerUrl?: string;
  providerKey?: string;
  providerModel?: string;
}

export async function configWizard(homeDir: string): Promise<HermDeckConfig> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => rl.question(question, resolve));

  const config: HermDeckConfig = { provider: 'openrouter' };

  console.log(cyan('\n  ── Provider Configuration ──\n'));
  console.log('  Your Hermes agent needs an LLM to think.');
  console.log('  Choose how it connects:\n');
  console.log(dim('  1) OpenRouter — free tier, works immediately (RECOMMENDED)'));
  console.log(dim("  2) Link to your desktop's LM Studio — run local models"));
  console.log(dim('  3) Custom API endpoint — any OpenAI-compatible API\n'));

  const providerChoice = await ask(cyan('  › Choice [1]: '));
  const providerNum = parseInt(providerChoice) || 1;

  if (providerNum === 2) {
    config.provider = 'lm-studio';
    const url = await ask(cyan('  › LM Studio URL [http://localhost:1234/v1]: '));
    config.providerUrl = url || 'http://localhost:1234/v1';
  } else if (providerNum === 3) {
    config.provider = 'custom';
    config.providerUrl = await ask(cyan('  › API endpoint URL: '));
    config.providerKey = await ask(cyan('  › API key (leave blank if none): '));
    config.providerModel = await ask(cyan('  › Model name: '));
  } else {
    config.provider = 'openrouter';
    config.providerKey = await ask(cyan('  › OpenRouter API key (optional, get at openrouter.ai): '));
  }

  console.log(cyan('\n  ── Gateway Configuration ──\n'));
  console.log('  A gateway lets you chat with your agent from anywhere.\n');
  console.log(dim('  1) Telegram — chat with it via a bot ⭐'));
  console.log(dim('  2) Discord — use a webhook'));
  console.log(dim('  3) Skip — CLI-only for now\n'));

  const gatewayChoice = await ask(cyan('  › Choice [3]: '));
  const gatewayNum = parseInt(gatewayChoice) || 3;

  if (gatewayNum === 1) {
    config.telegramToken = await ask(cyan('  › Telegram bot token (from @BotFather): '));
  } else if (gatewayNum === 2) {
    config.discordWebhook = await ask(cyan('  › Discord webhook URL: '));
  }

  rl.close();
  return config;
}

export async function writeHermesConfig(
  homeDir: string,
  config: HermDeckConfig
): Promise<void> {
  const configDir = `${homeDir}/.hermes`;
  await mkdir(configDir, { recursive: true });

  let yaml = `# Hermes Agent — Auto-configured by HermDeck
agent:
  name: "SteamDeck"
  model: "openrouter/meta-llama/llama-3.3-70b-instruct"
  context_length: 128000
  skills_dir: "${homeDir}/.hermes/skills"
  memories_dir: "${homeDir}/.hermes/memories"

gateways:
`;

  if (config.telegramToken) {
    yaml += `  telegram:
    bot_token: "${config.telegramToken}"
`;
  }
  if (config.discordWebhook) {
    yaml += `  discord:
    webhook_url: "${config.discordWebhook}"
`;
  }

  yaml += `
providers:
  openrouter:
    api_key: "${config.providerKey || ''}"
    models:
      - name: "openrouter/meta-llama/llama-3.3-70b-instruct"
      - name: "openrouter/anthropic/claude-sonnet-4"
`;

  if (config.provider === 'lm-studio') {
    yaml += `
  local:
    api_base: "${config.providerUrl || 'http://localhost:1234/v1'}"
    models:
      - name: "local/gemma-4-12b"
`;
  } else if (config.provider === 'custom') {
    yaml += `
  custom:
    api_base: "${config.providerUrl || ''}"
    api_key: "${config.providerKey || ''}"
    models:
      - name: "${config.providerModel || 'custom-model'}"
`;
  }

  await writeFile(`${configDir}/config.yaml`, yaml, 'utf-8');
}
