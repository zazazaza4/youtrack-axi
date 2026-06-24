# YouTrack Benchmark Results

_94 runs · 2 conditions · 16 tasks · generated 2026-06-24 06:18:21 UTC_

## Overall

| Condition | Success | Avg Cost | Avg Duration | Avg Turns |
|-----------|---------|----------|--------------|-----------|
| **axi** | **98%** | **$0.072** | **34.8s** | **2.1** |
| **mcp** | **91%** | **$0.191** | **72.1s** | **10.1** |

> **AXI saves 62% cost** and 64% tokens vs MCP.

## Per-task

| Task | Category | axi pass% / score | mcp pass% / score |
|------|----------|----------------------|----------------------|
| sprint_overview | single_step | 100% / 8.7 | 100% / 8.0 |
| list_projects | single_step | 100% / 10.0 | 100% / 10.0 |
| issue_detail | single_step | 100% / 10.0 | 100% / 9.7 |
| current_user | single_step | 100% / 10.0 | 100% / 10.0 |
| search_in_progress | single_step | 67% / 6.3 | 100% / 10.0 |
| search_query | single_step | 100% / 10.0 | 100% / 9.7 |
| project_detail | single_step | 100% / 9.3 | 100% / 9.3 |
| user_search | single_step | 100% / 10.0 | 100% / 10.0 |
| issues_by_priority | single_step | 100% / 8.7 | 100% / 9.5 |
| sprint_unresolved_count | single_step | 100% / 8.7 | 100% / 8.5 |
| multi_search_and_detail | multi_step | 100% / 8.7 | 100% / 9.7 |
| sprint_assignee_filter | multi_step | 100% / 8.7 | 100% / 9.0 |
| project_issue_count | multi_step | 67% / 7.3 | 100% / 9.0 |
| agile_board_sprint | multi_step | 100% / 9.7 | 0% / 3.3 |
| error_bad_issue_id | error_recovery | 100% / 9.3 | 100% / 9.3 |
| error_bad_project | error_recovery | 67% / 8.3 | 100% / 9.3 |

## All runs

