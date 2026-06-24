import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/client.js', () => ({
  ytGet: vi.fn(),
  ytPost: vi.fn(),
  YtError: class YtError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;
      this.name = 'YtError';
    }
  },
}));

vi.mock('../../src/toon.js', () => ({
  Toon: vi.fn().mockImplementation(() => ({
    scalar: vi.fn().mockReturnThis(),
    blank: vi.fn().mockReturnThis(),
    array: vi.fn().mockReturnThis(),
    help: vi.fn().mockReturnThis(),
    print: vi.fn(),
  })),
  toonEmpty: vi.fn(),
  toonUsageError: vi.fn((msg: string) => { throw new Error(msg); }),
  toonError: vi.fn((msg: string) => { throw new Error(msg); }),
}));

import { ytGet, ytPost } from '../../src/client.js';
import { getIssue, searchIssues, createIssue, addComment, executeCommand } from '../../src/commands/issues.js';
import type { Config } from '../../src/config.js';

const mockYtGet = vi.mocked(ytGet);
const mockYtPost = vi.mocked(ytPost);
const config: Config = { url: 'https://yt.example.com', token: 'perm:abc', defaultProject: 'TW' };

const mockIssue = {
  id: 'TW-101',
  summary: 'Fix auth timeout',
  description: 'A'.repeat(1000),
  created: 1700000000000,
  updated: 1700100000000,
  resolved: null,
  customFields: [
    { name: 'State', value: { name: 'In Progress' } },
    { name: 'Priority', value: { name: 'Major' } },
    { name: 'Assignee', value: { login: 'alice', fullName: 'Alice Smith' } },
  ],
  comments: { $count: 4 },
};

describe('getIssue', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches issue with correct fields', async () => {
    mockYtGet.mockResolvedValue(mockIssue);
    await getIssue(config, 'TW-101', { full: false, raw: false });
    expect(mockYtGet).toHaveBeenCalledWith(config, '/issues/TW-101', expect.any(String));
  });

  it('prints raw JSON when --raw flag set', async () => {
    mockYtGet.mockResolvedValue(mockIssue);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await getIssue(config, 'TW-101', { full: false, raw: true });
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify(mockIssue, null, 2));
    logSpy.mockRestore();
  });

  it('calls toonError on 404', async () => {
    const { YtError } = await import('../../src/client.js');
    mockYtGet.mockRejectedValue(new YtError(404, 'not found'));
    const { toonError } = await import('../../src/toon.js');
    await expect(getIssue(config, 'TW-999', { full: false, raw: false })).rejects.toThrow();
    expect(vi.mocked(toonError)).toHaveBeenCalledWith(expect.stringContaining('TW-999'));
  });
});

describe('searchIssues', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches with id,summary and limit 100 by default', async () => {
    mockYtGet.mockResolvedValue([]);
    await searchIssues(config, 'auth', { detailed: false });
    expect(mockYtGet).toHaveBeenCalledWith(
      config, '/issues', 'id,summary',
      expect.objectContaining({ '$top': '100', query: 'auth' })
    );
  });

  it('fetches with full fields when --detailed', async () => {
    mockYtGet.mockResolvedValue([]);
    await searchIssues(config, 'auth', { detailed: true });
    expect(mockYtGet).toHaveBeenCalledWith(
      config, '/issues', expect.stringContaining('customFields'),
      expect.objectContaining({ '$top': '30' })
    );
  });

  it('shows empty state when no results', async () => {
    mockYtGet.mockResolvedValue([]);
    const { toonEmpty } = await import('../../src/toon.js');
    await searchIssues(config, 'nothinghere', { detailed: false });
    expect(vi.mocked(toonEmpty)).toHaveBeenCalled();
  });
});

describe('createIssue', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('posts to /api/issues with project id and summary', async () => {
    mockYtPost.mockResolvedValue({ id: 'TW-102', summary: 'New issue' });
    await createIssue(config, { projectId: 'TW', summary: 'New issue' });
    expect(mockYtPost).toHaveBeenCalledWith(
      config,
      '/issues',
      expect.objectContaining({ project: { id: 'TW' }, summary: 'New issue' }),
      expect.any(String)
    );
  });

  it('includes customFields when type/priority provided', async () => {
    mockYtPost.mockResolvedValue({ id: 'TW-103', summary: 'Bug' });
    await createIssue(config, { projectId: 'TW', summary: 'Bug', type: 'Bug', priority: 'Major' });
    expect(mockYtPost).toHaveBeenCalledWith(
      config, '/issues',
      expect.objectContaining({ customFields: expect.any(Array) }),
      expect.any(String)
    );
  });
});

describe('addComment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('posts comment text to issue', async () => {
    mockYtPost.mockResolvedValue({ id: 'c1', text: 'Hello' });
    await addComment(config, 'TW-101', 'Hello');
    expect(mockYtPost).toHaveBeenCalledWith(config, '/issues/TW-101/comments', { text: 'Hello' }, 'id,text');
  });
});

describe('executeCommand', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('posts command to /api/commands', async () => {
    mockYtPost.mockResolvedValue({});
    await executeCommand(config, 'TW-101', 'In Progress');
    expect(mockYtPost).toHaveBeenCalledWith(
      config, '/commands',
      { issues: [{ id: 'TW-101' }], command: 'In Progress' }
    );
  });
});
