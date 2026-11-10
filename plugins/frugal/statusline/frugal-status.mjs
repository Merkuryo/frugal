#!/usr/bin/env node
// frugal status line for Claude Code.
// Reads the status-line JSON on stdin and prints: model · tokens in/out · cache read · cost (when reported).
// Tokens are summed from the session transcript, counting each assistant message once.
import { readFileSync, existsSync } from "node:fs";

const fmt = (n) =>
  n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(n);

export function sumUsage(jsonlText) {
  const seen = new Map();
  for (const line of jsonlText.split("\n")) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const msg = entry?.message;
    const usage = msg?.usage;
    if (!usage) continue;
    // Streaming can write several entries for one message; the last one carries the final usage.
    const key = msg.id ?? entry.uuid ?? seen.size;
    seen.set(key, usage);
  }
  const total = { input: 0, output: 0, cacheWrite: 0, cacheRead: 0 };
  for (const u of seen.values()) {
    total.input += u.input_tokens ?? 0;
    total.output += u.output_tokens ?? 0;
    total.cacheWrite += u.cache_creation_input_tokens ?? 0;
    total.cacheRead += u.cache_read_input_tokens ?? 0;
  }
  return total;
}

export function render(status, total) {
  const parts = [];
  const model = status?.model?.display_name ?? status?.model?.id;
  if (model) parts.push(model);
  if (total) {
    parts.push(`in ${fmt(total.input + total.cacheWrite)} · out ${fmt(total.output)}`);
    if (total.cacheRead) parts.push(`cache ${fmt(total.cacheRead)}`);
  }
  const cost = status?.cost?.total_cost_usd;
  if (typeof cost === "number") parts.push(`$${cost.toFixed(2)}`);
  return parts.join(" · ") || "frugal";
}

function main() {
  let status = {};
  try {
    status = JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    status = {};
  }
  let total = null;
  const path = status?.transcript_path;
  if (path && existsSync(path)) {
    try {
      total = sumUsage(readFileSync(path, "utf8"));
    } catch {
      total = null;
    }
  }
  process.stdout.write(render(status, total) + "\n");
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("frugal-status.mjs")) {
  main();
}
