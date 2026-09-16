# SPEC-001: <App> structure

| Field | Value |
| --- | --- |
| Status | Draft \| Approved \| In progress \| In review \| Done |
| Kind | domain-structure \| channel-structure |
| TDD | <actual TDD path/section; compact ../PLAN.md#tdd> |
| Requirements | <baseline goal or covered upstream IDs> |
| Branch | feature/SPEC-001-<app>-structure, when repository work is in scope |
| Created | YYYY-MM-DD |

## 1. Goal and baseline choices

<Base to establish or verify, with no product behaviour yet.>

- Existing baseline / stack / kickstart: <actual choice; use no HTTP kickstart for React UI>
- LLD / renderer: <bound contracts and concrete references; React web or Ink for UI>
- Required infrastructure: <only what the approved scope needs>
- SCM target: local \| remote; <explicitly deferred CI if agreed local>

## 2. Skills and references for the entire baseline

| Skill / rule | Exact installed file / reference | Purpose | Tasks |
| --- | --- | --- | --- |
| <actual workflow, spec-kit, kickstart, LLD, tests and rules> | <existing paths> | <needed baseline responsibility> | T… |

Include all applicable contracts and stack concretes, plus the selected UI
renderer when relevant. Every task's Loads maps to this inventory. Resolve
required reference gaps before their dependent tasks; compact mode keeps this
coverage check too.

## 3. Tasks

<Full mode expands the baseline work below into task blocks from
spec-breakdown.md. Compact keeps a short list of cohesive tasks with the
same Loads, Verify and Done when fields. Remove work the baseline already
provides, replacing it with verification evidence.>

### T1: Establish or verify the baseline
- Type: Shared
- Requirement IDs: <baseline goal>
- Depends on: —
- Files: <actual infrastructure/source/test paths>
- Loads: <selected kickstart when available>, low-level-design/<layout contract>, lld-typescript/<matching reference>, low-level-design/tests, lld-typescript/tests, project rules
- What: baseline/toolchain and dependency wiring; create only thin infrastructure; scripts optional; no automatic staging or commit
- Verify: <focused health/smoke and configuration checks>
Done when
- [ ] the app/channel starts and its required dependencies are reachable

### T2: Gate, CI and documentation
- Type: Shared | Docs Sync
- Requirement IDs: <baseline goal>
- Depends on: T1
- Files: <gate config, CI workflow when remote, root README, .agents/specs/README.md, .agents/specs/STATE.md>
- Loads: low-level-design/tests, lld-typescript/tests, dev-workflow SCM conventions, project rules
- What: exact gate; CI runs that gate when remote publication is in scope; root README run/test instructions; synchronize spec index and state
- Verify: <exact local gate and CI evidence, or agreed local deferral>
Done when
- [ ] gate passes locally; CI passes before remote merge
- [ ] documentation paths and status reflect actual evidence

## 4. Acceptance

- [ ] health/smoke proves the selected baseline, with real required infrastructure
- [ ] local gate green; CI green when required, otherwise explicitly deferred
- [ ] diff presented for user review before any commit

## 5. Decisions and review

| Decision | Reason | Rejected alternative |
| --- | --- | --- |

- Planning approval: <scope, owner and date, or pending>
- Diff approval: <owner and date, or pending>
- Commit / PR / merge: <actual evidence for requested operations>
