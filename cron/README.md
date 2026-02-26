# Cron agent runner

Run .agents and OpenCode agents on a schedule. The trigger returns immediately; the actual run happens in a queue worker or Sandbox.

- **Design:** [docs/plans/2026-02-25-cron-claude-agents.plan.md](../docs/plans/2026-02-25-cron-claude-agents.plan.md)
- **Registry:** [registry.json](./registry.json) — which agents run when (`schedule`, `enabled`, `defaultTask`, `output`).
- **Runner:** [runner.ts](./runner.ts) — entrypoint for the long-running job (invoked with `CRON_PAYLOAD` or stdin).
- **API:** [api/cron/run.ts](../api/cron/run.ts) — HTTP endpoint for cron to call; returns 202 after enqueuing due jobs.

## Local run (runner only)

```bash
CRON_PAYLOAD='{"agentId":"landing-page-design-analysis","source":"agents","task":"Run design analysis"}' bun run cron/runner.ts
```

Implementations for `runners/opencode.ts` and `runners/agents-claude.ts` are stubs; see the plan for how to complete them.
