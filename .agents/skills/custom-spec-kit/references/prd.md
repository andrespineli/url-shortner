# PRD writing guide

This is the business phase of custom-spec-kit, not an independent workflow.
Use [../templates/prd.md](../templates/prd.md) in full mode; use the PRD
section of [../templates/compact-plan.md](../templates/compact-plan.md) in
compact mode. Follow the project's artifact language convention; file names,
requirement IDs and document references remain stable.

## Establish the business before drafting

Use the critical PRD procedure in [phases.md](phases.md#prd): check context,
confirm terms, test logic and resolve consequential gaps. Reuse information
already provided. Ask about an unknown that changes a must-have instead of
inventing its rule. Inferred needs remain candidates until confirmed.

## Content

- As-is, current problem/opportunity and to-be goals with observable success.
- Users, triggers, outcomes and relevant rejected/error scenarios.
- Testable requirements with stable `R-###` IDs and Must/Should/Could priority.
- Non-goals and constraints, including time and existing systems.
- Confirmed glossary, explicit assumptions and open questions.

The PRD chooses no stack, architecture, transport or data model. An existing
system may be a constraint; choosing a new one belongs to TDD. Testable
business rules state the observable outcome, not a particular endpoint or
class shape. Avoid vague success claims without an observable check.

## IDs and existing documents

New requirements use `R-001`, `R-002`, etc.; never reuse or renumber IDs.
If the approved upstream PRD already uses another stable scheme, preserve
those IDs through TDD/specs/tests/commits rather than silently migrating them.
Mark superseded requirements and keep their history.

## Output and handoff

Default full path: `.agents/specs/PRD.md`. Compact: `.agents/specs/PLAN.md#prd`.
An existing product PRD elsewhere is linked from the index, not duplicated.
PRD drafting creates/updates `.agents/specs/README.md` with actual paths,
mode and approval status.

Present the artifact, assumptions, inferred candidates and open questions.
Every must-have must be testable, with confirmed meaning and no unresolved
contradiction. Ask for approval using the selected mode's gate. Record who
approved what and when; do not mark Draft assumptions as confirmed.
