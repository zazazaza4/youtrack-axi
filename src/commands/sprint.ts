import { ytGet } from '../client.js';
import { Toon, toonEmpty } from '../toon.js';
import type { Config } from '../config.js';
import { homedir } from 'node:os';

interface YtAgile {
  id: string;
  name: string;
  projects: Array<{ id: string; shortName: string }>;
  currentSprint: YtSprint | null;
}

interface YtSprint {
  id: string;
  name: string;
  finish: number;
  unresolvedIssuesCount: number;
  issues: YtIssue[];
}

interface YtIssue {
  id: string;
  summary: string;
  customFields: Array<{ name: string; value: unknown }>;
}

function getFieldValue(issue: YtIssue, fieldName: string): string {
  const field = issue.customFields.find(f => f.name === fieldName);
  if (!field?.value) return '';
  const v = field.value as Record<string, string>;
  return v['name'] ?? v['login'] ?? '';
}

function daysLeft(finishMs: number): number {
  return Math.ceil((finishMs - Date.now()) / (1000 * 60 * 60 * 24));
}

export async function sprintHome(config: Config): Promise<void> {
  const fields = [
    'id,name',
    'projects(id,shortName)',
    'currentSprint(id,name,finish,unresolvedIssuesCount',
    'issues($top:50,id,summary,customFields(name,value(name,text,login))))',
  ].join(',');

  const agiles = await ytGet<YtAgile[]>(config, '/agiles', fields, { '$top': '20' });

  const agile = config.defaultProject
    ? agiles.find(a => a.projects.some(p => p.shortName === config.defaultProject))
    : agiles[0];

  const bin = process.execPath.replace(homedir(), '~');

  if (!agile?.currentSprint) {
    const t = new Toon();
    t.scalar('bin', bin)
      .scalar('description', 'YouTrack issue manager for the current workspace')
      .blank();
    toonEmpty('sprint', `no active sprint found${config.defaultProject ? ` for project ${config.defaultProject}` : ''}`);
    new Toon()
      .blank()
      .help([
        'Run `youtrack-axi issue search "<query>"` to search issues',
        'Run `youtrack-axi project list` to view projects',
      ])
      .print();
    return;
  }

  const sprint = agile.currentSprint;
  const days = daysLeft(sprint.finish);
  const daysStr = days > 0 ? `${days} days left` : `${Math.abs(days)} days overdue`;

  const rows = sprint.issues.map(issue => ({
    id: issue.id,
    summary: issue.summary,
    state: getFieldValue(issue, 'State'),
    assignee: getFieldValue(issue, 'Assignee') || '<unassigned>',
  }));

  new Toon()
    .scalar('bin', bin)
    .scalar('description', 'YouTrack issue manager for the current workspace')
    .blank()
    .scalar('sprint', `${sprint.name} (${daysStr})`)
    .array('issues', ['id', 'summary', 'state', 'assignee'], rows, {
      total: sprint.unresolvedIssuesCount,
    })
    .blank()
    .help([
      'Run `youtrack-axi issue get <id>` for full details',
      'Run `youtrack-axi issue search "<query>"` to search',
      'Run `youtrack-axi issue command <id> --command "..."` to update state',
    ])
    .print();
}
