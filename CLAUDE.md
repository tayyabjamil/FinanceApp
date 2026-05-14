# Claude Instructions — Finance Project

## Session Start
At the start of every new session, before doing anything else:
1. Ask the user: "What are you working on today?"
2. Wait for their response
3. Create or update a Feature note in the Obsidian vault at `/Users/affanmahboob/Desktop/FinanceProject/FinanceVault/Features/` using the format below
4. Tell the user the note was saved and which file it's in

## Feature Note Format
When creating a new feature note, use this filename: `YYYY-MM-DD Feature Name.md`

```markdown
---
date: YYYY-MM-DD
status: in-progress
tags: [feature]
---

# Feature: [Name]

## Description
[What the user said they want to work on]

## Acceptance Criteria
- [ ]

## Implementation Notes


## Bugs
<!-- Bugs are logged here automatically -->

## Files Affected

```

If a note for this feature already exists, open it and update the status/notes instead of creating a duplicate.

## Logging Bugs
Whenever a bug is discovered during a session (error in terminal, test failure, unexpected behavior, or user says "bug" / "broken" / "not working"):
1. Add a bug entry to the **Bugs** section of the current session's feature note
2. Use this format:

```
### Bug: [short description]
- **Date**: YYYY-MM-DD
- **Status**: open
- **Description**: [what went wrong]
- **Steps to reproduce**:
- **Fix**: [fill in when resolved]
- **Resolved**: [ ]
```

3. When the bug is fixed, update **Status** to `resolved`, fill in **Fix**, and check **Resolved**.

## Branch Tracking
Whenever a new git branch is created (user says "create a branch", "new branch", or runs `git checkout -b`):
1. Note the branch name
2. Create a Branch note at `/Users/affanmahboob/Desktop/FinanceProject/FinanceVault/Branches/[branch-name].md` using the format below
3. Link it from the current Feature note under a **Branch** field
4. Tell the user the branch note was created

### Branch Note Format
```markdown
---
date: YYYY-MM-DD
branch: [branch-name]
feature: [feature name]
tags: [branch]
---

# Branch: [branch-name]

## Purpose
[What this branch is for]

## Packages Added
<!-- Logged automatically when packages are installed -->

## Changes
-

## Bugs
<!-- Bugs logged here automatically -->
```

## Package Tracking
Whenever a package is installed or removed (npm install, npx expo install, npm uninstall, etc.):
1. Find the current branch note in `/Users/affanmahboob/Desktop/FinanceProject/FinanceVault/Branches/`
2. Add an entry under **Packages Added** in this format:
```
- `[package-name]@[version]` — [what it's for] (added YYYY-MM-DD)
```
3. If the package was removed, add:
```
- ~~`[package-name]`~~ — removed YYYY-MM-DD
```

If no branch note exists yet for the current branch, create one first.

## Vault Location
`/Users/affanmahboob/Desktop/FinanceProject/FinanceVault/`
