---
name: custom-spec-kit
description: House spec-driven methodology — product PRD (business) → product TDD (macro technical design) → numbered feature specs spanning the necessary layers, with typed tasks, tests and user review before commit. Full mode gates phases separately; compact solo/timeboxed mode uses half-page PRD/TDD sections in one file and a minimal SPEC-001. Delegates implementation to low-level-design and its stack capability, infrastructure to project-kickstart, repository conventions to dev-workflow. Use for "PRD", "TDD", "spec", "SPEC-NNN", "break this down", "create a use case", or as dev-workflow's sdd capability.
metadata:
  category: development
  author: andrespineli
  version: "0.8.0"
implements: dev-workflow
provides:
  - sdd
---

# Custom Spec Kit

PRD defines the business; TDD maps it to a macro technical solution; specs
break that solution into complete, observable feature work units. This skill owns the cut
and the gates. It does not define code shapes or GitHub operations.

```
PRD → approve → TDD → approve → SPEC-001 base → approve → implement/test
                                  SPEC-002… same spec loop → diff review → commit/PR
```

Layout and code come from `low-level-design` + its stack capability.
Infrastructure comes from the selected `project-kickstart` when available;
branches, commits and PRs follow `dev-workflow`'s repository conventions.

## Size: full or compact

State the mode before drafting. **Compact** applies to solo work, interview
exercises or an explicit short timebox (for example, one hour). **Full**
applies to broader product planning with separate business and technical
reviews. The user's chosen mode takes precedence.

Both modes require a PRD, TDD, approved specs and verification. Compact
reduces document size, not requirement traceability or business validation:

- Write `.agents/specs/PLAN.md` from [templates/compact-plan.md](templates/compact-plan.md):
  PRD and TDD sections, about half a page each. Testable must-haves, confirmed
  terms, non-goals, baseline choices, contracts and a feature-oriented macro plan.
- **Explicit planning exception:** PRD and a provisional TDD may be drafted
  together and presented in one turn. Ask "Approve the compact PRD and TDD
  to start the specs?" One explicit verbal/chat response approving both is
  sufficient; record its scope and date. Partial approval leaves the other
  section Draft. Silence, questions and change requests are not approval.
- SPEC-001 records baseline decisions, a short cohesive task list, exact gate
  command and health/smoke acceptance. By default it has its own approval.
  Include only infrastructure required by this scope. Verify and reference
  an existing baseline instead of scaffolding it again.
- If the exercise's agreed SCM target is local, record CI/remote publication
  as deferred; local gate and smoke remain required. Before later remote
  publication, add/run the CI gate. Do not report unrun CI as green.
- Keep normal spec directories, index and state. Do not also create separate
  PRD/TDD copies; all links point to `PLAN.md#prd` or `PLAN.md#tdd`.

### Explicit timebox and grouped approval

When the user asks for a direct one-hour implementation and fewer pauses, draft the
compact plan, minimal structure spec and small feature specs as one bundle.
Present scope, order, acceptance and cuts for one initial approval covering the
named specs. A prompt that explicitly preauthorizes implementation of a defined
scope already supplies that authorization: record it, do not request it again.
A duration alone is not approval of unknown scope.

After that approval, implement the covered specs continuously, preserving task
checks and LLD boundaries. Do not stop for another approval between layers or
already approved specs. Keep per-spec evidence; present one final diff. Reserve
roughly the last ten minutes of a one-hour exercise for the gate, demonstration
and user review. Prioritize one complete feature, then the next; defer lower
priority features with explicit status instead of leaving every path half built.
Do not promise a deliverable regardless of scope or bypass failing checks to
meet the clock. A larger/new requirement returns for approval.

Propose a move to full mode before expanding beyond the agreed compact scope.

## Artifacts and ownership

```text
.agents/specs/
├── README.md              navigation index, mode and phase/spec status
├── PRD.md                 full mode: business document
├── TDD.md                 full mode: product technical design
├── PLAN.md                compact alternative to PRD.md + TDD.md
├── STATE.md               current spec, cross-spec decisions/blockers/lessons
├── SPEC-001-<app>-structure/spec.md
└── SPEC-NNN-<slug>/spec.md
```

- **PRD drafting creates the index** from [templates/spec-index.md](templates/spec-index.md).
  Link actual product documents and track Draft/Approved status and approval
  date/scope. Existing approved product documents elsewhere are referenced,
  never copied or renumbered.
- **TDD drafting adds its feature-oriented macro plan to the index** with spec
  IDs, dependencies and status. Planned files get no link until created.
  TDD owns the plan; README is navigation, not an independent design.
- **SPEC-001 drafting creates STATE.md** from `templates/state.md`: actual
  planning status, current spec and confirmed baseline decisions. Remove
  unused example entries; never invent decisions, blockers or lessons.
