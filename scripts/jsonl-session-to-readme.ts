#!/usr/bin/env bun
/**
 * Convert a Claude Code session JSONL file to a readable README.md.
 *
 * Usage: bun run scripts/jsonl-session-to-readme.ts <path-to-session.jsonl> [output.md]
 * Default output: same path with .jsonl replaced by .md (or .claude-history/README.md for that folder)
 */

import { readFileSync, writeFileSync } from "fs"

const inputPath = process.argv[2]
const outputPath = process.argv[3] ?? inputPath.replace(/\.jsonl$/i, ".md")

if (!inputPath) {
  console.error("Usage: bun run scripts/jsonl-session-to-readme.ts <session.jsonl> [output.md]")
  process.exit(1)
}

type ContentPart =
  | { type: "text"; text: string }
  | { type: "tool_use"; name: string; id?: string; input?: unknown }
  | { type: "tool_result"; content?: string; tool_use_id?: string; is_error?: boolean }

function extractText(content: string | ContentPart[]): string {
  if (typeof content === "string") return content.trim()
  if (!Array.isArray(content)) return ""
  return content
    .filter((p): p is ContentPart => p && typeof p === "object" && "type" in p)
    .map((p) => {
      if (p.type === "text" && "text" in p) return (p as { text: string }).text
      if (p.type === "tool_use")
        return `\n[Tool: ${(p as { name: string }).name}]\n${formatToolInput((p as { input?: unknown }).input)}`
      if (p.type === "tool_result") {
        const c = (p as { content?: string; is_error?: boolean }).content
        const err = (p as { is_error?: boolean }).is_error
        if (err && c) return `\n[Error] ${c.slice(0, 500)}${c.length > 500 ? "…" : ""}\n`
        if (c && c.length < 800) return `\n[Result] ${c}\n`
        if (c) return `\n[Result] ${c.slice(0, 400)}… (${c.length} chars)\n`
      }
      return ""
    })
    .join("")
    .trim()
}

function formatToolInput(input: unknown): string {
  if (input == null) return ""
  if (typeof input === "string") return input.slice(0, 600)
  try {
    const s = JSON.stringify(input)
    return s.length > 600 ? s.slice(0, 600) + "…" : s
  } catch {
    return String(input).slice(0, 600)
  }
}

const lines = readFileSync(inputPath, "utf8").split("\n").filter(Boolean)
const blocks: { role: string; time?: string; body: string; type?: string }[] = []
let sessionMeta: { cwd?: string; gitBranch?: string; version?: string } = {}

for (const line of lines) {
  let row: Record<string, unknown>
  try {
    row = JSON.parse(line) as Record<string, unknown>
  } catch {
    continue
  }

  const type = row.type as string
  const timestamp = row.timestamp as string | undefined

  if (type === "file-history-snapshot") continue
  if (type === "progress") continue
  if (type === "queue-operation") {
    const content = (row.content as string) || ""
    const summary = content.includes("<summary>") ? content.replace(/^[\s\S]*<summary>([^<]+)<\/summary>[\s\S]*$/, "$1") : content.slice(0, 200)
    blocks.push({ role: "system", time: timestamp, body: `Background: ${summary}`, type: "queue" })
    continue
  }

  if (row.cwd) sessionMeta.cwd = row.cwd as string
  if (row.gitBranch) sessionMeta.gitBranch = row.gitBranch as string
  if (row.version) sessionMeta.version = row.version as string

  const msg = row.message as Record<string, unknown> | undefined
  if (!msg) continue

  const role = (msg.role as string) || type
  const content = msg.content
  const body = extractText(content as string | ContentPart[])
  if (!body && type !== "user") continue

  if (type === "user" && role === "user") {
    blocks.push({ role: "user", time: timestamp, body: body || "(empty)" })
    continue
  }
  if (type === "assistant" && role === "assistant") {
    blocks.push({ role: "assistant", time: timestamp, body })
    continue
  }
  if (type === "user" && (msg.content as ContentPart[])?.[0]?.type === "tool_result") {
    blocks.push({ role: "tool_result", time: timestamp, body })
  }
}

const timeFmt = (t?: string) => (t ? new Date(t).toISOString().replace("T", " ").slice(0, 19) : "")

let md = `# Session: ${inputPath.split("/").pop()?.replace(/\.jsonl$/i, "") ?? "conversation"}\n\n`
md += `Generated from \`${inputPath}\`.\n\n`
if (sessionMeta.cwd) md += `- **Cwd:** \`${sessionMeta.cwd}\`\n`
if (sessionMeta.gitBranch) md += `- **Branch:** ${sessionMeta.gitBranch}\n`
if (sessionMeta.version) md += `- **Claude Code:** ${sessionMeta.version}\n`
md += "\n---\n\n"

for (const b of blocks) {
  const time = timeFmt(b.time)
  if (b.role === "user") {
    md += `## User\n\n${time ? `*${time}*\n\n` : ""}${b.body}\n\n`
  } else if (b.role === "assistant") {
    md += `## Assistant\n\n${time ? `*${time}*\n\n` : ""}${b.body}\n\n`
  } else if (b.role === "tool_result" || b.role === "system") {
    md += `### ${b.role === "tool_result" ? "Tool result" : "System"}\n\n${time ? `*${time}*\n\n` : ""}\n\`\`\`\n${b.body}\n\`\`\`\n\n`
  }
}

writeFileSync(outputPath, md, "utf8")
console.log(`Wrote ${outputPath}`)
