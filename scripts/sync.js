#!/usr/bin/env node
// scripts/sync.js — Push/pull workspace files to/from Railway.
//
// Usage:
//   node scripts/sync.js pull              # pull all workspace files
//   node scripts/sync.js pull MEMORY.md    # pull a single file
//   node scripts/sync.js push              # push all local workspace files
//   node scripts/sync.js push AGENTS.md    # push a single file
//
// Env vars:
//   OPENCLAW_URL      — Base URL (e.g., https://my-app.up.railway.app)
//   SETUP_PASSWORD    — Password for /setup basic auth

import fs from "node:fs";
import path from "node:path";

const WORKSPACE_LOCAL = path.resolve(new URL("../workspace", import.meta.url).pathname);
const BASE_URL = process.env.OPENCLAW_URL?.replace(/\/$/, "");
const PASSWORD = process.env.SETUP_PASSWORD;

if (!BASE_URL) { console.error("Missing OPENCLAW_URL env var"); process.exit(1); }
if (!PASSWORD) { console.error("Missing SETUP_PASSWORD env var"); process.exit(1); }

const AUTH = "Basic " + Buffer.from(`admin:${PASSWORD}`).toString("base64");

async function api(urlPath, opts = {}) {
  const res = await fetch(`${BASE_URL}${urlPath}`, {
    ...opts,
    headers: { authorization: AUTH, ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${urlPath}: ${text}`);
  }
  return res;
}

function listLocal(dir, prefix = "") {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) results.push(...listLocal(path.join(dir, entry.name), rel));
    else if (entry.isFile()) results.push(rel);
  }
  return results;
}

async function pull(file) {
  if (file) {
    const res = await api(`/setup/api/workspace/${file}`);
    const content = await res.text();
    const dest = path.join(WORKSPACE_LOCAL, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content, "utf8");
    console.log(`pulled ${file}`);
  } else {
    const res = await api("/setup/api/workspace");
    const { files } = await res.json();
    for (const f of files) {
      const r = await api(`/setup/api/workspace/${f.path}`);
      const content = await r.text();
      const dest = path.join(WORKSPACE_LOCAL, f.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, content, "utf8");
      console.log(`pulled ${f.path} (${f.size} bytes)`);
    }
    console.log(`\nPulled ${files.length} files.`);
  }
}

async function push(file) {
  if (file) {
    const src = path.join(WORKSPACE_LOCAL, file);
    if (!fs.existsSync(src)) { console.error(`Local file not found: ${file}`); process.exit(1); }
    await api(`/setup/api/workspace/${file}`, {
      method: "PUT",
      headers: { "content-type": "text/plain" },
      body: fs.readFileSync(src, "utf8"),
    });
    console.log(`pushed ${file}`);
  } else {
    const files = listLocal(WORKSPACE_LOCAL);
    for (const rel of files) {
      await api(`/setup/api/workspace/${rel}`, {
        method: "PUT",
        headers: { "content-type": "text/plain" },
        body: fs.readFileSync(path.join(WORKSPACE_LOCAL, rel), "utf8"),
      });
      console.log(`pushed ${rel}`);
    }
    console.log(`\nPushed ${files.length} files.`);
  }
}

const [,, command, targetFile] = process.argv;

if (command === "pull") {
  await pull(targetFile);
} else if (command === "push") {
  await push(targetFile);
} else {
  console.log("Usage: node scripts/sync.js <push|pull> [file]");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/sync.js pull              # pull all files from Railway");
  console.log("  node scripts/sync.js pull MEMORY.md    # pull single file");
  console.log("  node scripts/sync.js push              # push all local files to Railway");
  console.log("  node scripts/sync.js push SOUL.md      # push single file");
  console.log("");
  console.log("Env vars: OPENCLAW_URL, SETUP_PASSWORD");
  process.exit(1);
}
