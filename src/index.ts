#!/usr/bin/env node
import { program } from 'commander';
import { loadConfig } from './config.js';
import { sprintHome } from './commands/sprint.js';
import { runSetup } from './setup.js';
import { registerIssueCommands } from './commands/issues.js';
import { registerProjectCommands } from './commands/projects.js';
import { registerUserCommands } from './commands/users.js';

program
  .name('youtrack-axi')
  .description('YouTrack CLI for AI agents — AXI compliant')
  .version('0.1.0');

program.action(async () => {
  const config = await loadConfig();
  await sprintHome(config);
});

program
  .command('setup')
  .description('Configure YouTrack credentials interactively')
  .action(runSetup);

const getConfig = () => loadConfig();
registerIssueCommands(program, getConfig);
registerProjectCommands(program, getConfig);
registerUserCommands(program, getConfig);

await program.parseAsync(process.argv);
