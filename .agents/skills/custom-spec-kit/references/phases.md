# Phase procedures

Select full/compact sizing from SKILL.md first. Full mode separates planning
gates; compact drafts short PRD/TDD sections together for one explicit planning
approval. When explicitly authorized, compact approval may cover the named
structure and feature specs together; final diff review remains mandatory.

## PRD

The PRD is critical business planning, not transcription. Before drafting:

1. **Context check**: actor, problem, as-is, business rule, observable outcome,
   non-goals and constraints. Ask if a must-have cannot be made testable.
2. **Term audit**: extract business nouns/verbs; confirm definitions. Flag
   synonyms for one concept and a word with multiple meanings.
3. **Logic pass**: check contradictions, ambiguous readings, missing actor,
   trigger/outcome and relevant edge cases (empty, duplicate, expired,
   concurrent, unauthorized, invalid). Replace "fast/secure/easy" with an
   observable check. Propose unstated needs as inferred candidates, not facts.
   Ask a handful of consequential questions at a time.
4. **Draft**: use the selected template with stable IDs, confirmed terms,
   assumptions and open questions. Create/update the index.
5. **Present and gate**: show inferred candidates and uncertainty. In full
   mode stop for PRD approval; compact follows the joint PRD/TDD gate.

Writing guide: [prd.md](prd.md).

## TDD

Use [technical-design.md](technical-design.md) and the selected template.
Confirm baseline/bindings, contexts and ownership, services, named components,
published contracts, cross-cutting choices and risks. Organize the macro plan by complete features
using [spec-categories.md](spec-categories.md), with actual dependencies and
requirement coverage. Update the index; present and request approval. Compact
TDD is provisional until the joint planning gate approves it.

## SPEC-NNN

Start from approved planning. Select applicable directives, then load `low-level-design` and
their references plus the stack's matching references before drafting.
TypeScript channel specs select React web or Ink via `lld-typescript/ui`;
all features load the `tests` contract/concrete.

Use the structure template for SPEC-001, normal spec template thereafter.
Follow [spec-breakdown.md](spec-breakdown.md). SPEC-001 drafting creates STATE;
every spec drafting/approval updates index and state. Present scope/tasks,
verification and acceptance. Ask "Approve SPEC-NNN to implement?" only when
that spec is not already covered by explicit approval of the compact bundle.

## Implement

State assumptions, files and loaded references. One task at a time, using its
implementation reference and focused checks, then the full gate. Respect the
review boundary: bootstrap never stages or commits automatically.
After the last task, set In review, synchronize planning/index/state and
present the diff and test evidence. With grouped approval, finish the approved
bundle before final review. If the user owns the final commit, leave it to them.

## Commit and PR

After approval of the reviewed diff, use dev-workflow's `scm` contract and its
GitHub provider conventions and PR template for requested operations. Record actual commit/PR evidence and
status; do not claim merge or CI success without evidence. Report the result.

## Memory

STATE records cross-spec AD- decisions, B- blockers, L- lessons and deferred
items. Spec-local decisions live in the spec. Update current spec, approval
status and actual evidence at transitions; remove unused placeholder entries.
