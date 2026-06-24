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
import { getCurrentUser, searchUsers, getUserByLogin } from '../../src/commands/users.js';
import type { Config } from '../../src/config.js';

const mockYtGet = vi.mocked(ytGet);
const config: Config = { url: 'https://yt.example.com', token: 'perm:abc' };

describe('getCurrentUser', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches /users/me', async () => {
    mockYtGet.mockResolvedValue({ id: 'u1', login: 'alice', fullName: 'Alice Smith', email: 'alice@example.com' });
    await getCurrentUser(config);
    expect(mockYtGet).toHaveBeenCalledWith(config, '/users/me', 'id,login,fullName,email');
  });
});

describe('searchUsers', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('fetches with query param and limit 20', async () => {
    mockYtGet.mockResolvedValue([{ id: 'u1', login: 'alice', fullName: 'Alice Smith' }]);
    await searchUsers(config, 'alice');
    expect(mockYtGet).toHaveBeenCalledWith(config, '/users', 'id,login,fullName', { query: 'alice', '$top': '20' });
  });

  it('shows empty state when no results', async () => {
    mockYtGet.mockResolvedValue([]);
    const { toonEmpty } = await import('../../src/toon.js');
    await searchUsers(config, 'nobody');
    expect(vi.mocked(toonEmpty)).toHaveBeenCalled();
  });
});

describe('getUserByLogin', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('finds user by login (case-insensitive)', async () => {
    mockYtGet.mockResolvedValue([
      { id: 'u1', login: 'Alice', fullName: 'Alice Smith', email: 'alice@example.com' },
    ]);
    await getUserByLogin(config, 'alice');
    expect(mockYtGet).toHaveBeenCalledWith(config, '/users', 'id,login,fullName,email', expect.any(Object));
  });

  it('calls toonError when login not found', async () => {
    mockYtGet.mockResolvedValue([]);
    const { toonError } = await import('../../src/toon.js');
    await expect(getUserByLogin(config, 'ghost')).rejects.toThrow();
    expect(vi.mocked(toonError)).toHaveBeenCalled();
  });
});
