#!/usr/bin/env bash
# Start a new piece of work the team way: latest main first, then your own branch.
#   npm run start-work -- <short-name>        e.g.  npm run start-work -- support-tweaks
# Branch name: <your-git-name>/<short-name>. See docs/TEAM_WORKFLOW.md.
set -euo pipefail

name="${1:-}"
if [[ -z "$name" ]]; then echo "Usage: npm run start-work -- <short-name>"; exit 1; fi
if [[ ! "$name" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then echo "Use lowercase letters, numbers and dashes only (got: $name)"; exit 1; fi

who="$(git config user.name 2>/dev/null | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9' || true)"
who="${who:-$(whoami | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9')}"
branch="$who/$name"

# Uncommitted changes to tracked files would be carried onto the wrong branch. Stop and say so.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "You have uncommitted changes. Commit or stash them first (git status shows them)."; exit 1
fi
if git show-ref --verify --quiet "refs/heads/$branch"; then echo "Branch $branch already exists. Pick another name, or: git checkout $branch"; exit 1; fi

echo "→ Getting the latest main"
git fetch origin
git checkout main
git pull --ff-only origin main
echo "→ Creating $branch from main at $(git rev-parse --short HEAD)"
git checkout -b "$branch"
echo
echo "Ready. Make your changes with Claude Code, then:  npm run ship-branch"
