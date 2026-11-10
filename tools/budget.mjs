#!/usr/bin/env node
// Static token budget for a Claude Code plugin.
// Estimates tokens as characters / 4 (a rough, model-independent proxy) for:
//   - always-loaded text: every skill's frontmatter description (the skill listing) + agent descriptions
//   - session hook output, when a hook script path is given
//   - entry cost: the router SKILL.md that a typical task loads first
// Usage: node tools/budget.mjs <plugin-dir> [--entry <skill-name>] [--hook-output <file>] [--check]
// --check enforces frugal's own limits and exits 1 on a breach.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

export const LIMITS = {
  alwaysLoaded: 600, // skill + agent descriptions
  entry: 1500, // router SKILL.md
  playbook: 450, // each playbook
  principles: 900,
  agent: 400, // each agent file
  hookOutput: 200,
};

export const tokens = (text) => Math.ceil(text.length / 4);

export function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---/.exec(text);
  return m ? m[1] : "";
}

export function description(text) {
  const fm = frontmatter(text);
  const m = /^description:\s*(.*)$/m.exec(fm);
  return m ? m[1] : "";
}

function listSkills(pluginDir) {
  const dir = join(pluginDir, "skills");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((d) => existsSync(join(dir, d, "SKILL.md")))
    .map((d) => ({ name: d, text: readFileSync(join(dir, d, "SKILL.md"), "utf8") }));
}

function listAgents(pluginDir) {
  const dir = join(pluginDir, "agents");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ name: f, text: readFileSync(join(dir, f), "utf8") }));
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".md")) out.push(p);
  }
  return out;
}

export function measure(pluginDir, { entry, hookOutput } = {}) {
  const skills = listSkills(pluginDir);
  const agents = listAgents(pluginDir);
  const hidden = (s) => /^disable-model-invocation:\s*true/m.test(frontmatter(s.text));
  const listed = skills.filter((s) => !hidden(s));
  const alwaysLoaded =
    listed.reduce((n, s) => n + tokens(s.name + description(s.text)), 0) +
    agents.reduce((n, a) => n + tokens(a.name + description(a.text)), 0);
  const entrySkill = skills.find((s) => s.name === entry);
  const allMd = existsSync(join(pluginDir, "skills")) ? walk(join(pluginDir, "skills")) : [];
  const totalSkillText = allMd.reduce((n, p) => n + tokens(readFileSync(p, "utf8")), 0);
  return {
    skills: skills.length,
    listedSkills: listed.length,
    agents: agents.length,
    alwaysLoaded,
    hookOutput: hookOutput && existsSync(hookOutput) ? tokens(readFileSync(hookOutput, "utf8")) : 0,
    entry: entrySkill ? tokens(entrySkill.text) : 0,
    totalSkillText,
  };
}

function check(pluginDir, m) {
  const fails = [];
  const over = (label, value, limit) => value > limit && fails.push(`${label}: ${value} > ${limit} tokens`);
  over("always-loaded descriptions", m.alwaysLoaded, LIMITS.alwaysLoaded);
  over("entry skill", m.entry, LIMITS.entry);
  over("hook output", m.hookOutput, LIMITS.hookOutput);
  const pb = join(pluginDir, "skills", "frugal", "playbooks");
  if (existsSync(pb))
    for (const f of readdirSync(pb)) over(`playbook ${f}`, tokens(readFileSync(join(pb, f), "utf8")), LIMITS.playbook);
  const pr = join(pluginDir, "skills", "frugal", "references", "principles.md");
  if (existsSync(pr)) over("principles", tokens(readFileSync(pr, "utf8")), LIMITS.principles);
  for (const a of listAgents(pluginDir)) over(`agent ${a.name}`, tokens(a.text), LIMITS.agent);
  return fails;
}

const isMain = process.argv[1] && process.argv[1].endsWith("budget.mjs");
if (isMain) {
  const args = process.argv.slice(2);
  const pluginDir = args[0];
  if (!pluginDir) {
    console.error("usage: node tools/budget.mjs <plugin-dir> [--entry <skill>] [--hook-output <file>] [--check]");
    process.exit(2);
  }
  const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
  const m = measure(pluginDir, { entry: opt("--entry"), hookOutput: opt("--hook-output") });
  console.log(JSON.stringify(m, null, 2));
  if (args.includes("--check")) {
    const fails = check(pluginDir, m);
    if (fails.length) {
      console.error("Budget exceeded:\n  " + fails.join("\n  "));
      process.exit(1);
    }
    console.error("Budget OK");
  }
}
