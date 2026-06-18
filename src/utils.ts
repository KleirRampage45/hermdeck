/**
 * HermDeck — Shared Utilities
 */

import * as fs from 'fs';

/**
 * Get a readable stdin stream, even when running under curl | sh.
 * Falls back to /dev/tty when stdin is not a TTY (piped context).
 */
export function getStdin(): NodeJS.ReadStream {
  if (process.stdin.isTTY) return process.stdin;
  try {
    const tty = fs.createReadStream('/dev/tty');
    return tty as unknown as NodeJS.ReadStream;
  } catch {
    return process.stdin;
  }
}
