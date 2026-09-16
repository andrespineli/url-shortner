# SCM contract — GitHub provider

Concrete provider for the `dev-workflow` `scm` contract. SCM is the
mechanism for versioning and collaboration; GitHub is the current provider
example. Use `gh` when GitHub operations are requested. Check `gh auth status`
first; if authentication is absent, request login instead of trying remote
writes. Adapt commands to the project's configured SCM provider.

## Repository and branches

- Create a repository only when the task needs one, on the owner/organization
  the user supplies. Default visibility: private; default branch: `main`.
- Spec branch: `feature/SPEC-NNN-<slug>`; fixes outside a spec: `fix/<slug>`.
  Other methodologies retain their own spec IDs in the branch name.
- Branch from the current `main`. In an empty repository, establish the base
  history explicitly; do not assume `main` already exists or that an initial
  feature commit can be compared against an empty base.
- One spec per PR for custom-spec-kit. Other methodologies use their own
  work-unit convention. Never force-push a shared branch.

Repository creation is distinct from committing and pushing. Do not hide an
initial push inside repository setup or a scaffold command.

## Commits

```text
<type>(<scope>): <imperative subject> (SPEC-NNN)

<reason or material trade-off when needed>

Refs: R-001, R-004
```

Scope is the bounded context or changed area. Types: `feat`, `fix`, `docs`,
`chore`, `refactor`, `test`, `security`, `ci`, `build`. One commit per coherent
concern; behaviour and its tests ship together. Requirement IDs are reused,
including existing upstream IDs. Attribution follows project policy; the
house default adds no attribution trailer.

The user must review and approve the diff before commit, push or PR creation.
Bootstrap never stages or commits automatically. If the user reserves commits
for the end, accumulate the verified changes and present one final review;
do not insert per-task/per-spec commits. When the user will commit personally,
leave the tree uncommitted even after diff approval.

## Gate and pull request

Run the exact project gate in CI order: format check → lint → type check →
tests. The local gate must pass before push; CI must pass before merge.

Use [../templates/pr.md](../templates/pr.md). Title follows the commit format;
body explains the problem and resulting behaviour, requirements covered,
validation and material deviations. Fill the spec link and actual planning
path rather than assuming every methodology uses `TDD.md`.

```sh
gh pr create --base main --head feature/SPEC-NNN-<slug> \
  --title "<type>(<scope>): <subject> (SPEC-NNN)" \
  --body-file <filled-pr-body-file>
```

Use a file with actual newlines for the PR body. Open as draft while required
CI checks or review remain pending. Report the PR link; PR creation does not
imply authorization to merge.

## Merge and releases

Squash merge when authorized; the PR title becomes the commit subject.
Follow the project's release process. In projects where a version bump on
`main` triggers release, do not bundle it into a feature PR. After merge,
update local `main` with a fast-forward pull and remove the merged local
branch. Keep spec/index/state status consistent with actual commit, PR and
merge evidence.
