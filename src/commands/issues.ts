import type { Command } from 'commander';
import { ytGet, ytPost, YtError } from '../client.js';
import { Toon, toonEmpty, toonUsageError, toonError } from '../toon.js';
import type { Config } from '../config.js';

const DESCRIPTION_TRUNCATE = 800;
const ISSUE_FIELDS = 'id,summary,description,created,updated,resolved,customFields(name,value(name,text,login,fullName)),comments($count)';
const LIST_FIELDS = 'id,summary';
const DETAILED_FIELDS = 'id,summary,customFields(name,value(name,text,login)),created,updated,resolved';

interface YtIssue {
  id: string;
  summary: string;
  description?: string;
  created?: number;
  updated?: number;
  resolved?: number | null;
  customFields: Array<{ name: string; value: unknown }>;
  comments?: { $count: number };
}

function getFieldValue(issue: YtIssue, fieldName: string): string {
  const field = issue.customFields.find(f => f.name === fieldName);
  if (!field?.value) return '';
  const v = field.value as Record<string, string>;
  return v['name'] ?? v['login'] ?? '';
}

function formatDate(ms?: number | null): string {
  if (!ms) return '';
  return new Date(ms).toISOString().split('T')[0] ?? '';
}

export async function getIssue(
  config: Config,
  id: string,
  opts: { full: boolean; raw: boolean }
): Promise<void> {
  let issue: YtIssue;
  try {
    issue = await ytGet<YtIssue>(config, `/issues/${id}`, ISSUE_FIELDS);
  } catch (e) {
    if (e instanceof YtError && e.statusCode === 404) {
      toonError(`issue ${id} not found`);
    }
    throw e;
  }

  if (opts.raw) {
    console.log(JSON.stringify(issue, null, 2));
    return;
  }

  const desc = issue.description ?? '';
  const truncated = !opts.full && desc.length > DESCRIPTION_TRUNCATE;
  const descDisplay = truncated ? desc.slice(0, DESCRIPTION_TRUNCATE) + '...' : desc;

  const t = new Toon();
  t.scalar('id', issue.id)
    .scalar('summary', issue.summary)
    .scalar('state', getFieldValue(issue, 'State'))
    .scalar('priority', getFieldValue(issue, 'Priority'))
    .scalar('assignee', getFieldValue(issue, 'Assignee') || '<unassigned>')
    .scalar('created', formatDate(issue.created))
    .scalar('updated', formatDate(issue.updated));

  if (desc) {
    t.scalar('description', descDisplay);
    if (truncated) {
      t.scalar('  ...', `(truncated, ${desc.length} chars total)`);
    }
  }

  t.scalar('comments', issue.comments?.$count ?? 0);

  if (truncated) {
    t.blank().help([`Run \`youtrack-axi issue get ${id} --full\` to see complete description`]);
  }

  t.print();
}

export async function searchIssues(
  config: Config,
  query: string,
  opts: { detailed: boolean }
): Promise<void> {
  const fields = opts.detailed ? DETAILED_FIELDS : LIST_FIELDS;
  const top = opts.detailed ? '30' : '100';

  const results = await ytGet<YtIssue[]>(config, '/issues', fields, {
    query,
    '$top': top,
  });

  if (results.length === 0) {
    toonEmpty('issues', `0 issues matching "${query}"`);
    return;
  }

  if (opts.detailed) {
    const rows = results.map(i => ({
      id: i.id,
      summary: i.summary,
      state: getFieldValue(i, 'State'),
      assignee: getFieldValue(i, 'Assignee') || '<unassigned>',
      updated: formatDate(i.updated),
    }));
    new Toon()
      .array('issues', ['id', 'summary', 'state', 'assignee', 'updated'], rows)
      .help(['Run `youtrack-axi issue get <id>` for full details'])
      .print();
  } else {
    const rows = results.map(i => ({ id: i.id, summary: i.summary }));
    new Toon()
      .array('issues', ['id', 'summary'], rows)
      .help(['Run `youtrack-axi issue get <id>` for full details'])
      .print();
  }
}

export async function createIssue(
  config: Config,
  opts: { projectId: string; summary: string; description?: string; type?: string; priority?: string }
): Promise<void> {
  const body: Record<string, unknown> = {
    project: { id: opts.projectId },
    summary: opts.summary,
  };
  if (opts.description) body['description'] = opts.description;

  const customFields: Array<{ name: string; value: { name: string } }> = [];
  if (opts.type) customFields.push({ name: 'Type', value: { name: opts.type } });
  if (opts.priority) customFields.push({ name: 'Priority', value: { name: opts.priority } });
  if (customFields.length) body['customFields'] = customFields;

  const created = await ytPost<{ id: string; summary: string }>(
    config,
    '/issues',
    body,
    'id,summary'
  );

  new Toon()
    .scalar('created', created.id)
    .scalar('summary', created.summary)
    .help([`Run \`youtrack-axi issue get ${created.id}\` to view`])
    .print();
}

