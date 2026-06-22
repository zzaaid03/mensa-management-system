# mensa-management-system

University Mensa (Cafeteria) web application — frontend scaffold and project workspace.

This repository contains the frontend implementation (React + Vite) for UniMensa: a campus cafeteria system that provides meal nutrition details, pre-orders, table reservations, and a user profile system. The project is split into dedicated branches so teams can work in parallel and merge completed work into `main` via pull requests.

## Features (frontend)
- Meal Nutrition Information (MAIN FEATURE)
- Meal Pre-Orders
- Table Reservation System
- User Authentication & Profile (Firebase placeholders)

## Team members
- Frontend: Zaid (owner), Mika (owner)
- Backend: Ali (owner), Mathis (owner)
- Firebase: Wasim (owner)

## Branch responsibilities
- `main` — canonical default branch. All finished work is merged here via pull requests.
- `frontend` — frontend development (Zaid & Mika). All frontend implementation and UI changes are developed on this branch or topic branches based off it.
- `backend` — backend development (Ali & Mathis). API, database, and server-side work.
- `firebase` — Firebase integration and configuration (Wasim).

Repository structure (logical)

```
main (default)
├── frontend branch
├── backend branch
└── firebase branch
```

## Quick setup (local)
Replace `<REMOTE_URL>` with your repository URL (e.g. `https://github.com/<org>/mensa-management-system.git`). You can create the remote repository on GitHub first using the web UI or `gh repo create`.

1. Initialize repository and commit the initial scaffold

```bash
git init
git add .
# Use a conventional commit style subject for the initial commit
git commit -m "feat: initial project scaffold"
```

2. Create `main` as the default branch and push

```bash
# Rename current branch to main (if not already named main)
git branch -M main
# Add remote (replace <REMOTE_URL>)
git remote add origin <REMOTE_URL>
# Push main
git push -u origin main
```

3. Create the protected working branches and push

```bash
# Frontend branch (Zaid & Mika)
git checkout -b frontend
git push -u origin frontend

# Backend branch (Ali & Mathis)
git checkout main
git checkout -b backend
git push -u origin backend

# Firebase branch (Wasim)
git checkout main
git checkout -b firebase
git push -u origin firebase

# Return to frontend to continue work
git checkout frontend
```

Alternative using GitHub CLI (creates remote and pushes main at once):

```bash
# Create repo on GitHub and push all branches
gh repo create <OWNER>/mensa-management-system --public --source=. --remote=origin --push
# Then create and push the other branches
git checkout -b frontend && git push -u origin frontend
git checkout main
git checkout -b backend && git push -u origin backend
git checkout main
git checkout -b firebase && git push -u origin firebase
```

> Note: If you create the repository on GitHub through the web UI, ensure `main` is set as the default branch in the repository settings.

## Pull request workflow
- All completed work is merged into `main` through Pull Requests.
- Each team works on its assigned branch (`frontend`, `backend`, `firebase`) or feature/topic branches off of those branches.
- PRs should target `main` (feature branches are expected to be based on the team branch where appropriate — e.g., frontend tasks start from `frontend`).
- Require at least one code review approval before merging. Use branch protection rules on GitHub to enforce review and CI.

## Commit message convention
Use Conventional Commit-style subjects. Keep the subject short and use one of these prefixes:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — add or update tests

Examples
```bash
git commit -m "feat: add responsive navbar"
git commit -m "fix: correct price formatting in MealCard"
git commit -m "docs: update README with branch responsibilities"
```

## Contributing
See `CONTRIBUTING.md` for contribution rules and team boundaries.

## Next steps
- Integrate Firebase Authentication (on `firebase` branch)
- Connect services to the backend API (on `backend` branch)
- Add CI and branch protection rules on GitHub


## Setup

1. `.env.example` zu `.env` kopieren:
   cp .env.example .env

2. Eigene API-Keys in `.env` eintragen

3. Dependencies installieren:
   pip install -r requirements.txt

