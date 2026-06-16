# CONTRIBUTING

This repository follows a branch-per-team strategy. Read this document before contributing.

## Team branch boundaries
- Frontend Team
  - Works exclusively on the `frontend` branch (and topic/feature branches derived from it).
  - Owners: Zaid, Mika
- Backend Team
  - Works exclusively on the `backend` branch (and topic/feature branches derived from it).
  - Owners: Ali, Mathis
- Firebase Team
  - Works exclusively on the `firebase` branch (and topic/feature branches derived from it).
  - Owner: Wasim

## Branching strategy
- `main` — default branch. All completed work must be merged into `main` through Pull Requests.
- Each team has a long-lived branch: `frontend`, `backend`, `firebase`.
- For day-to-day tasks, create short-lived topic branches off the appropriate team branch:
  - `feat/<short-description>` — new feature
  - `fix/<short-description>` — bug fix
  - `refactor/<short-description>` — refactor
  - `test/<short-description>` — tests

Example (frontend feature):
```bash
git checkout frontend
git pull origin frontend
git checkout -b feat/responsive-navbar
# implement, commit, push
git push -u origin feat/responsive-navbar
# open PR to merge into main (or into frontend if your team prefers)
```

## Pull requests
- Target branch: PRs should target `main` (unless instructed otherwise by the team lead).
- PR title & commit messages: follow Conventional Commit prefixes (see below).
- Reviews: At least one review approval is required. Prefer peer review by the team owner(s).
- CI: Ensure your branch passes automated checks before requesting a review.

## Conventional commits
Use these prefixes in your commit messages:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — non-functional code changes
- `test:` — add or update tests

Commit message examples:
```
feat: add responsive navbar
fix: handle empty menu response
docs: add GitHub setup instructions to README
refactor: split MealCard into smaller components
```

## Review checklist (before creating PR)
- [ ] Code builds locally
- [ ] Linting passes
- [ ] No console.log debug statements
- [ ] Accessible (aria attributes where appropriate)
- [ ] Tests updated/added for new behaviour (when applicable)

## Additional notes
- Keep changes scoped and small — easier to review and test.
- If you need to change repository-wide configuration (CI, branch protection, CODEOWNERS), coordinate with the repository owners first.

Thanks for contributing — keeping a clear branch-per-team workflow helps parallelize work while keeping `main` stable.
