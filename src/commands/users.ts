import type { Command } from 'commander';
import { ytGet, YtError } from '../client.js';
import { Toon, toonEmpty, toonError } from '../toon.js';
import type { Config } from '../config.js';

interface YtUser {
  id: string;
  login: string;
  fullName: string;
  email?: string;
}

export async function getCurrentUser(config: Config): Promise<void> {
  const user = await ytGet<YtUser>(config, '/users/me', 'id,login,fullName,email');
  new Toon()
    .scalar('login', user.login)
    .scalar('fullName', user.fullName)
    .scalar('email', user.email ?? '')
    .print();
}

export async function getUser(config: Config, id: string): Promise<void> {
  let user: YtUser;
  try {
    user = await ytGet<YtUser>(config, `/users/${id}`, 'id,login,fullName,email');
  } catch (e) {
    if (e instanceof YtError && e.statusCode === 404) {
      toonError(`user ${id} not found`);
    }
    throw e;
  }
  new Toon()
    .scalar('login', user.login)
    .scalar('fullName', user.fullName)
    .scalar('email', user.email ?? '')
    .print();
}

export async function getUserByLogin(config: Config, login: string): Promise<void> {
  const users = await ytGet<YtUser[]>(config, '/users', 'id,login,fullName,email', {
    query: login,
    '$top': '10',
  });
  const match = users.find(u => u.login.toLowerCase() === login.toLowerCase());
  if (!match) {
    toonError(`user with login "${login}" not found`, 'Run `youtrack-axi user search <query>` to search');
  }
  new Toon()
    .scalar('login', match!.login)
    .scalar('fullName', match!.fullName)
    .scalar('email', match!.email ?? '')
    .print();
}

export async function searchUsers(config: Config, query: string): Promise<void> {
  const users = await ytGet<YtUser[]>(config, '/users', 'id,login,fullName', {
    query,
    '$top': '20',
  });

  if (users.length === 0) {
    toonEmpty('users', `0 users matching "${query}"`);
    return;
  }

  new Toon()
    .array('users', ['login', 'fullName'], users.map(u => ({
      login: u.login,
      fullName: u.fullName,
    })))
    .print();
}

export function registerUserCommands(program: Command, getConfig: () => Promise<Config>): void {
  const user = program.command('user').description('Manage users');

  user
    .command('me')
    .description('Get current authenticated user')
    .action(async () => { await getCurrentUser(await getConfig()); });

  user
    .command('get [id]')
    .description('Get user by ID or login')
    .option('--login <login>', 'Find by login name instead of ID')
    .addHelpText('after', `
Examples:
  youtrack-axi user get 1-100
  youtrack-axi user get --login alice`)
    .action(async (id: string | undefined, opts: { login?: string }) => {
      const config = await getConfig();
      if (opts.login) {
        await getUserByLogin(config, opts.login);
      } else if (id) {
        await getUser(config, id);
      } else {
        toonError('provide a user ID or use --login');
      }
    });

  user
    .command('search <query>')
    .description('Search users by name or login')
    .addHelpText('after', `
Examples:
  youtrack-axi user search alice
  youtrack-axi user search "Alice Smith"`)
    .action(async (query: string) => { await searchUsers(await getConfig(), query); });
}
