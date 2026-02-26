---
title: fix sandbox fs syntax error on filenames with ---
type: fix
status: active
date: 2026-02-24
---

# Fix: Sandbox FS Syntax Error on Filenames with `---`

## Overview

Fix a critical bug where sandbox filesystem operations fail with `Syntax error: ";" unexpected` when file paths contain the `---` pattern used in OpenClaw's auto-generated inbound media filenames (e.g., `file_1095---f00a04a2-99a0-4d98-99b0-dfe61c5a4198.ogg`).

## Problem Statement

After upgrading from 2026.2.22 to 2026.2.23, all sandbox filesystem operations (`read`, `write`, `image`) fail when file paths contain the `---` pattern in their filenames. The error occurs in the shell command execution in the fs-bridge.ts file.

Error message:
```
moltbot-sandbox-fs: 1: Syntax error: ";" unexpected
```

This breaks ALL inbound media processing - agents cannot see photos, voice notes, or documents sent by users via Telegram.

## Enhancement Summary

**Deepened on:** 2026-02-24
**Sections enhanced:** Root Cause Analysis, Proposed Solution, Technical Details

### Key Improvements
1. Identified the exact location of the bug in fs-bridge.ts `runCommand()` method
2. Confirmed the shell escaping issue with filenames containing `---` pattern
3. Detailed the specific shell command execution flow through Docker exec

### New Considerations Discovered
- The issue manifests when passing file paths with `---` as shell arguments
- Docker exec with sh -c passes arguments as $0, $1, etc. which can have parsing issues
- Need to escape filenames properly or use printf '%q' for safe shell argument passing

## Root Cause Analysis

The issue is in `src/agents/sandbox/fs-bridge.ts`. When file paths are passed to the shell script via `runCommand()`, they need proper escaping. Filenames containing `---` may be interpreted as shell options or cause parsing issues.

Looking at the code in `runCommand()`:
```typescript
const dockerArgs = [
  "exec",
  "-i",
  this.sandbox.containerName,
  "sh",
  "-c",
  script,
  "moltbot-sandbox-fs",
];
if (options.args?.length) {
  dockerArgs.push(...options.args);
}
```

The file path is passed as a raw argument to the shell, which may cause issues with certain filenames.

### Research Insights

**Root Cause:**
The error `moltbot-sandbox-fs: 1: Syntax error: ";" unexpected` occurs because filenames with `---` (three consecutive hyphens) can confuse the shell's argument parsing when passed through `sh -c`. Even though the script uses `"$1"` quoting, the underlying argument passing mechanism may have edge cases.

**Best Practice Solution:**
Use `printf '%q'` to properly escape file paths, ensuring special characters are safely passed to shell commands. Alternatively, ensure paths don't start with hyphens by prepending `./` if needed.

### Implementation Details

**Locations to fix in fs-bridge.ts:**
1. Line 98: `runCommand('set -eu; cat -- "$1"', { args: [target.containerPath]`
2. Line 123: writeFile script
3. Line 134: mkdirp script
4. Line 158: remove script
5. Line 183: rename script
6. Line 199: stat script
7. Line 309: resolveCanonicalContainerPath script

**Fix approach:**
Either escape the containerPath using printf '%q' or ensure paths starting with '-' are prefixed with './' to prevent them being interpreted as options.

## Proposed Solution

The fix involves properly escaping file paths when passing them to shell commands. We need to ensure the file path is properly quoted to prevent shell interpretation of special characters.

### Implementation Approach

1. **For all shell commands in fs-bridge.ts**: Ensure file paths are passed with proper escaping
2. **Use printf with %q for additional safety**: Use `printf '%q'` to properly escape values

## Acceptance Criteria

- [ ] Filenames with `---` pattern work correctly in sandbox fs operations
- [ ] All read, write, image, stat, remove, rename operations work with problematic filenames
- [ ] The fix is backwards compatible with existing filenames
- [ ] No regression in normal file operations

## Technical Details

### Files to Modify
- `src/agents/sandbox/fs-bridge.ts`

### Test Scenarios
- Test with filename: `file_1095---f00a04a2-99a0-4d98-99b0-dfe61c5a4198.ogg`
- Test with filename: `file_1221---6c4f9947-8cbb-48a1-a834-e69c2bbfeaa2.md`
- Test with filename: `file_1569---54dcf3f8-9874-4888-8f47-a5fb719f584f.md`

## Sources & References
- Related issue: https://github.com/openclaw/openclaw/issues/25824
- Test file pattern: `src/agents/sandbox/fs-bridge.test.ts`