| Run | Verdict | Score | Tokens | Cost | Time |
|-----|---------|-------|--------|------|------|
| axi / sprint_overview | pass | 9/10 | 324 | $0.066 | 23.8s |
| axi / list_projects | pass | 10/10 | 332 | $0.062 | 21.5s |
| axi / issue_detail | pass | 10/10 | 335 | $0.062 | 21.3s |
| axi / current_user | pass | 10/10 | 213 | $0.060 | 20.2s |
| axi / search_in_progress | pass | 10/10 | 569 | $0.069 | 24.1s |
| axi / search_query | pass | 10/10 | 388 | $0.065 | 25.1s |
| axi / project_detail | pass | 10/10 | 214 | $0.060 | 21.2s |
| axi / user_search | pass | 10/10 | 417 | $0.063 | 22.3s |
| axi / issues_by_priority | pass | 9/10 | 1788 | $0.121 | 55.3s |
| axi / sprint_unresolved_count | pass | 10/10 | 632 | $0.071 | 28.8s |
| axi / multi_search_and_detail | pass | 9/10 | 465 | $0.076 | 27.9s |
| axi / sprint_assignee_filter | pass | 9/10 | 331 | $0.073 | 26.6s |
| axi / project_issue_count | pass | 9/10 | 998 | $0.087 | 38.4s |
| axi / agile_board_sprint | pass | 9/10 | 3618 | $0.150 | 80.0s |
| axi / error_bad_issue_id | pass | 10/10 | 369 | $0.048 | 22.9s |
| axi / error_bad_project | pass | 10/10 | 714 | $0.067 | 32.1s |
| mcp / sprint_overview | pass | 8/10 | 3608 | $0.257 | 110.4s |
| mcp / list_projects | pass | 10/10 | 432 | $0.047 | 15.7s |
| mcp / issue_detail | pass | 9/10 | 639 | $0.052 | 23.8s |
| mcp / current_user | pass | 10/10 | 291 | $0.044 | 15.6s |
| mcp / search_in_progress | pass | 10/10 | 727 | $0.059 | 20.3s |
| mcp / search_query | pass | 10/10 | 1008 | $0.074 | 28.8s |
| mcp / project_detail | pass | 10/10 | 291 | $0.044 | 19.4s |
| mcp / user_search | pass | 10/10 | 5058 | $0.306 | 158.1s |
| mcp / issues_by_priority | pass | 9/10 | 683 | $0.058 | 20.5s |
| mcp / sprint_unresolved_count | pass | 8/10 | 7764 | $0.810 | 222.4s |
| mcp / multi_search_and_detail | pass | 10/10 | 711 | $0.069 | 26.1s |
| mcp / sprint_assignee_filter | pass | 9/10 | 6805 | $0.428 | 172.9s |
| mcp / multi_search_and_detail | pass | 10/10 | 702 | $0.069 | 26.4s |
| mcp / project_issue_count | pass | 9/10 | 7394 | $0.970 | 237.0s |
| mcp / agile_board_sprint | partial | 3/10 | 2885 | $0.160 | 93.9s |
| mcp / error_bad_issue_id | pass | 9/10 | 493 | $0.048 | 18.8s |
| mcp / error_bad_project | pass | 10/10 | 833 | $0.069 | 33.2s |
| mcp / project_issue_count | pass | 9/10 | 8481 | $1.092 | 282.6s |
| mcp / agile_board_sprint | partial | 4/10 | 2927 | $0.178 | 93.9s |
| mcp / error_bad_issue_id | pass | 10/10 | 489 | $0.048 | 19.7s |
| mcp / error_bad_project | pass | 8/10 | 700 | $0.061 | 25.5s |
| axi / sprint_overview | pass | 9/10 | 657 | $0.096 | 33.3s |
| axi / list_projects | pass | 10/10 | 332 | $0.048 | 20.2s |
| axi / issue_detail | pass | 10/10 | 305 | $0.048 | 21.1s |
| axi / search_in_progress | fail | 0/10 | 569 | $0.055 | 42.2s |
| axi / search_query | pass | 10/10 | 389 | $0.051 | 21.5s |
| axi / project_detail | pass | 9/10 | 196 | $0.046 | 20.1s |
| mcp / list_projects | pass | 10/10 | 4002 | $0.274 | 202.6s |
| axi / user_search | pass | 10/10 | 415 | $0.050 | 21.7s |
| mcp / issue_detail | pass | 10/10 | 438 | $0.048 | 18.6s |
| mcp / current_user | pass | 10/10 | 253 | $0.043 | 15.0s |
| mcp / search_in_progress | pass | 10/10 | 761 | $0.060 | 26.3s |
| axi / issues_by_priority | pass | 8/10 | 1957 | $0.122 | 67.8s |
| mcp / search_query | pass | 9/10 | 701 | $0.058 | 20.4s |
| mcp / project_detail | pass | 9/10 | 320 | $0.045 | 17.1s |
| axi / sprint_unresolved_count | pass | 9/10 | 1533 | $0.109 | 65.5s |
| axi / multi_search_and_detail | pass | 9/10 | 517 | $0.063 | 29.1s |
| axi / sprint_assignee_filter | pass | 8/10 | 243 | $0.051 | 22.3s |
| mcp / user_search | pass | 10/10 | 2538 | $0.173 | 100.1s |
| axi / project_issue_count | pass | 8/10 | 911 | $0.071 | 40.3s |
| mcp / issues_by_priority | pass | 10/10 | 661 | $0.058 | 28.3s |
| axi / agile_board_sprint | pass | 10/10 | 3278 | $0.184 | 110.9s |
| axi / error_bad_issue_id | pass | 9/10 | 419 | $0.049 | 24.0s |
| axi / error_bad_project | pass | 10/10 | 693 | $0.067 | 35.8s |
| mcp / sprint_unresolved_count | pass | 9/10 | 6797 | $0.972 | 284.4s |
| mcp / multi_search_and_detail | pass | 9/10 | 900 | $0.081 | 38.4s |
| mcp / sprint_assignee_filter | pass | 9/10 | 7406 | $0.450 | 191.2s |
| axi / sprint_overview | pass | 8/10 | 345 | $0.053 | 33.1s |
| axi / list_projects | pass | 10/10 | 317 | $0.048 | 23.3s |
| axi / issue_detail | pass | 10/10 | 366 | $0.049 | 25.4s |
| axi / current_user | pass | 10/10 | 210 | $0.046 | 21.9s |
| axi / search_in_progress | pass | 9/10 | 536 | $0.055 | 31.5s |
| axi / search_query | pass | 10/10 | 391 | $0.051 | 24.2s |
| axi / project_detail | pass | 9/10 | 189 | $0.046 | 22.9s |
| mcp / agile_board_sprint | partial | 3/10 | 2148 | $0.127 | 74.8s |
| axi / user_search | pass | 10/10 | 417 | $0.050 | 21.1s |
| mcp / error_bad_issue_id | pass | 9/10 | 491 | $0.048 | 28.8s |
| mcp / error_bad_project | pass | 10/10 | 716 | $0.067 | 33.6s |
| axi / issues_by_priority | pass | 9/10 | 2811 | $0.150 | 94.4s |
| axi / sprint_unresolved_count | pass | 7/10 | 838 | $0.060 | 39.8s |
| axi / multi_search_and_detail | pass | 8/10 | 539 | $0.063 | 28.2s |
| axi / sprint_assignee_filter | pass | 9/10 | 191 | $0.050 | 26.3s |
| mcp / sprint_overview | pass | 8/10 | 4270 | $0.255 | 131.3s |
| mcp / list_projects | pass | 10/10 | 429 | $0.047 | 18.2s |
| axi / project_issue_count | partial | 5/10 | 842 | $0.072 | 36.6s |
| mcp / issue_detail | pass | 10/10 | 516 | $0.051 | 34.7s |
| mcp / current_user | pass | 10/10 | 289 | $0.044 | 23.9s |
| axi / agile_board_sprint | pass | 10/10 | 2335 | $0.160 | 87.2s |
| mcp / search_in_progress | pass | 10/10 | 684 | $0.058 | 21.4s |
| axi / error_bad_issue_id | pass | 9/10 | 379 | $0.048 | 21.1s |
| mcp / search_query | pass | 10/10 | 895 | $0.072 | 34.2s |
| axi / error_bad_project | partial | 5/10 | 753 | $0.068 | 33.5s |
| mcp / project_detail | pass | 9/10 | 298 | $0.045 | 19.3s |