- **Each phase/spec transition updates index and state**: draft, approval,
  implementation, review and requested commit/PR/merge. Record evidence,
  distinguish In review from Done, and do not claim a PR has merged merely
  because it exists. Spec-local decisions stay in the spec; cross-spec
  AD-/B-/L- entries go into STATE when they arise.

Numbers are never reused. Replace template document paths with the actual
full, compact or upstream path, including section links.

## Gates

In **full mode**, a request naming PRD, TDD or spec runs that phase only:
produce the artifact, present it with assumptions/open questions, ask the
approval question and stop. "Build X" follows the phases in order with the
same gates. Compact uses the joint planning gate or the explicitly authorized
grouped approval above. Final review never implicitly authorizes a commit.

| Phase | Output | Approval question |
| --- | --- | --- |
| PRD | Business requirements and confirmed glossary | Approve the PRD to move to the TDD? |
| TDD | Macro design and feature plan | Approve the TDD to start the specs? |
| SPEC-NNN | Scope, loaded LLD, typed tasks, tests and acceptance | Approve SPEC-NNN to implement? |
| Implement | Verified diff and test evidence | Review the diff; approve to commit? |
| Commit + PR | Requested operations using dev-workflow conventions | Next spec? |

Approval is an explicit statement with a clear scope. Code appears only
inside an approved spec; planning approval alone never authorizes a commit.
Approved artifacts are not edited silently. A later business gap updates the
PRD, a technical gap updates the TDD, and affected scope is re-approved
before implementation resumes.

## PRD: business only

Critically establish as-is, problem, to-be, users/scenarios, testable `R-###`
requirements, non-goals, constraints, confirmed glossary, assumptions,
inferred candidates and open questions. No technology or architecture choices.
Critical procedure: [references/phases.md](references/phases.md#prd).
Writing guide: [references/prd.md](references/prd.md).

## TDD: product macro design

From the approved PRD (or the provisional compact bundle): contexts and scope
lines, services/deployables, components, published contracts at signature
level, data ownership, cross-cutting choices, risks and feature macro plan.
One evolving TDD for the product, not a TDD per feature. No implementation
file paths or method bodies. Guide:
[references/technical-design.md](references/technical-design.md).

## Specs: complete features, tasks guided by the LLD

A request to create, delete, update or list something becomes a complete feature
spec: domain changes, command/query, required adapter, inbound endpoint, wiring,
UI when in scope, and tests. Reuse delivered components; do not create separate
specs merely because the feature crosses layers. In particular, an adapter
needed by a feature is implemented inside that feature's spec.

[references/spec-categories.md](references/spec-categories.md) is the single
source of spec kinds and implementation directives. Directives select tasks,
LLD loads and proof within a spec; they are not separate SCM gates.

Before drafting, load `low-level-design` and the feature's applicable contracts plus
matching stack references, including `tests`. For TypeScript UI, select
React web or Ink via `lld-typescript/ui`; do not treat the HTTP kickstart as
a UI scaffold. Missing bound design/reference is a declared gap to resolve,
not a reference to invent.

Every spec contains a complete inventory of the skills and exact reference
paths needed for its entire slice, with purposes and consuming task IDs.
Each task lists its relevant subset under Loads. Verify coverage of all changed
layers, boundaries and test kinds before approval; missing required concrete
references are resolved before their dependent tasks. Keep this inventory in
compact mode too, while loading documents progressively during implementation.

SPEC-001 is `domain-structure` or `channel-structure`: establish or verify
the base, dependency wiring, necessary infrastructure, health/smoke, gate
and CI when remote publication is in scope. No product behaviour yet.
SPEC-002 onward follows the TDD's actual dependencies.
Procedure: [references/spec-breakdown.md](references/spec-breakdown.md).

## Implementation and review

One approved spec and one task at a time, on the spec branch when repository
work is in scope. Load the task's references, mirror the nearest sibling,
implement its checks and keep the gate green. No adjacent refactors or scope
expansion. After the final task, present the diff and verification for review;
with grouped approval, continue through the approved feature bundle and present
one final review. Do not introduce per-spec commits when the user owns the
final commit.

After the user approves the diff, perform the requested commit/PR operations
using `dev-workflow/references/scm-conventions.md` and its PR template.
Bootstrap never stages or commits automatically. When the user reserves the
final commit for themselves, present the verified diff and leave it uncommitted.
Record deviations and actual evidence
in the planning artifacts, index and state.

## Context budget

Load progressively: index → current phase guide/artifact → current spec →
contracts the task names. One spec at a time; do not load all specs or both UI
renderer references. Keep working context under about 40k tokens; use the
short guides here rather than copied manuals.
