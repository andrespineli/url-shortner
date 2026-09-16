---
name: dev-workflow
description: Development workflow with the abstract sdd contract (traceable requirements, design, atomic tasks and verified code) and SCM conventions for branches, commits, pull requests and review. Bind one methodology such as custom-spec-kit, tlc-spec-driven, github-spec-kit, openspec or superpowers. The capability decides planning depth and artifact layout. Use when starting a feature, choosing the next planning phase, reviewing a diff, committing or opening a pull request.
metadata:
  category: development
  author: andrespineli
  version: "0.6.0"
contracts:
  - sdd
  - scm
---

# Development Workflow

This skill defines the `sdd` contract and the project's repository conventions.
The bound methodology owns planning phases, sizing, spec categories and file
layout. `low-level-design` and its stack capability own implementation patterns.

```
bound sdd: requirements → design → tasks → verified code
workflow conventions: reviewed diff → commit → PR → merge
```

## Contract `sdd`

Read [references/sdd.md](references/sdd.md) when planning or implementing.

1. Requirements carry stable IDs; each behaviour change traces to one.
2. Design maps requirements onto the architecture baseline, without
   re-choosing it for each use case.
3. Tasks are atomic and verifiable, naming the references they load.
4. Verification belongs to each task; the gate is green before commit.
5. Deviations update the relevant planning artifact and are surfaced for review.
6. The capability defines approval boundaries and any explicit compact-mode
   exception. Silence is not approval; code requires approved scope.

## Product planning depends on the methodology

For **custom-spec-kit**, PRD and TDD are mandatory product planning phases,
followed by complete feature specs. They can be short sections in one file under
its compact sizing rule. Existing approved product documents are reused;
new use cases do not get new product PRDs or TDDs.

Other capabilities decide their own artifact set and sizing. When an upstream
PRD or technical design exists, reuse its IDs and architecture decisions.
Do not apply custom-spec-kit paths or categories to another methodology.
State the bound capability and sizing mode before planning.

## SCM and repository conventions

Read [references/scm-conventions.md](references/scm-conventions.md)
when creating a repository, branching, committing, opening a pull request or merging.
The PR body comes from [templates/pr.md](templates/pr.md).

These conventions are part of this skill, not a separately bound capability.
Commit, push and pull-request creation require the reviewed diff's approval; planning
approval alone does not authorize them. Project-specific release and
attribution policies take precedence over the defaults here.

The `scm` contract covers repository setup, branches, commits, pull requests,
reviews and merges. The current concrete provider is GitHub, documented in
`references/scm-conventions.md`; another SCM provider can implement the same
contract without changing the SDD methodology.

## Binding and migration

Bind one `sdd` capability in `harness.yaml`; `custom-spec-kit` is the house
method. Bind `scm` to the provider selected by the repository (currently the
GitHub conventions in this skill). There is no separate delivery capability.

When migrating a consuming project, remove the legacy `delivery` binding
and `github-delivery` selection, then regenerate `AGENTS.md` with
`harness apply`. Preserve the `sdd` binding. Migrating a source library does
not update vendored consumers automatically, especially selections marked local.
