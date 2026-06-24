import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/toon.js', () => ({
  toonError: vi.fn((msg: string) => { throw new Error(`toonError: ${msg}`); }),
}));

import { ytGet, ytPost, YtError } from '../src/client.js';
import type { Config } from '../src/config.js';

const config: Config = { url: 'https://yt.example.com', token: 'perm:abc' };

function makeFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => { vi.unstubAllGlobals(); });

describe('ytGet', () => {
  it('calls correct URL with fields and auth header', async () => {
    const fetchMock = makeFetch(200, { id: 'TW-1' });
    vi.stubGlobal('fetch', fetchMock);

    await ytGet(config, '/issues/TW-1', 'id,summary');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('https://yt.example.com/api/issues/TW-1');
    expect(url).toContain('fields=');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer perm:abc');
  });

  it('passes extra params to URL', async () => {
    const fetchMock = makeFetch(200, []);
    vi.stubGlobal('fetch', fetchMock);

    await ytGet(config, '/issues', 'id', { '$top': '10', query: 'foo bar' });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('query=foo+bar');
  });

  it('throws YtError on 404', async () => {
    vi.stubGlobal('fetch', makeFetch(404, { error: 'Not Found' }));
    await expect(ytGet(config, '/issues/NOPE-1', 'id')).rejects.toBeInstanceOf(YtError);
  });

  it('YtError has statusCode 404', async () => {
    vi.stubGlobal('fetch', makeFetch(404, {}));
    try {
      await ytGet(config, '/issues/NOPE', 'id');
    } catch (e) {
      expect(e).toBeInstanceOf(YtError);
      expect((e as YtError).statusCode).toBe(404);
    }
  });

  it('calls toonError on 401', async () => {
    vi.stubGlobal('fetch', makeFetch(401, { error_description: 'Invalid token' }));
    await expect(ytGet(config, '/issues', 'id')).rejects.toThrow('toonError');
  });

  it('calls toonError on 403', async () => {
    vi.stubGlobal('fetch', makeFetch(403, {}));
    await expect(ytGet(config, '/issues', 'id')).rejects.toThrow('toonError');
  });
});

describe('ytPost', () => {
  it('sends JSON body with POST method', async () => {
    const fetchMock = makeFetch(200, { id: 'TW-1' });
    vi.stubGlobal('fetch', fetchMock);

    await ytPost(config, '/issues', { summary: 'Test' }, 'id');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ summary: 'Test' }));
  });

  it('appends fields param when provided', async () => {
    const fetchMock = makeFetch(200, { id: 'TW-1' });
    vi.stubGlobal('fetch', fetchMock);

    await ytPost(config, '/issues', {}, 'id,summary');

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('fields=');
  });
});
