import { input, password, select } from '@inquirer/prompts';
import { saveConfig } from './config.js';
import { ytGet } from './client.js';

interface YtUser {
  id: string;
  login: string;
  fullName: string;
}

interface YtProject {
  id: string;
  name: string;
  shortName: string;
}

export async function runSetup(): Promise<void> {
  console.log('YouTrack AXI Setup\n');

  const url = await input({
    message: 'YouTrack URL:',
    validate: (v) => v.startsWith('http') ? true : 'Must start with http:// or https://',
  });

  const token = await password({
    message: 'API token (Settings → Account Security → Tokens):',
    validate: (v) => v.length > 0 ? true : 'Token required',
  });

  const normalizedUrl = url.replace(/\/$/, '');
  const tempConfig = { url: normalizedUrl, token };

  process.stdout.write('Connecting...');
  let user: YtUser;
  try {
    user = await ytGet<YtUser>(tempConfig, '/users/me', 'id,login,fullName');
    console.log(` ✓ Authenticated as ${user.login} (${user.fullName})`);
  } catch {
    console.log(' ✗ Failed');
    console.log('error: authentication failed — check URL and token');
    process.exit(1);
  }

  const projects = await ytGet<YtProject[]>(tempConfig, '/admin/projects', 'id,name,shortName', { '$top': '100' });

  let defaultProject: string | undefined;
  if (projects.length > 0) {
    const choice = await select({
      message: 'Default project:',
      choices: [
        { name: '(none)', value: '' },
        ...projects.map(p => ({ name: `${p.name} (${p.shortName})`, value: p.shortName })),
      ],
    });
    defaultProject = choice || undefined;
  }

  await saveConfig({ url: normalizedUrl, token, defaultProject });
  console.log('Config saved to ~/.config/youtrack-axi/config.json');
}
