/**
 * Cron trigger endpoint: run due agent jobs.
 *
 * - Auth: require Authorization: Bearer <CRON_SECRET> or x-cron-secret header.
 * - Behavior: resolve due jobs from cron/registry.json, enqueue each (or start Sandbox), return 202.
 * - Do NOT run the agent here — return quickly to avoid serverless timeout.
 *
 * Deploy as Vercel serverless: api/cron/run.ts (default export).
 * See docs/plans/2026-02-25-cron-claude-agents.plan.md
 */

import { readFileSync } from "fs"
import { join } from "path"

const CRON_SECRET = process.env.CRON_SECRET

type Job = {
  id: string
  agentId: string
  source: "opencode" | "agents"
  schedule: string
  defaultTask?: string
  enabled: boolean
  output?: "commit" | "slack" | "none"
}

function loadRegistry(): { jobs: Job[] } {
  const path = join(process.cwd(), "cron", "registry.json")
  return JSON.parse(readFileSync(path, "utf8"))
}

function isDue(cronExpr: string, now: Date): boolean {
  // Minimal: for exact-hour schedules like "0 9 * * 1", check hour and weekday.
  // For production use a proper cron parser (e.g. cron-parser).
  const [min, hour, , , dow] = cronExpr.split(" ")
  const utcMin = now.getUTCMinutes()
  const utcHour = now.getUTCHours()
  const utcDow = now.getUTCDay()
  if (min !== "*" && parseInt(min, 10) !== utcMin) return false
  if (hour !== "*" && parseInt(hour, 10) !== utcHour) return false
  if (dow !== "*") {
    const dows = dow.includes("-") ? dow.split("-").map((d) => parseInt(d, 10)) : [parseInt(dow, 10)]
    if (!dows.includes(utcDow)) return false
  }
  return true
}

export default async function handler(req: Request): Promise<Response> {
  const secret = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? req.headers.get("x-cron-secret") ?? ""
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } })
  }

  const now = new Date()
  const { jobs } = loadRegistry()
  const due = jobs.filter((j) => j.enabled && isDue(j.schedule, now))

  // TODO: For each due job, enqueue to QStash/Inngest or start Vercel Sandbox with payload
  // { agentId, source, task: j.defaultTask ?? "", output: j.output ?? "none" }.
  // For now we only return which jobs would be run.
  const accepted = due.map((j) => ({ id: j.id, agentId: j.agentId, source: j.source }))

  return new Response(
    JSON.stringify({ accepted: true, jobs: accepted, message: "Enqueue not implemented — add QStash/Inngest or Sandbox" }),
    { status: 202, headers: { "Content-Type": "application/json" } }
  )
}
