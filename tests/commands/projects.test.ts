import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/client.js', () => ({ ytGet: vi.fn(), YtError: class YtError extends Error {
  statusCode: number;
  constructor(s: number, m: string) { super(m); this.statusCode = s; this.name = 'YtError'; }
} }));
vi.mock('../../src/toon.js', () => ({
  Toon: vi.fn().mockImplementation(() => ({
    scalar: vi.fn().mockReturnThis(),
    blank: vi.fn().mockReturnThis(),
    array: vi.fn().mockReturnThis(),
    help: vi.fn().mockReturnThis(),
    print: vi.fn(),
  })),
  toonEmpty: vi.fn(),
  toonError: vi.fn((msg: string) => { throw new Error(msg); }),
}));

import { ytGet } from '../../src/client.js';
import { listProjects, getProject, getProjectByName, getProjectIssues } from '../../src/commands/projects.js';
import type { Config } from '../../src/config.js';

const mockYtGet = vi.mocked(ytGet);
const config: Config = { url: 'https://yt.example.com', token: 'perm:abc' };

const mockProjects = [
  { id: 'p1', name: 'Teamwork', shortName: 'TW' },
  { id: 'p2', name: 'Demo', shortName: 'DEMO' },
];

describe('listProjects', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches /admin/projects with correct params', async () => {
    mockYtGet.mockResolvedValue(mockProjects);
    await listProjects(config);
    expect(mockYtGet).toHaveBeenCalledWith(config, '/admin/projects', 'id,name,shortName', { '$top': '100' });
  });

  it('shows empty state when no projects', async () => {
    mockYtGet.mockResolvedValue([]);
    const { toonEmpty } = await import('../../src/toon.js');
    await listProjects(config);
    expect(vi.mocked(toonEmpty)).toHaveBeenCalledWith('projects', expect.stringContaining('0'));
  });
});

describe('getProjectByName', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('finds project by name (case-insensitive) and fetches detail', async () => {
    mockYtGet
      .mockResolvedValueOnce(mockProjects)
      .mockResolvedValueOnce(mockProjects[0]);
    await getProjectByName(config, 'teamwork');
    expect(mockYtGet).toHaveBeenCalledTimes(2);
  });

  it('calls toonError when name not found', async () => {
    mockYtGet.mockResolvedValue(mockProjects);
    const { toonError } = await import('../../src/toon.js');
    await expect(getProjectByName(config, 'nonexistent')).rejects.toThrow();
    expect(vi.mocked(toonError)).toHaveBeenCalled();
  });
});

describe('getProjectIssues', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('searches with project filter', async () => {
    mockYtGet.mockResolvedValue([]);
    await getProjectIssues(config, 'TW');
    expect(mockYtGet).toHaveBeenCalledWith(
      config, '/issues', expect.any(String),
      expect.objectContaining({ query: 'project: TW #Unresolved' })
    );
  });
});
