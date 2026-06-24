# youtrack-axi

Token-efficient YouTrack CLI for AI agents. Outputs [TOON](https://toonformat.dev/) (key:value + CSV tables) instead of raw JSON — ~40% fewer tokens per response.

## Install

```sh
npm install -g youtrack-axi
```

Or run without installing:

```sh
npx youtrack-axi <command>
```

## Setup

```sh
youtrack-axi setup
```

Saves your YouTrack base URL and token to config. Run once before using other commands.

## Commands

### Issues

```sh
youtrack-axi issue get <ID>                       # Get issue details
youtrack-axi issue get <ID> --full                # Include full description
youtrack-axi issue search "<query>"               # Search by YouTrack query string
youtrack-axi issue search "<query>" --detailed    # Include descriptions in results
youtrack-axi issue create --project <SHORT> --summary "<text>"
youtrack-axi issue comment <ID> "<text>"          # Add a comment
youtrack-axi issue command <ID> --command "<cmd>" # Apply a command (e.g. "in progress")
youtrack-axi issue filter [--assignee <login>] [--state <state>] [--project <SHORT>]
```

### Projects

```sh
youtrack-axi project list                         # List all accessible projects
youtrack-axi project get <SHORT>                  # Get project by short name
youtrack-axi project issues <SHORT>               # List open issues in a project
youtrack-axi project fields <SHORT>               # List custom fields
youtrack-axi project field-values <SHORT> <field> # Valid values for a custom field
```

### Users

```sh
youtrack-axi user me                              # Current authenticated user
youtrack-axi user get [<login>]                   # Get user by login or ID
youtrack-axi user search "<query>"                # Search users by name or login
```

## Agent skill

Install as a Claude Code / Codex skill so your AI agent knows to use this CLI for YouTrack tasks:

```sh
skills add https://github.com/zazazaza4/youtrack-axi --global
```

## Why

Standard YouTrack MCP responses are verbose JSON. `youtrack-axi` outputs TOON — compact structured text that costs ~62% fewer tokens while staying fully readable by agents.

| Metric | youtrack-axi | YouTrack MCP |
|--------|-------------|--------------|
| Avg cost per task | $0.072 | $0.191 |
| Avg turns | 2.1 | 10.1 |
| Avg duration | 34.8s | 72.1s |
| Success rate | 98% | 91% |

## License

MIT
