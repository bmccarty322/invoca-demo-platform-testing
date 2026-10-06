#!/usr/bin/env bash
# Push YOUR branch for preview. First brings in anything new on main, so you never preview stale code.
set -euo pipefail
branch="$(git branch --show-current)"
if [[ "$branch" == "main" || -z "$branch" ]]; then echo "You are on '$branch'. Run: npm run start-work -- <short-name>"; exit 1; fi
if ! git diff --quiet || ! git diff --cached --quiet; then echo "Commit your changes first (git add -A && git commit -m \"...\")."; exit 1; fi

echo "→ Bringing in the latest main"
git fetch origin
if ! git merge origin/main -m "Merge main into $branch"; then
  echo; echo "Merge conflicts. Resolve the files git lists (ask Claude Code to help), then: git add -A && git commit"
  echo "Then run this again."; exit 1
fi
echo "→ Checking"
npm run typecheck
echo "→ Pushing $branch"
git push -u origin "$branch"
echo
echo "Pushed. Review it: npm run serve  (http://localhost:3000), or the branch preview link if one is set up."
echo "Open a pull request: https://github.com/ddesai-invoca/invoca-demo-platform-testing/pull/new/$branch"
