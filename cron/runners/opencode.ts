/**
 * Run an OpenCode agent by name via @opencode-ai/sdk.
 * Used when cron registry has source: "opencode" (e.g. duplicate-pr).
 *
 * Requires: repo root as cwd, OpenCode server reachable or in-process.
 * See opencode/script/duplicate-pr.ts for the existing pattern.
 */

export async function runOpenCodeAgent(
  agentId: string,
  task: string,
  _output: "commit" | "slack" | "none"
): Promise<void> {
  // TODO: implement with createOpencode() and session.prompt({ agent: agentId, parts })
  // and persist result per _output (commit / slack / none).
  console.log(`[opencode] would run agent=${agentId} task=${task} output=${_output}`)
  throw new Error("opencode runner not implemented yet — use opencode/script/duplicate-pr.ts as reference")
}
