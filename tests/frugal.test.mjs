import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sumUsage, render } from "../plugins/frugal/statusline/frugal-status.mjs";
import { measure, LIMITS } from "../tools/budget.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(root, "plugins", "frugal");
const hook = join(plugin, "hooks", "session-start.sh");

test("status line counts each message once, using its last usage", () => {
  const jsonl = [
    { message: { id: "a", usage: { input_tokens: 10, output_tokens: 1 } } },
    { message: { id: "a", usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 100 } } },
    { message: { id: "b", usage: { input_tokens: 3, output_tokens: 2, cache_creation_input_tokens: 7 } } },
    "not json",
  ]
    .map((x) => (typeof x === "string" ? x : JSON.stringify(x)))
    .join("\n");
  assert.deepEqual(sumUsage(jsonl), { input: 13, output: 7, cacheWrite: 7, cacheRead: 100 });
});

test("status line renders model, tokens and cost", () => {
  const line = render({ model: { display_name: "Sonnet" }, cost: { total_cost_usd: 0.123 } }, {
    input: 1500, output: 200, cacheWrite: 500, cacheRead: 0,
  });
  assert.equal(line, "Sonnet · in 2.0k · out 200 · $0.12");
});

test("status line survives empty input", () => {
  assert.equal(render({}, null), "frugal");
});

test("session hook prints the pointer by default", () => {
  const home = mkdtempSync(join(tmpdir(), "frugal-"));
  const out = execFileSync("bash", [hook], { env: { ...process.env, HOME: home, CLAUDE_CONFIG_DIR: "", CLAUDE_PROJECT_DIR: home } }).toString();
  assert.match(out, /frugal/);
  assert.ok(out.length / 4 <= LIMITS.hookOutput);
});

test("session hook is silent when the project sheet turns it off", () => {
  const proj = mkdtempSync(join(tmpdir(), "frugal-"));
  mkdirSync(join(proj, ".frugal"));
  writeFileSync(join(proj, ".frugal", "config.md"), "# frugal config\nsession hook: off\n");
  const out = execFileSync("bash", [hook], { env: { ...process.env, HOME: proj, CLAUDE_PROJECT_DIR: proj } }).toString();
  assert.equal(out, "");
});

test("plugin stays within its token budget", () => {
  const m = measure(plugin, { entry: "frugal" });
  assert.ok(m.alwaysLoaded <= LIMITS.alwaysLoaded, `always-loaded ${m.alwaysLoaded}`);
  assert.ok(m.entry <= LIMITS.entry, `entry ${m.entry}`);
});