export async function addComment(config: Config, id: string, text: string): Promise<void> {
  await ytPost(config, `/issues/${id}/comments`, { text }, 'id,text');
  new Toon().scalar('comment', `added to ${id}`).print();
}

export async function executeCommand(config: Config, id: string, command: string): Promise<void> {
  await ytPost(config, '/commands', { issues: [{ id }], command });
  new Toon().scalar('command', `applied "${command}" to ${id}`).print();
}

export async function filterIssues(
  config: Config,
  opts: { projectId: string; state?: string; assignee?: string; priority?: string }
): Promise<void> {
  const parts = [`project: ${opts.projectId}`];
  if (opts.state) parts.push(`State: {${opts.state}}`);
  if (opts.assignee) parts.push(`Assignee: ${opts.assignee}`);
  if (opts.priority) parts.push(`Priority: {${opts.priority}}`);

  await searchIssues(config, parts.join(' '), { detailed: true });
}

export function registerIssueCommands(program: Command, getConfig: () => Promise<Config>): void {
  const issue = program.command('issue').description('Manage issues');

  issue
    .command('get <id>')
    .description('Get issue details')
    .option('--full', 'Show full description without truncation')
    .option('--raw', 'Output raw API JSON')
    .addHelpText('after', `
Examples:
  youtrack-axi issue get TW-101
  youtrack-axi issue get TW-101 --full
  youtrack-axi issue get TW-101 --raw`)
    .action(async (id: string, opts: { full: boolean; raw: boolean }) => {
      await getIssue(await getConfig(), id, opts);
    });

  issue
    .command('search <query>')
    .description('Search issues by YouTrack query string')
    .option('--detailed', 'Return full fields, limit 30')
    .addHelpText('after', `
Examples:
  youtrack-axi issue search "auth timeout"
  youtrack-axi issue search "#Unresolved assignee: me" --detailed`)
    .action(async (query: string, opts: { detailed: boolean }) => {
      await searchIssues(await getConfig(), query, opts);
    });

  issue
    .command('create')
    .description('Create a new issue')
    .requiredOption('--project <id>', 'Project short name (e.g. TW)')
    .requiredOption('--summary <text>', 'Issue summary')
    .option('--description <text>', 'Issue description (markdown)')
    .option('--type <name>', 'Issue type (e.g. Bug, Feature, Task)')
    .option('--priority <name>', 'Priority (e.g. Major, Minor, Critical)')
    .addHelpText('after', `
Examples:
  youtrack-axi issue create --project TW --summary "Fix login timeout"
  youtrack-axi issue create --project TW --summary "Add feature" --type Feature --priority Minor`)
    .action(async (opts: { project: string; summary: string; description?: string; type?: string; priority?: string }) => {
      await createIssue(await getConfig(), { projectId: opts.project, summary: opts.summary, description: opts.description, type: opts.type, priority: opts.priority });
    });

  issue
    .command('comment <id>')
    .description('Add a comment to an issue')
    .requiredOption('--text <text>', 'Comment text (markdown supported)')
    .addHelpText('after', `
Examples:
  youtrack-axi issue comment TW-101 --text "Fixed in branch fix/auth-timeout"`)
    .action(async (id: string, opts: { text: string }) => {
      await addComment(await getConfig(), id, opts.text);
    });

  issue
    .command('command <id>')
    .description('Apply a YouTrack command to an issue')
    .requiredOption('--command <cmd>', 'Command string (e.g. "In Progress", "assign to me")')
    .addHelpText('after', `
Examples:
  youtrack-axi issue command TW-101 --command "In Progress"
  youtrack-axi issue command TW-101 --command "assign to alice"`)
    .action(async (id: string, opts: { command: string }) => {
      await executeCommand(await getConfig(), id, opts.command);
    });

  issue
    .command('filter')
    .description('Filter issues by structured criteria')
    .option('--project <id>', 'Project short name (defaults to config defaultProject)')
    .option('--state <name>', 'Filter by state (e.g. "In Progress")')
    .option('--assignee <login>', 'Filter by assignee login')
    .option('--priority <name>', 'Filter by priority (e.g. Major)')
    .addHelpText('after', `
Examples:
  youtrack-axi issue filter --project TW --state "In Progress"
  youtrack-axi issue filter --assignee alice --priority Major`)
    .action(async (opts: { project?: string; state?: string; assignee?: string; priority?: string }) => {
      const config = await getConfig();
      const projectId = opts.project ?? config.defaultProject;
      if (!projectId) {
        toonUsageError('--project is required (or set defaultProject via `youtrack-axi setup`)');
      }
      await filterIssues(config, { projectId, state: opts.state, assignee: opts.assignee, priority: opts.priority });
    });
}
