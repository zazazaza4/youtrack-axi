import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('../src/toon.js', () => ({
  toonError: vi.fn((msg: string) => { throw new Error(`toonError: ${msg}`); }),
}));

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { loadConfig, saveConfig } from '../src/config.js';

const mockReadFile = vi.mocked(readFile);
const mockWriteFile = vi.mocked(writeFile);
const mockMkdir = vi.mocked(mkdir);

describe('loadConfig', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => {
    delete process.env['YOUTRACK_URL'];
    delete process.env['YOUTRACK_TOKEN'];
  });

  it('returns config from env vars when both set', async () => {
    process.env['YOUTRACK_URL'] = 'https://yt.example.com/';
    process.env['YOUTRACK_TOKEN'] = 'perm:abc123';
    const cfg = await loadConfig();
    expect(cfg.url).toBe('https://yt.example.com');
    expect(cfg.token).toBe('perm:abc123');
  });

  it('strips trailing slash from env URL', async () => {
    process.env['YOUTRACK_URL'] = 'https://yt.example.com/';
    process.env['YOUTRACK_TOKEN'] = 'perm:abc';
    const cfg = await loadConfig();
    expect(cfg.url).toBe('https://yt.example.com');
  });

  it('reads from config file when env vars absent', async () => {
    mockReadFile.mockResolvedValue(
      JSON.stringify({ url: 'https://yt.example.com/', token: 'perm:xyz', defaultProject: 'TW' }) as unknown as string
    );
    const cfg = await loadConfig();
    expect(cfg.url).toBe('https://yt.example.com');
    expect(cfg.token).toBe('perm:xyz');
    expect(cfg.defaultProject).toBe('TW');
  });

  it('calls toonError when config file missing', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT'));
    await expect(loadConfig()).rejects.toThrow('toonError: not configured');
  });
});

describe('saveConfig', () => {
  it('creates config dir and writes JSON', async () => {
    mockMkdir.mockResolvedValue(undefined as unknown as string);
    mockWriteFile.mockResolvedValue(undefined);
    await saveConfig({ url: 'https://yt.example.com', token: 'perm:abc', defaultProject: 'TW' });
    expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining('youtrack-axi'), { recursive: true });
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('config.json'),
      expect.stringContaining('"url"'),
      'utf-8'
    );
  });
});
