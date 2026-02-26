#!/usr/bin/env bun
/**
 * Cron agent runner entrypoint.
 * Invoked by a queue worker or Sandbox with payload: agentId, source, task?, output?
 *
 * Usage (worker passes via env):
 *   CRON_PAYLOAD='{"agentId":"landing-page-design-analysis","source":"agents","task":"..."}' bun run cron/runner.ts
 *
 * Or via stdin:
 *   echo '{"agentId":"duplicate-pr","source":"opencode"}' | bun run cron/runner.ts
 *
 * See docs/plans/2026-02-25-cron-claude-agents.plan.md
 */

import { runOpenCodeAgent } from "./runners/opencode.js"
import { runAgentsClaude } from "./runners/agents-claude.js"

type Payload = {
  agentId: string
  source: "opencode" | "agents"
  task?: string
  output?: "commit" | "slack" | "none"
}

async function getPayload(): Promise<Payload> {
  const raw = process.env.CRON_PAYLOAD ?? (await readStdin())
  if (!raw?.trim()) {
    console.error("Missing CRON_PAYLOAD env or stdin JSON")
    process.exit(1)
  }
  try {
    return JSON.parse(raw) as Payload
  } catch {
    console.error("Invalid CRON_PAYLOAD JSON")
    process.exit(1)
  }
}

function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  return new Promise((resolve) => {
    process.stdin.on("data", (chunk) => chunks.push(chunk))
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
  })
}

async function main() {
  const payload = await getPayload()
  const { agentId, source, task, output = "none" } = payload

  if (source === "opencode") {
    await runOpenCodeAgent(agentId, task ?? "", output)
    return
  }
  if (source === "agents") {
    await runAgentsClaude(agentId, task ?? "", output)
    return
  }

  console.error(`Unknown source: ${source}`)
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
