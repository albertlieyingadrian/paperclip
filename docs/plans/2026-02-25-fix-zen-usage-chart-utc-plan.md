---
title: Fix Zen usage chart displaying UTC dates instead of local timezone
type: fix
status: active
date: 2026-02-25
---

# Fix Zen Usage Chart Displaying UTC Dates Instead of Local Timezone

## Enhancement Summary

**Deepened on:** 2026-02-25
**Sections enhanced:** Technical Considerations, Proposed Solution
**Research agents used:** repo-research-analyst, best-practices-researcher

### Key Improvements
1. Identified exact file locations and line numbers of the bug
2. Found two specific code issues causing UTC date display
3. Discovered related issues with same root cause (#11606, #9025)

---

## Overview

The Zen plugin's usage chart is displaying dates in UTC rather than the user's local timezone, causing the chart to show incorrect dates (often the next day) when the user's local time is before midnight UTC.

## Problem Statement

From the issue:
- User viewed the usage chart at "24-Feb-2026 20:30" (local time)
- The chart showed usage for "25-Feb-2026" (incorrect)
- This happens because the date is being calculated in UTC without converting to local timezone

## Proposed Solution

Find and fix the timezone handling in the Zen plugin's usage chart code to use the user's local timezone instead of UTC when displaying dates.

### Research Insights

**Root Cause Identified:**
- `toISOString()` always returns dates in UTC format (ISO 8601 standard)
- `getUTCDate()` returns the day of the month in UTC, not local time
- When a user is in a timezone like EST (UTC-5), at 8pm local time on Feb 24, the UTC date is already Feb 25

**Related Issues Found:**
- Issue #11606: Zen workspace missing data with incorrect labels in Asia/Singapore timezone
- Issue #9025: Session timestamps display in UTC instead of local time (same root cause - `toISOString()`)

### Files to Modify

1. `/packages/console/app/src/routes/workspace/[id]/graph-section.tsx` - Main fix location
2. `/packages/console/app/src/routes/workspace/common.tsx` - May want to add a local timezone variant of `formatDateUTC`

## Technical Considerations

### Bug #1 - `getDates` function (graph-section.tsx)

**Current buggy code:**
```typescript
const getDates = createMemo(() => {
  const daysInMonth = new Date(store.year, store.month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(store.year, store.month, i + 1)
    return date.toISOString().split("T")[0]  // <-- Returns UTC date string!
  })
})
```

**Fix:** Replace `date.toISOString().split("T")[0]` with a method that returns local date string:
- Use `date.toLocaleDateString('en-CA')` (which returns YYYY-MM-DD in local time)
- Or construct the date string manually using local date methods: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

### Bug #2 - `formatDateLabel` function (graph-section.tsx)

**Current buggy code:**
```typescript
function formatDateLabel(dateStr: string): string {
  const date = new Date()
  const [y, m, d] = dateStr.split("-").map(Number)
  date.setFullYear(y)
  date.setMonth(m - 1)
  date.setDate(d)
  date.setHours(0, 0, 0, 0)
  const month = date.toLocaleDateString(undefined, { month: "short" })
  const day = date.getUTCDate().toString().padStart(2, "0")  // <-- Uses UTC!
  return `${month} ${day}`
}
```

**Fix:** Replace `date.getUTCDate()` with `date.getDate()` to use local day

### Database Query Consideration

The database query uses `DATE(UsageTable.timeCreated)` which also uses UTC by default. Consider using the connection's timezone or passing timezone info if data appears missing.

### Related File (common.tsx)

Contains `formatDateUTC` that hardcodes UTC timezone - may want to add a local timezone variant:
```typescript
export function formatDateUTC(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    // ... other options
    timeZone: "UTC",  // <-- Hardcoded to UTC
  }
  return date.toLocaleDateString(undefined, options)
}
```

## Acceptance Criteria

- [ ] Usage chart displays dates in user's local timezone
- [ ] Chart correctly shows the current local date (not UTC date)
- [ ] No timezone-related date errors in console
- [ ] Fix both `getDates` and `formatDateLabel` functions in graph-section.tsx
- [ ] Test with timezone before midnight UTC (e.g., EST, PST)

## Context

- Related issue: https://github.com/anomalyco/opencode/issues/14988
- The bug affects users whose local time is before midnight UTC
- Same root cause found in issue #9025 and #11606

## Sources

- Related issue: #14988
- Related issues: #11606, #9025
- Zen plugin documentation (if exists)
- Files identified: `/packages/console/app/src/routes/workspace/[id]/graph-section.tsx`
- Files identified: `/packages/console/app/src/routes/workspace/common.tsx`