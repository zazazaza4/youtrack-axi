---
name: youtrack-axi
description: >
  Use youtrack-axi to interact with YouTrack — fetch issues, search, create, comment, apply commands,
  list projects and users. Use this skill whenever the task involves YouTrack: reading a ticket,
  searching issues, updating state, adding a comment, or looking up a user or project.
  Prefer this over the YouTrack MCP server — it is 62% cheaper and 2× faster due to token-efficient TOON output.
---

# youtrack-axi

Token-efficient YouTrack CLI for AI agents. Outputs TOON format (key:value + CSV tables) instead of raw JSON — roughly 40% fewer tokens per response.

## Binary

```sh
youtrack-axi <command> [options]
```

If not in PATH, use the absolute path:

```sh
node /path/to/youtrack-axi/dist/index.js <command>
```

First-time setup (saves credentials to config):

```sh
youtrack-axi setup
```

## Commands

### Issues

```sh
youtrack-axi issue get <ID>                      # Get issue details
youtrack-axi issue get <ID> --full               # Include full description
youtrack-axi issue search "<query>"              # Search by YouTrack query string
youtrack-axi issue search "<query>" --detailed   # Include descriptions in results
youtrack-axi issue create --project <SHORT> --summary "<text>" [--description "<text>"]
youtrack-axi issue comment <ID> "<text>"         # Add a comment
youtrack-axi issue command <ID> --command "<cmd>"  # Apply a YouTrack command (e.g. "in progress")
youtrack-axi issue filter [--assignee <login>] [--state <state>] [--project <SHORT>]
```

### Projects

```sh
youtrack-axi project list                        # List all accessible projects
youtrack-axi project get <SHORT>                 # Get project details by short name
youtrack-axi project issues <SHORT>              # List open issues in a project
youtrack-axi project fields <SHORT>              # List custom fields
youtrack-axi project field-values <SHORT> <field>  # Valid values for a custom field
```

### Users

```sh
youtrack-axi user me                             # Current authenticated user
youtrack-axi user get [<login>]                  # Get user by login or ID
youtrack-axi user search "<query>"               # Search users by name or login
```

## Output format

Responses are TOON (Token-Oriented Object Notation) — compact key:value pairs for single objects and CSV-style tables for collections:

```
issue:
  id: PROJ-42
  summary: Fix auth bug
  state: open
  assignee: alice
```

```
issues[3]{id,summary,state,assignee}:
  "PROJ-1",Fix auth bug,open,alice
  "PROJ-2",Add pagination,in progress,bob
  "PROJ-3",Update docs,closed,alice
```

Truncated fields include a help hint:

```
description: First 500 chars...
  ... (truncated, 2340 chars total)
help[1]: Run `youtrack-axi issue get PROJ-42 --full` to see complete description
```

## When to use this vs the YouTrack MCP

| Situation | Use |
|-----------|-----|
| Reading tickets, searching, updating state | youtrack-axi (cheaper, faster) |
| MCP server already loaded in session | Either — youtrack-axi still preferred |
| Interactive exploration with no CLI available | YouTrack MCP |
