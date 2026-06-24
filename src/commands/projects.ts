import type { Command } from 'commander';
import { ytGet, YtError } from '../client.js';
import { Toon, toonEmpty, toonError } from '../toon.js';
import type { Config } from '../config.js';

interface YtProject {
  id: string;
  name: string;
  shortName: string;
  description?: string;
  leader?: { login: string };
}

interface YtIssue {
  id: string;
  summary: string;
  customFields: Array<{ name: string; value: unknown }>;
}

interface YtCustomField {
  id: string;
  field: { name: string; fieldType: { valueType: string } };
  isPublic: boolean;
}

export async function listProjects(config: Config): Promise<void> {
  const projects = await ytGet<YtProject[]>(config, '/admin/projects', 'id,name,shortName', { '$top': '100' });

  if (projects.length === 0) {
    toonEmpty('projects', '0 projects accessible');
    return;
  }

  new Toon()
    .array('projects', ['shortName', 'name'], projects.map(p => ({
      shortName: p.shortName,
      name: p.name,
    })))
    .help([
      'Run `youtrack-axi project get <shortName>` for project details',
      'Run `youtrack-axi project issues <shortName>` to list issues',
    ])
    .print();
}

export async function getProject(config: Config, id: string): Promise<void> {
  const fields = 'id,name,shortName,description,leader(login)';
  let project: YtProject;
  try {
    project = await ytGet<YtProject>(config, `/admin/projects/${id}`, fields);
  } catch (e) {
    if (e instanceof YtError && e.statusCode === 404) {
      toonError(`project ${id} not found`);
    }
    throw e;
  }

  const t = new Toon()
    .scalar('id', project.shortName)
    .scalar('name', project.name)
    .scalar('leader', project.leader?.login ?? '');
  if (project.description) t.scalar('description', project.description);
  t.blank().help([
    `Run \`youtrack-axi project issues ${project.shortName}\` to list issues`,
    `Run \`youtrack-axi project fields ${project.shortName}\` to see custom fields`,
  ]);
  t.print();
}

export async function getProjectByName(config: Config, name: string): Promise<void> {
  const projects = await ytGet<YtProject[]>(config, '/admin/projects', 'id,name,shortName', { '$top': '100' });
  const lower = name.toLowerCase();
  const match = projects.find(p =>
    p.name.toLowerCase() === lower || p.shortName.toLowerCase() === lower
  );
  if (!match) {
    toonError(`project "${name}" not found`, 'Run `youtrack-axi project list` to see all projects');
  }
  await getProject(config, match!.id);
}

export async function getProjectIssues(config: Config, id: string): Promise<void> {
  const issues = await ytGet<YtIssue[]>(config, '/issues', 'id,summary,customFields(name,value(name))', {
    query: `project: ${id} #Unresolved`,
    '$top': '50',
  });

  if (issues.length === 0) {
    toonEmpty('issues', `0 open issues in project ${id}`);
    return;
  }

  const getState = (i: YtIssue): string => {
    const f = i.customFields.find(f => f.name === 'State');
    return (f?.value as { name?: string } | null)?.name ?? '';
  };

  new Toon()
    .array('issues', ['id', 'summary', 'state'], issues.map(i => ({
      id: i.id,
      summary: i.summary,
      state: getState(i),
    })))
    .help(['Run `youtrack-axi issue get <id>` for full details'])
    .print();
}

export async function getProjectFields(config: Config, id: string): Promise<void> {
  const fields = await ytGet<YtCustomField[]>(
    config,
    `/admin/projects/${id}/customFields`,
    'id,field(name,fieldType(valueType)),isPublic'
  );

  if (fields.length === 0) {
    toonEmpty('fields', `0 custom fields in project ${id}`);
    return;
  }

  new Toon()
    .array('fields', ['name', 'type', 'public'], fields.map(f => ({
      name: f.field.name,
      type: f.field.fieldType.valueType,
      public: String(f.isPublic),
    })))
    .help([`Run \`youtrack-axi project field-values ${id} <field>\` to see valid values`])
    .print();
}

export async function getFieldValues(config: Config, projectId: string, fieldName: string): Promise<void> {
  const fields = await ytGet<YtCustomField[]>(
    config,
    `/admin/projects/${projectId}/customFields`,
    'id,field(name)'
  );
  const match = fields.find(f => f.field.name.toLowerCase() === fieldName.toLowerCase());
  if (!match) {
    toonError(
      `field "${fieldName}" not found in project ${projectId}`,
      `Run \`youtrack-axi project fields ${projectId}\` to see available fields`
    );
  }

  const values = await ytGet<Array<{ name: string }>>(
    config,
    `/admin/projects/${projectId}/customFields/${match!.id}/bundle/values`,
    'name',
    { '$top': '50' }
  );

  if (values.length === 0) {
    toonEmpty('values', `0 values for field "${fieldName}"`);
    return;
  }

  new Toon()
    .array('values', ['name'], values.map(v => ({ name: v.name })))
    .print();
}

export function registerProjectCommands(program: Command, getConfig: () => Promise<Config>): void {
  const project = program.command('project').description('Manage projects');

  project
    .command('list')
    .description('List all accessible projects')
    .action(async () => { await listProjects(await getConfig()); });

  project
    .command('get [id]')
    .description('Get project details by short name or display name')
    .option('--name <name>', 'Find by display name instead of short name')
    .addHelpText('after', `
Examples:
  youtrack-axi project get TW
  youtrack-axi project get --name "Teamwork"`)
    .action(async (id: string | undefined, opts: { name?: string }) => {
      const config = await getConfig();
      if (opts.name) {
        await getProjectByName(config, opts.name);
      } else if (id) {
        await getProject(config, id);
      } else {
        toonError('provide a project short name or use --name', 'Run `youtrack-axi project list` to see all projects');
      }
    });

  project
    .command('issues <id>')
    .description('List open issues in a project')
    .action(async (id: string) => { await getProjectIssues(await getConfig(), id); });

  project
    .command('fields <id>')
    .description('List custom fields for a project')
    .action(async (id: string) => { await getProjectFields(await getConfig(), id); });

  project
    .command('field-values <id> <field>')
    .description('Get valid values for a custom field')
    .addHelpText('after', `
Examples:
  youtrack-axi project field-values TW State
  youtrack-axi project field-values TW Priority`)
    .action(async (id: string, field: string) => { await getFieldValues(await getConfig(), id, field); });
}
