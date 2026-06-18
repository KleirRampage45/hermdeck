/**
 * HermDeck — Terminal UI (Ink/React)
 *
 * The main interactive interface. Renders a multi-step installation wizard
 * using Ink (React for the terminal).
 *
 * Steps:
 *   0. Welcome / splash
 *   1. System checks (with animated spinner per check)
 *   2. Dependency installation (progress bars)
 *   3. Hermes Agent installation (progress bars)
 *   4. Configuration (interactive prompts)
 *   5. Service setup (animated spinner)
 *   6. Done! (celebration screen)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useApp } from 'ink';
// import Spinner from 'ink-spinner';  // TODO: install

// ── Types ──────────────────────────────────────────────

type Step = 'welcome' | 'checks' | 'deps' | 'install' | 'config' | 'service' | 'done';

interface HermDeckAppProps {
  flags: {
    yes: boolean;
    sudoPassword?: string;
    token?: string;
  };
}

interface CheckItem {
  name: string;
  status: 'pending' | 'running' | 'pass' | 'fail' | 'warn';
  message: string;
}

// ── Main App ───────────────────────────────────────────

export function HermDeckApp({ flags }: HermDeckAppProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [checks, setChecks] = useState<CheckItem[]>([]);

  const nextStep = useCallback(() => {
    setStep((s) => {
      const order: Step[] = ['welcome', 'checks', 'deps', 'install', 'config', 'service', 'done'];
      const idx = order.indexOf(s);
      return order[Math.min(idx + 1, order.length - 1)];
    });
  }, []);

  switch (step) {
    case 'welcome':
      return <WelcomeScreen onContinue={() => nextStep()} />;
    case 'checks':
      return <ChecksScreen checks={checks} setChecks={setChecks} onComplete={() => nextStep()} />;
    case 'deps':
      return <DepsScreen onComplete={() => nextStep()} />;
    case 'install':
      return <InstallScreen onComplete={() => nextStep()} />;
    case 'config':
      return <ConfigScreen onComplete={() => nextStep()} />;
    case 'service':
      return <ServiceScreen onComplete={() => nextStep()} />;
    case 'done':
      return <DoneScreen />;
    default:
      return <Text>Loading...</Text>;
  }
}

// ── Welcome Screen ─────────────────────────────────────

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 1500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Text bold color="cyan">
        ╔══════════════════════════════════════════╗
      </Text>
      <Text bold color="cyan">
        ║          🎮 HermDeck v0.1.0              ║
      </Text>
      <Text bold color="cyan">
        ║     "Deck your agent in one command"     ║
      </Text>
      <Text bold color="cyan">
        ╚══════════════════════════════════════════╝
      </Text>
      <Box marginTop={1}>
        <Text dimColor>One-command Hermes Agent for Steam Deck</Text>
      </Box>
    </Box>
  );
}

// ── System Checks Screen ───────────────────────────────

function ChecksScreen({
  checks,
  setChecks,
  onComplete,
}: {
  checks: CheckItem[];
  setChecks: React.Dispatch<React.SetStateAction<CheckItem[]>>;
  onComplete: () => void;
}) {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { runChecks } = await import('./checks.js');

      const items: CheckItem[] = [
        { name: 'SteamOS', status: 'pending', message: '' },
        { name: 'User', status: 'pending', message: '' },
        { name: 'Internet', status: 'pending', message: '' },
        { name: 'Disk space', status: 'pending', message: '' },
        { name: 'Node.js', status: 'pending', message: '' },
        { name: 'Python 3', status: 'pending', message: '' },
        { name: 'Git', status: 'pending', message: '' },
      ];

      setChecks(items);

      const results = await runChecks();

      if (cancelled) return;

      // Animate through each check
      for (let i = 0; i < results.length; i++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 200));
        setChecks((prev) =>
          prev.map((c, idx) =>
            idx === i
              ? {
                  name: results[idx].name,
                  status: results[idx].status as CheckItem['status'],
                  message: results[idx].message,
                }
              : c
          )
        );
      }

      // Pause then advance
      await new Promise((r) => setTimeout(r, 800));
      if (!cancelled) onComplete();
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="cyan">
        {'[1/6]'} System Checks
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {checks.map((check, i) => (
          <CheckRow key={i} check={check} />
        ))}
      </Box>
    </Box>
  );
}

function CheckRow({ check }: { check: CheckItem }) {
  let icon: string;
  let color: string;

  switch (check.status) {
    case 'pending':
      icon = '○';
      color = 'dim';
      break;
    case 'running':
      icon = '◌';
      color = 'yellow';
      break;
    case 'pass':
      icon = '✓';
      color = 'green';
      break;
    case 'fail':
      icon = '✗';
      color = 'red';
      break;
    case 'warn':
      icon = '⚠';
      color = 'yellow';
      break;
  }

  return (
    <Box>
      <Text color={color}>{icon}</Text>
      <Text>
        {' '}
        <Text bold>{check.name}:</Text>{' '}
        {check.status === 'pending' ? (
          <Text dimColor>waiting...</Text>
        ) : check.status === 'running' ? (
          <Text color="yellow">checking...</Text>
        ) : (
          <Text color={color}>{check.message}</Text>
        )}
      </Text>
    </Box>
  );
}

// ── Dependency Installation Screen ─────────────────────

function DepsScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="cyan">
        {'[2/6]'} Installing Dependencies
      </Text>
      <Box marginTop={1}>
        <Text color="yellow">◌</Text>
        <Text> Node.js... </Text>
        <Text dimColor>(installing to ~/.local/ — survives updates)</Text>
      </Box>
      <Box marginY={1}>
        <Text color="green">
          {'  '.repeat(5)}[████████░░░░░░░░] 50%
        </Text>
      </Box>
    </Box>
  );
}

// ── Hermes Install Screen ──────────────────────────────

function InstallScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="cyan">
        {'[3/6]'} Installing Hermes Agent
      </Text>
      <Box marginTop={1}>
        <Text color="yellow">◌</Text>
        <Text> Cloning NousResearch/hermes-agent...</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="yellow">◌</Text>
        <Text> Creating Python virtual environment...</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="yellow">◌</Text>
        <Text> Installing packages...</Text>
      </Box>
    </Box>
  );
}

// ── Configuration Screen ───────────────────────────────

function ConfigScreen({ onComplete }: { onComplete: () => void }) {
  const [providerChoice, setProviderChoice] = useState<number | null>(null);
  const [telegramToken, setTelegramToken] = useState('');

  // TODO: Replace with actual ink Select/TextInput components
  useEffect(() => {
    // For now, auto-advance to show the flow
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="cyan">
        {'[4/6]'} Configuration
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text bold>LLM Provider:</Text>
        <Text dimColor>  1) OpenRouter (free tier, no setup ← RECOMMENDED)</Text>
        <Text dimColor>  2) Link to your desktop's LM Studio (via Tailscale)</Text>
        <Text dimColor>  3) Custom API endpoint</Text>
        <Text color="cyan">   {'>'} 1</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold>Gateway (how you talk to it):</Text>
        <Text dimColor>  1) Telegram bot (chat from anywhere ⭐)</Text>
        <Text dimColor>  2) Discord webhook</Text>
        <Text dimColor>  3) Skip (CLI-only for now)</Text>
        <Text color="cyan">   {'>'} 1</Text>
      </Box>

      <Box marginTop={1}>
        <Text bold>Telegram bot token: </Text>
        <Text dimColor>________________</Text>
      </Box>
    </Box>
  );
}

// ── Service Setup Screen ───────────────────────────────

function ServiceScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="cyan">
        {'[5/6]'} Setting Up Services
      </Text>
      <Box marginTop={1}>
        <Text color="green">✓</Text>
        <Text> Writing systemd user service... </Text>
        <Text dimColor>~/.config/systemd/user/hermes-agent.service</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="green">✓</Text>
        <Text> Enabling service at boot...</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="yellow">◌</Text>
        <Text> Starting Hermes Agent...</Text>
      </Box>
    </Box>
  );
}

// ── Done Screen ────────────────────────────────────────

function DoneScreen() {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="green">
        {'[6/6]'} ✅ HermDeck Complete!
      </Text>

      <Box marginTop={1} flexDirection="column">
        <Text bold color="cyan">→</Text>
        <Text> Chat with your Deck agent on Telegram: @YourBot</Text>
      </Box>
      <Box flexDirection="column">
        <Text bold color="cyan">→</Text>
        <Text> Konsole: type </Text>
        <Text bold>hermes</Text>
        <Text> for the TUI</Text>
      </Box>
      <Box flexDirection="column">
        <Text bold color="cyan">→</Text>
        <Text> App Menu: "Hermes Desktop" for GUI</Text>
      </Box>

      <Box marginTop={1} flexDirection="column" borderStyle="round" paddingX={1}>
        <Text bold color="green">📌 This agent SURVIVES SteamOS updates.</Text>
        <Text bold color="green">📌 Auto-starts when your Deck boots.</Text>
        <Text bold color="green">📌 Reconnects after sleep/wake.</Text>
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text dimColor>──────────────────────────────────</Text>
        <Text dimColor>📢 Next: Install Tailscale to link your</Text>
        <Text dimColor>   desktop and Deck agents together!</Text>
        <Text dimColor>   github.com/KleirRampage45/hermdeck</Text>
      </Box>
    </Box>
  );
}
