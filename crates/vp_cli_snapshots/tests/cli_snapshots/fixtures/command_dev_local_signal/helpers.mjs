import assert from 'node:assert/strict';
import { existsSync, writeSync } from 'node:fs';
import { delimiter, resolve } from 'node:path';
import { inspect } from 'node:util';

/** The project-local `vp` launcher, which the local flavor puts first on PATH. */
export function localLauncher() {
  const launcher = process.env.PATH.split(delimiter)
    .map((directory) => resolve(directory, 'vp'))
    .find(existsSync);
  assert.ok(launcher, 'expected the project-local vp launcher on PATH');
  return launcher;
}

/** Parse the `listening <port> <pid>` line that vite.config.mjs prints. */
export function parseListening(line) {
  const match = /^listening (\d+) (\d+)$/.exec(line);
  return match ? { port: Number(match[1]), pid: Number(match[2]) } : undefined;
}

/**
 * Report a probe failure and stop the probe's process group. The runner starts
 * the probe in its own group, so this also stops a Vite process that outlived
 * its launcher, and the runner does not wait for that process's pipes.
 */
export function failAndStopGroup(error) {
  // Write synchronously, because SIGKILL drops output that is still queued.
  writeSync(2, `${inspect(error)}\n`);
  process.kill(-process.pid, 'SIGKILL');
}
