---
name: github-scm
description: GitHub implementation of the dev-workflow scm contract. Use for repository setup, branches, commits, pull requests, reviews and merges through gh, after the diff is reviewed.
metadata:
  category: development
  author: andrespineli
  version: "0.1.0"
implements: dev-workflow
provides:
  - scm
---

# SCM — GitHub capability

This capability implements the `scm` contract declared by `dev-workflow`.
Load the contract first, then [the provider reference](../dev-workflow/references/scm-conventions.md).
It owns only GitHub/SCM operations; planning, feature scope, architecture and
implementation remain with the bound SDD, LLD and stack capabilities.

Use `gh` for requested GitHub operations and check authentication before a
remote mutation. Branches, commits, pushes, pull requests and merges follow the
provider reference. Present the verified diff and obtain the user's approval
before committing, pushing or opening a pull request. A bootstrap never gets
an implicit commit exemption.
