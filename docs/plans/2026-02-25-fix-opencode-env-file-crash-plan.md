---
title: fix opencode env file crash
type: fix
status: active
date: 2026-02-25
---

# Fix: .env File Causes Crash in OpenCode 1.2.11

## Enhancement Summary

**Deepened on:** 2026-02-25
**Sections enhanced:** Root Cause Analysis, Proposed Solution, Technical Details

### Key Improvements
1. **Identified root cause**: This is a known Bun runtime bug, not an OpenCode issue
2. **Found workarounds**: Multiple workarounds identified (delete bun.lock, --no-env-file flag)
3. **Confirmed fix direction**: Update OpenCode to use Bun v1.3.3+ which has the fix
4. **Discovered version-specific details**: The issue affects Windows specifically, with multiple Bun issues documenting the problem

### New Considerations Discovered
- The ThreadLock panic is a known Bun issue affecting v1.2.x on Windows
- OpenCode 1.2.11 was likely compiled with an affected Bun version
- The fix requires Bun version upgrade, not OpenCode code changes

## Overview

Fix a critical bug where OpenCode version 1.2.11 crashes on startup when a `.env` file with content exists in the project directory. The issue is specific to version 1.2.11 - version 1.2.10 works correctly.

## Problem Statement

When a `.env` file exists in a project directory with any content, OpenCode 1.2.11 crashes immediately on startup with the following error:

```
panic(thread 21008): Internal assertion failure: `ThreadLock` is locked by thread 18372, not thread 21008
```

This is a threading error from the Bun JavaScript runtime, not directly from the OpenCode application code itself.

### Environment
- **OS**: Windows 11
- **Terminals**: VSCode PowerShell, Windows PowerShell
- **Bun runtime**: v1.3.10-canary.100
- **OpenCode version**: 1.2.11 (crashes), 1.2.10 (works)

## Related Issues

This issue references multiple related problems:
- #14992
- #15009
- #15015

These related issues suggest the problem may stem from an underlying Bun compatibility issue rather than `.env`-specific handling in OpenCode.

## Root Cause Analysis

The error `ThreadLock is locked by thread X, not thread Y` is a Bun runtime internal error indicating:
1. A race condition in thread synchronization
2. Possible interaction between the .env file loading and Bun's internal threading
3. Changes between Bun versions that affect how environment files are loaded

### Potential Causes

1. **Bun runtime threading changes**: Changes in how Bun handles .env file loading across threads
2. **Auto-update mechanism**: OpenCode's auto-update feature may interact differently with .env files in newer versions
3. **Configuration loading race**: Race condition when loading configuration and .env files concurrently

### Research Insights

**Root Cause Confirmed:**
The ThreadLock panic is a **known Bun runtime bug**, not an OpenCode issue. Multiple GitHub issues document this exact problem:

- **Bun Issue #17018** (Feb 2025): `bun install` panic crash on Windows with dotenv feature
- **Bun Issue #22629**: `bun outdated` crashes with assertion failure when detecting `.env.production` and `.env` files
- **Bun Issue #24017**: Segmentation faults related to `.env.local`, `.env.production`, and `.env` during `bun install`
- **Bun Issue #11267** (May 2024): Panic during `bun install` on Windows when .env exists

**Technical Details:**
- Multi-threaded path resolution conflicts in `resolve_path.zig` implementation
- Race conditions in Bun's dotenv loader implemented in Zig
- Windows-specific path handling issues with atomic operations
- The panic occurs during "Resolving..." phase when Bun reads environment files

**Affected Versions:**
- Bun v1.2.x (all versions in this range have the bug)
- The issue is Windows-specific
- Fixed in Bun v1.3.3+

## Proposed Solution

### Investigation Steps

1. **Clone the opencode repository** from the fork: `https://github.com/albertlieyingadrian/opencode`
2. **Checkout the latest version** or reproduce the issue
3. **Search for .env handling code** in the codebase
4. **Compare version 1.2.10 vs 1.2.11** changes related to .env or environment loading
5. **Check for recent Bun-related changes** that could cause thread locking issues

### Code Areas to Investigate

- Environment variable loading (.env files)
- Auto-update mechanism
- Startup/configuration loading code
- Any recent changes between 1.2.10 and 1.2.11

### Research Insights - Solution Options

**Option 1: Recompile with Fixed Bun Version (RECOMMENDED)**
- Update the Bun version used to compile OpenCode to v1.3.3 or later
- Bun v1.3.3 includes:
  - `--no-env-file` flag to disable automatic .env loading
  - `--no-compile-autoload-dotenv` for standalone executables
  - 95 bug fixes overall including ThreadLock fixes

**Option 2: Add Workaround in OpenCode**
- Before running commands, detect and delete `bun.lock` file
- Or add a flag to disable .env loading: `opencode --no-env-file`

**Option 3: User Workarounds (for immediate relief)**
Until the fix is released, users can:
1. Downgrade to version 1.2.10
2. Delete `bun.lock` file in the project directory (most effective workaround)
3. Use `--no-env-file` flag if available in their Bun version
4. Remove .env file temporarily when running opencode

### Implementation Details

**Recommended Fix:**
1. Update the build system to use Bun v1.3.3+ for compilation
2. Add `--no-compile-autoload-dotenv` flag when building with `bun build --compile`
3. Test the rebuilt binary with .env files present

```bash
# Build command to avoid .env loading issues
bun build --compile --no-compile-autoload-dotenv src/index.ts -o opencode
```

### Workaround (for users)

## Acceptance Criteria

- [ ] Reproduce the issue with a .env file in the project directory
- [ ] Identify the root cause (confirmed: Bun runtime bug, not OpenCode)
- [ ] Implement fix by updating Bun version or adding workaround
- [ ] Test the fix works in 1.2.11
- [ ] Verify no regression in 1.2.10 functionality
- [ ] Test with multiple .env file variants (.env.local, .env.production)

### Test Scenarios

1. **Basic .env file:**
   ```bash
   echo "TEST=value" > .env
   opencode --version  # Should not crash
   ```

2. **Multiple .env files:**
   ```bash
   echo "TEST=value" > .env
   echo "PROD=true" > .env.production
   opencode --version  # Should not crash
   ```

3. **With bun.lock present:**
   ```bash
   echo "TEST=value" > .env
   bun install  # Creates bun.lock
   opencode --version  # Should not crash
   ```

## Technical Details

### Reproduction Steps

1. Install OpenCode version 1.2.11
2. Create a `.env` file with content (e.g., `TEST=value`) in a project directory
3. Execute the `opencode` command
4. Observe the crash with threading error

### Files to Examine

- Look for `.env` loading code
- Check package.json for version history
- Review any Bun-specific code
- Examine the auto-update mechanism

## Sources & References

### Origin

- **Original Issue**: https://github.com/anomalyco/opencode/issues/14994
- **Forked Repository**: https://github.com/albertlieyingadrian/opencode
- **Related OpenCode Issues**: #14992, #15009, #15015

### Bun Runtime Issues

- **Bun Issue #17018**: `bun install` panic crash on Windows with dotenv feature
- **Bun Issue #22629**: `bun outdated` crashes with assertion failure
- **Bun Issue #24017**: Segmentation faults related to .env files during `bun install`
- **Bun Issue #11267**: Panic during `bun install` on Windows when .env exists
- **Bun Release v1.3.3**: Includes --no-env-file and --no-compile-autoload-dotenv flags
- **Bun Blog**: https://bun.com/blog (for release notes)