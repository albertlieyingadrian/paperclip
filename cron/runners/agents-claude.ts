/**
 * Run a .agents/ agent by loading .agents/agents/<agentId>.md and referenced skills,
 * then call Anthropic Messages API in a loop with tools (read_file, write_file, bash, etc.).
 * Used when cron registry has source: "agents" (e.g. landing-page-design-analysis).
 *
 * Requires: ANTHROPIC_API_KEY, repo root with .agents/ present.
 * Output: commit | slack | none — commit pushes changes, slack posts summary, none just logs.
 */

export async function runAgentsClaude(
  agentId: string,
  task: string,
  _output: "commit" | "slack" | "none"
): Promise<void> {
  // TODO: load .agents/agents/${agentId}.md, resolve skill paths from content,
  // build system prompt, call Messages API with tool use (read_file, write_file, run_bash, list_dir; optional MCP),
  // loop until done, then persist per _output.
  console.log(`[agents] would run agent=${agentId} task=${task} output=${_output}`)
  throw new Error("agents Claude runner not implemented yet — implement Claude API loop + tools")
}
