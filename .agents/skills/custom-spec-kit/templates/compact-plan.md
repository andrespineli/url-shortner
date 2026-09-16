# <Product> compact plan

| Field | Value |
| --- | --- |
| Mode / SCM target | Compact; <timebox>; local \| remote |
| PRD status | Draft \| Approved |
| TDD status | Draft \| Approved |
| Owner / updated | <owner>; YYYY-MM-DD |

## PRD

<About half a page: actor, as-is/problem, to-be and observable success.>

| ID | Testable requirement / scenario | Priority |
| --- | --- | --- |
| R-001 | <actor, trigger, outcome and rejection path> | Must |

- Non-goals / constraints: <agreed scope and limits>
- Confirmed terms: <term: meaning>
- Assumptions / inferred candidates / open questions: <actual status>

## TDD

<About half a page: contexts/ownership, baseline/LLD/toolchain, named
components, published contract signatures, required infrastructure and risks.>

- Channel renderer, when applicable: React web \| React Ink
- Test strategy / gate: <real boundary evidence and exact commands>

| Spec | Kind | Item | Requirements | Depends on |
| --- | --- | --- | --- | --- |
| SPEC-001 | domain-structure \| channel-structure | <base to establish/verify> | Baseline | — |
| SPEC-002 | feature | <complete create/delete/update/list capability> | R-001 | SPEC-001 |

- Deferred: <CI/remote publication only if agreed local; other real deferrals>

## Approval

- PRD: <who approved which scope on YYYY-MM-DD, or pending>
- TDD: <who approved which scope on YYYY-MM-DD, or pending>
- Approval scope: <planning only, or named structure/feature specs in a grouped bundle>
- Implementation authorization: <actual prompt/chat approval and scope, or pending>
- Time allocation / final review: <e.g. reserve final 10 minutes of a 1h exercise>
- Commit ownership: <user at the end, or separately requested after review>
- Ask only for approval still missing; a planning-only approval does not authorize implementation.
