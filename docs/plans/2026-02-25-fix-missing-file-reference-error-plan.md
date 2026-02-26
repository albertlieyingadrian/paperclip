---
title: Fix missing {file:} reference causing entire agent config to fail
type: fix
status: active
date: 2026-02-25
---

## Enhancement Summary

**Deepened on:** 2026-02-25
**Sections enhanced:** Technical Details, Implementation Approach, Acceptance Criteria
**Research agents used:** kieran-typescript-reviewer, best-practices-researcher

### Key Improvements

1. Added type definitions for warning tracking in config loading
2. Added consideration for configurable strict mode
3. Clarified logging approach
4. Added more specific acceptance criteria

### New Considerations Discovered

- Consider returning warnings to callers so they can decide how to handle
- Could add optional strict mode for configs that need fail-fast behavior
- Type safety: ensure skipped files are properly handled in the config object

## Overview

When an `opencode.json` contains a `{file:./path}` reference that doesn't exist on disk, OpenCode rejects the entire agent configuration with a hard error. This prevents all agent files from loading — including ones that do exist.

## Problem Statement

The current behavior throws an `InvalidError` when any `{file:}` reference points to a non-existent file:

```
Error: Configuration is invalid at /var/www/extrachill.com/opencode.json: bad file reference: "{file:./AGENTS.md}" /var/www/extrachill.com/AGENTS.md does not exist
```

This breaks the entire agent context because one optional file is missing.

## Proposed Solution

Change the error-throwing behavior to a warning, allowing the agent config to load with the remaining valid file references.

### Implementation Approach

1. **Modify error handling** in `packages/opencode/src/config/config.ts`:
   - Instead of throwing `InvalidError` when file doesn't exist (ENOENT)
   - Log a warning with the missing file path
   - Skip the missing file and continue processing remaining `{file:}` references

2. **Graceful degradation**:
   - Track which files are missing
   - Include missing files in warning output
   - Allow agent to initialize with available files only

## Technical Details

### File Location

- **File**: `packages/opencode/src/config/config.ts`
- **Function**: `load()` - processes `{file:}` references in config text

### Current Behavior (lines ~80-100)

```typescript
const fileMatches = text.match(/\{file:[^}]+\}/g)
// ... processes each match
if (error.code === "ENOENT") {
  throw new InvalidError({
    path: source,
    message: errMsg + ` ${resolvedPath} does not exist`,
  }, { cause: error })
}
```

### Proposed Change

```typescript
const fileMatches = text.match(/\{file:[^}]+\}/g)
// ... processes each match
if (error.code === "ENOENT") {
  // Log warning instead of throwing
  console.warn(`Warning: File reference {file:${match}} points to non-existent file: ${resolvedPath}, skipping`)
  continue // or skip this match and continue
}
```

### Research Insights

**TypeScript Best Practices (from kieran-typescript-reviewer):**

The plan should consider type handling for skipped files. Consider defining a result type:

```typescript
interface ConfigLoadResult {
  config: Config;
  warnings: string[];
  hasMissingFiles: boolean;
}
```

This allows callers to know about skipped files and handle them appropriately.

**Error Handling Patterns (from best-practices-researcher):**

- Use consistent logging (check if opencode uses a custom logger vs console.*)
- Distinguish between "file not found" (soft error) vs "permission denied" (hard error)
- Consider making behavior configurable via `strictFileReferences` option (default: false)

### Alternative: Collect Missing Files

A more robust approach would collect all missing files first, then warn about them collectively:

```typescript
const missingFiles: string[] = []
for (const match of fileMatches) {
  // ... resolve path
  if (!fs.existsSync(resolvedPath)) {
    missingFiles.push(resolvedPath)
    continue
  }
  // ... process valid file
}
if (missingFiles.length > 0) {
  console.warn(`Warning: The following file references point to non-existent files:`)
  missingFiles.forEach(f => console.warn(`  - {file:...} -> ${f}`))
}
```

## System-Wide Impact

### Interaction Graph

- Config loading → file reference resolution → skipping missing files
- No downstream callbacks should be affected since valid files still load

### Error Propagation

- Errors now become warnings
- Agent initialization continues with available files

### API Surface Parity

- No public API changes
- Internal config loading behavior only

## Acceptance Criteria

- [ ] Missing `{file:}` reference logs a warning instead of throwing error
- [ ] Agent configuration loads successfully when some (but not all) referenced files exist
- [ ] Warning message clearly identifies which files are missing
- [ ] All valid `{file:}` references are still processed correctly
- [ ] Other file errors (permission denied, read errors) still throw as before
- [ ] Code compiles without TypeScript errors

## Testing Requirements

1. **Unit test**: Missing file produces warning, not error
2. **Integration test**: Agent loads with partial file references
3. **Manual test**: Verify warning output shows missing file paths

## Sources

- **Issue**: [anomalyco/opencode#15033](https://github.com/anomalyco/opencode/issues/15033)
- **Source file**: [packages/opencode/src/config/config.ts](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/src/config/config.ts)