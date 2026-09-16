# Contract: SDD

The bound methodology turns requirements into approved design, executable
specs/tasks and verified code. It owns planning depth, file layout and spec
granularity; this contract owns traceability and verification.

## Inputs

- Approved planning artifacts required by the capability. For custom-spec-kit:
  the product PRD and TDD, including their compact form when selected.
- Existing upstream requirement IDs and architecture decisions, when present.
- The codebase, project conventions and test suite.

## Required outputs

- A spec for each work unit defined by the capability, carrying stable
  requirement IDs and references to the design it implements. In custom-spec-kit
  a feature spec spans all necessary layers, with tasks following LLD directives.
- Atomic tasks with loaded references and observable verification criteria.
  Small scopes may inline tasks when the capability permits it.
- Implemented code with verification evidence, ready for user review.
- Recorded deviations and current planning status.

## Rules and gates

Use the capability's sizing and approval rules, including an explicit compact
planning gate when supported. Do not infer approval from silence or from a
change request. When implementation reveals a business or design gap, update
and re-approve the affected planning artifacts before coding around it.

A task without a passing check is not done. The implementation handoff is a
verified diff presented for review. Commits and PRs follow dev-workflow's
repository conventions after the user approves that diff.

## Handoff

- Every in-scope must-have ID traces to verified work and relevant tests.
- The design reflects the implementation, with deviations recorded.
- The gate passes and the diff is ready for the user's review.
- After approval, commit/PR evidence is recorded in the capability's artifacts.
