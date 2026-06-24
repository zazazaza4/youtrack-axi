import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { toonError } from './toon.js';

export interface Config {
  url: string;
  token: string;
  defaultProject?: string;
}

export const CONFIG_PATH = join(homedir(), '.config', 'youtrack-axi', 'config.json');
const CONFIG_DIR = join(homedir(), '.config', 'youtrack-axi');

export async function loadConfig(): Promise<Config> {
  const envUrl = process.env['YOUTRACK_URL'];
  const envToken = process.env['YOUTRACK_TOKEN'];
  if (envUrl && envToken) {
    return { url: envUrl.replace(/\/$/, ''), token: envToken };
  }

  try {
    const raw = await readFile(CONFIG_PATH, 'utf-8');
    const cfg = JSON.parse(raw) as Config;
    cfg.url = cfg.url.replace(/\/$/, '');
    return cfg;
  } catch {
    toonError('not configured', 'Run `youtrack-axi setup`');
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}
