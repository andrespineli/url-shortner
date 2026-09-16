# TDD writing guide

This is custom-spec-kit's product-wide macro technical design. TDD here means
Technical Design Document. Use [../templates/tdd.md](../templates/tdd.md) in
full mode or the TDD section of
[../templates/compact-plan.md](../templates/compact-plan.md) in compact mode.
Follow the project's artifact language convention.

## Inputs and scope

Start from the approved product PRD. Compact mode may draft a provisional TDD
alongside its PRD for joint planning approval; no implementation follows until
the planning bundle and the relevant spec are approved.

Confirm the existing architecture, bound LLD and stack, channel renderer,
consumed systems/data and unknowns that change the design. Reuse a baseline
already selected in the project. Do not ask users to re-decide known choices.

## Content that changes implementation decisions

- **Bounded contexts and scope lines**: each owns requirement IDs and explicit
  responsibilities; state what belongs in another context.
- **Services/deployables**: process boundaries, ownership and responsibilities.
- **Components per context**: named aggregates/models, commands, read models,
  ports/adapters and endpoints; UI channels name client/provider/screen/form.
- **Contracts at signature level**: request/response fields and error semantics,
  event schemas/versioning, producer/consumer and data ownership. Document
  consistency, timeout or compatibility decisions when the scope needs them.
- **Cross-cutting choices**: necessary persistence, auth, configuration and
  observability; reason and material alternative for non-obvious decisions.
- **Tests and gate**: baseline verification strategy and channel/client boundary
  evidence. Concrete test harnesses belong to `low-level-design/tests` and
  `lld-typescript/tests`; a fake-client component test is not API integration.
- **Risks, mitigation and rollout** proportional to this product's scope.
- **Macro plan**: numbered specs, each delivering a complete feature after the base, requirement IDs and actual
  dependencies. SPEC-001 establishes/verifies the base. Use
  [spec-categories.md](spec-categories.md) for kinds and task directives.

Dependencies between layers normally become task dependencies within the same
feature spec. A create feature includes its required adapter; a later delete
feature reuses/extends it. Spec dependencies represent delivered capabilities
or necessary bases, never an automatic domain → adapter → command spec chain.

## What stays out

No implementation source paths, method bodies, decorators or operational
command recipes. Published contract signatures/schema fields are appropriate;
concrete handlers and file-level work belong to specs and the selected LLD.
Do not copy the PRD's business prose or create a second TDD for each use case.

## Output and handoff

Full: `.agents/specs/TDD.md`. Compact: `.agents/specs/PLAN.md#tdd`. Link an
existing approved product design instead of duplicating it. Update the index
with the plan and actual approval status; future spec entries remain unlinked
until their files exist.

Check that every in-scope must-have is owned by a context and covered by at
least one planned spec, contracts have owners and dependencies are satisfiable.
Surface open design gaps and ask for the selected mode's approval. Later
technical deviations update this same TDD and the affected specs for approval.
