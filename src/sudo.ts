/**
 * HermDeck — Sudo Helper
 *
 * Handles sudo password prompting for SteamOS read-only filesystem operations.
 * Never stores the password — uses sudo -v to cache credentials temporarily.
 */

import { execSync } from 'child_process';
import * as readline from 'readline';

/**
 * Check if the current user can run sudo without a password.
 * `sudo -n` runs sudo in non-interactive mode — fails if password needed.
 */
export function sudoNoPassword(): boolean {
  try {
    execSync('sudo -n true', { stdio: 'ignore', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Prompt user for sudo password, validate it, and cache credentials.
 * Returns true if we got valid sudo access, false if user cancelled.
 *
 * Uses sudo -v which validates the password and caches it for ~5 minutes
 * (sudo's default timestamp_timeout). All subsequent sudo commands within
 * that window won't need a password.
 */
export async function promptAndCacheSudo(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askPassword = (): Promise<string> =>
    new Promise((resolve) => {
      // Readline question without echo — basic hidden input
      const stdin = process.stdin;
      const stdout = process.stdout;

      stdout.write('\x1b[33m  › Sudo password (needed for read-only filesystem): \x1b[0m');

      // Temporarily disable echo on stdin
      const isRaw = stdin.isRaw;
      stdin.setRawMode?.(true);
      stdin.resume();

      let password = '';
      const onData = (chunk: Buffer) => {
        const char = chunk.toString();
        if (char === '\r' || char === '\n') {
          stdin.removeListener('data', onData);
          stdin.setRawMode?.(isRaw ? true : false);
          stdin.pause();
          stdout.write('\n');
          resolve(password);
        } else if (char === '\x7f' || char === '\b') {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
        } else if (char === '\x03') {
          // Ctrl+C
          stdin.removeListener('data', onData);
          stdin.setRawMode?.(isRaw ? true : false);
          stdin.pause();
          resolve('');
        } else {
          password += char;
          stdout.write('*');
        }
      };
      stdin.on('data', onData);
    });

  const password = await askPassword();

  if (!password) {
    rl.close();
    return false;
  }

  // Validate password with sudo -v (caches credentials if valid)
  try {
    execSync(`echo "${password}" | sudo -S -v`, {
      stdio: 'pipe',
      timeout: 5000,
    });
    rl.close();
    return true;
  } catch {
    console.log('  \x1b[31m✗ Incorrect password. Try again or skip sudo operations.\x1b[0m');
    rl.close();
    return false;
  }
}

/**
 * Run a command with sudo. If we have cached credentials (via sudo -v),
 * the passwordless sudo will work automatically.
 * If password was provided, use sudo -S for piping.
 *
 * This function is intentionally simple — it relies on sudo's built-in
 * credential caching after sudo -v has been called.
 */
export function sudoExec(command: string): string {
  const result = execSync(`sudo ${command}`, {
    stdio: 'pipe',
    timeout: 60000,
  });
  return result.toString();
}
