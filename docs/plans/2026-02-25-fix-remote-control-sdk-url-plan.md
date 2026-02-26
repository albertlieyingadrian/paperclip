---
title: fix remote-control bad option --sdk-url
type: fix
status: completed
date: 2026-02-25
---

# Fix: remote-control fails with 'bad option: --sdk-url'

## Overview

Fix a bug where `claude remote-control` (or `claude rc`) immediately fails with `bad option: --sdk-url` error. The session starts but crashes on spawn because `--sdk-url` is being passed as a Node.js flag instead of an application argument.

## Problem Statement

When running `claude remote-control --verbose`, the session fails with:

```
Session failed: /Users/.../.nvm/versions/node/v22.17.0/bin/node: bad option: --sdk-url session_01Gmy7eSHd4jc7tXDZTxbZ4m
```

This happens because the bridge session spawner uses `process.execPath` (the Node.js binary) as the command to spawn child sessions, resulting in Node.js interpreting `--sdk-url` as a Node.js option rather than an application argument.

## Root Cause Analysis

From issue #28323 (the main issue this is a duplicate of):

The bridge session spawner uses `process.execPath` (the Node.js binary) as the command to spawn child sessions:

```js
let l = IPq({ execPath: process.execPath, env: process.env, ... });
// later:
let O = spawn(A.execPath, ["--print", "--sdk-url", url, "--session-id", id, ...], { ... });
```

On an npm installation, `process.execPath` is the Node.js binary itself, so this results in:

```
spawn("/path/to/node", ["--print", "--sdk-url", <url>, ...])
```

Node.js interprets `--print` as its own `-p` flag and then rejects `--sdk-url` as an unrecognized Node.js option.

## Proposed Solution

Use the resolved CLI executable path (via `process.argv[1]` for npm installs) instead of raw `process.execPath` when spawning bridge child sessions.

The codebase already has helper functions (internally named `_c4()` / `gc4()` in minified code) that correctly resolve the CLI path for npm installations by returning `process.argv[1]` instead of `process.execPath` when not running as a Bun binary, but the bridge initialization doesn't use them.

## Technical Details

### Files to Modify
The issue is in the bridge session spawning code. Based on the issue analysis, the fix would be in code that does:

```js
// Current (broken):
spawn(process.execPath, ["--print", "--sdk-url", url, "--session-id", id, ...], { ... })

// Fixed:
spawn(resolvedCliPath, ["--print", "--sdk-url", url, "--session-id", id, ...], { ... })
```

Where `resolvedCliPath` is obtained via the existing helper function that returns `process.argv[1]` for npm installs.

### Note on Repository Structure
This repository (claude-code) appears to contain only plugins, examples, and scripts - not the main CLI source code. The CLI source code is distributed as a pre-built npm package (`@anthropic-ai/claude-code`). The fix would need to be applied to the CLI source code which is not present in this repository.

### Enhancement Summary

**Deepened on:** 2026-02-25
**Sections enhanced:** Technical Details, Note on Repository Structure

### Key Findings
1. The source code for the CLI is not in this repository - it's a pre-built npm package
2. The fix requires changing `process.execPath` to `process.argv[1]` in the bridge spawning code
3. This is a known issue with multiple duplicates (28323, 28361, 28394, 28413)

### New Considerations
- **Source code location**: The actual CLI code is closed-source/distributed
- **Alternative approaches**:
  - Check if there's a local override or plugin mechanism
  - The fix may need to be submitted upstream to Anthropic
  - Check user's fork for any patches or local changes

## Acceptance Criteria

- [ ] Identify the exact file/function where the spawn happens
- [ ] Replace `process.execPath` with the resolved CLI path
- [ ] Verify the fix works for npm installations on both macOS and Windows

## Sources & References
- Related issue: https://github.com/anthropics/claude-code/issues/28413
- Main issue: https://github.com/anthropics/claude-code/issues/28323
- Duplicate: https://github.com/anthropics/claude-code/issues/28361
- Duplicate: https://github.com/anthropics/claude-code/issues/28394
