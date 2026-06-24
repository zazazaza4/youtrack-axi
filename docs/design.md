# youtrack-axi Design Spec

**Date:** 2026-06-23  
**Status:** Approved

## Overview

`youtrack-axi` is a TypeScript/Node.js CLI tool that gives AI agents ergonomic, token-efficient access to YouTrack via shell execution. It follows the [AXI (Agent eXperience Interface)](https://github.com/kunchenguid/axi) principles throughout.

## Architecture

### Project Structure

```
youtrack-axi/
├── src/
│   ├── index.ts          # CLI entry point (commander.js root)
│   ├── client.ts         # YouTrack REST client (native fetch + field projection)
│   ├── config.ts         # Load/save ~/.config/youtrack-axi/config.json
│   ├── toon.ts           # TOON serializer
│   ├── commands/
│   │   ├── issues.ts     # get, search, create, comment, execute-command, filter
│   │   ├── projects.ts   # list, get, fields, field-values
│   │   ├── users.ts      # me, get, search
│   │   └── sprint.ts     # current sprint (home view)
│   └── setup.ts          # interactive setup wizard
├── package.json
└── tsconfig.json
```

### Key Layers

- **`client.ts`** — single `yt(path, fields, opts)` function. All YouTrack REST calls go through here. Field projection via `fields=` query param on every call. Throws structured `YtError` (never leaks raw HTTP error bodies).
- **`toon.ts`** — converts JS objects/arrays → TOON text. Shared across all commands. Handles: scalars, objects, arrays with header schemas, help hints, error/empty states.
- **`config.ts`** — reads config with env var override. Priority: `YOUTRACK_URL`/`YOUTRACK_TOKEN` env vars → `~/.config/youtrack-axi/config.json` → structured error.
- **`commands/`** — one file per domain. Each command handler: validates flags → calls client → formats TOON → prints to stdout. Errors go to stdout in TOON format; stderr for debug only.

## Command Surface

```
youtrack-axi                            # home: current sprint summary
youtrack-axi setup                      # interactive auth wizard

# Issues
youtrack-axi issue get <id>             # detail view (body truncated at 800 chars)
youtrack-axi issue get <id> --full      # full body
youtrack-axi issue get <id> --raw       # raw API JSON
youtrack-axi issue search <query>       # id + summary only, limit 100
youtrack-axi issue search <query> --detailed   # full fields, limit 30
youtrack-axi issue create --project <id> --summary "..." [--description "..."] [--type "..."] [--priority "..."]
youtrack-axi issue comment <id> --text "..."
youtrack-axi issue command <id> --command "..."   # e.g. "assign to me", "In Progress"
youtrack-axi issue filter --project <id> [--state ...] [--assignee ...] [--priority ...]

# Projects
youtrack-axi project list
youtrack-axi project get <id>
youtrack-axi project get --name "<name>"
youtrack-axi project issues <id>
youtrack-axi project fields <id>
youtrack-axi project field-values <id> <field>

# Users
youtrack-axi user me
youtrack-axi user get <id>
youtrack-axi user get --login <login>
youtrack-axi user search <query>
```

**Rules for all commands:**
- `--help` on every subcommand: flags with defaults, required args, 2-3 usage examples
- No interactive prompts — missing required flag → structured error + help hint, exit 2
- Idempotent mutations: already-closed → acknowledge + exit 0
- `--fields` flag on list commands to request additional fields explicitly

## Output Format (TOON)

### Home view (no args)

```
bin: ~/.local/bin/youtrack-axi
description: YouTrack issue manager for the current workspace

sprint: Q3 Sprint 4 (12 days left)
issues[8]{id,summary,state,assignee}:
  TW-101,Fix auth timeout,In Progress,alice
  TW-89,Add pagination,Open,bob
  TW-95,Update API docs,Open,<unassigned>
count: 8 of 23 total

help[3]:
  Run `youtrack-axi issue get <id>` for full details
  Run `youtrack-axi issue search "<query>"` to search
  Run `youtrack-axi issue command <id> --command "..."` to update state
```

### Issue detail view

```
issue:
  id: TW-101
  summary: Fix auth timeout
  state: In Progress
  priority: Major
  assignee: alice
  created: 2026-06-01
  updated: 2026-06-20
  description: Users report session expiry after 5 min despite...
    ... (truncated, 2341 chars total)
  comments: 4
help[1]: Run `youtrack-axi issue get TW-101 --full` to see complete description
```

### Error

```
error: --summary is required
help: youtrack-axi issue create --project <id> --summary "..."
```

### Empty state

```
issues: 0 open issues matching "auth" in project TW
```

## Auth & Config

### Setup Wizard (`youtrack-axi setup`)

Human-facing, interactive. Prompts for URL and API token, validates by calling `GET /api/users/me`, lists projects for `defaultProject` selection, writes config file.

```
YouTrack URL: https://yourcompany.youtrack.cloud
API token: ****
Connecting... ✓ Authenticated as alice (Alice Smith)
Default project [TW, DEMO, INFRA]: TW
Config saved to ~/.config/youtrack-axi/config.json
```

### Config File (`~/.config/youtrack-axi/config.json`)

```json
{
  "url": "https://yourcompany.youtrack.cloud",
  "token": "perm:...",
  "defaultProject": "TW"
}
```

### Config Loading Priority

1. `YOUTRACK_URL` + `YOUTRACK_TOKEN` env vars (override config file)
2. `~/.config/youtrack-axi/config.json`
3. Structured error: `error: not configured\nhelp: Run \`youtrack-axi setup\``

### `defaultProject`

Used as default `--project` in `issue search`, `issue create`, `issue filter`. Always overridable with an explicit `--project` flag.

## Error Handling

- **Validation errors** (missing flags): exit 2, print `error:` + `help:` to stdout
- **API errors** (4xx/5xx): exit 1, translate to actionable message, never leak raw HTTP body
- **Not configured**: exit 1, `error: not configured`, `help: Run \`youtrack-axi setup\``
- **Not found**: exit 1, `error: issue TW-999 not found`
- **Already in desired state** (idempotent mutation): exit 0, print acknowledgement

## Tech Stack

- **Runtime:** Node.js 20+, TypeScript
- **CLI framework:** `commander`
- **HTTP:** native `fetch` (Node 18+), no extra HTTP library
- **Interactive setup:** `@inquirer/prompts` (setup only)
- **TOON:** hand-rolled serializer in `toon.ts`
- **Config storage:** `~/.config/youtrack-axi/config.json` via `fs/promises`

## AXI Compliance Checklist

- [x] TOON output format on stdout
- [x] Minimal default schemas (3-4 fields in lists)
- [x] Content truncation with size hint and escape hatch
- [x] Pre-computed aggregates (`count: N of M total`)
- [x] Definitive empty states
- [x] Structured errors on stdout, exit codes (0/1/2)
- [x] No interactive prompts in non-setup commands
- [x] Content first (home view shows live sprint data)
- [x] Contextual disclosure (help hints after every list/mutation)
- [x] Consistent `bin:` + `description:` in home view
