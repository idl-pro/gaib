# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Gaib is an AI coworker Slack bot for the IDL team, powered by [OpenClaw](https://openclaw.ai) and deployed on Railway. It runs as a Slack bot (Socket Mode) with secrets stored in 1Password. Forked from [clawdbot-railway-template](https://github.com/vignesh07/clawdbot-railway-template).

## Commands

```bash
npm install          # Install dependencies (only 3: express, http-proxy, tar)
npm run dev          # Start server (node src/server.js)
npm test             # Run tests (node --test)
npm run lint         # Syntax check (node -c src/server.js)
npm run smoke        # Verify openclaw CLI available (Docker only)
```

Tests use Node.js built-in test runner (`node:test` + `node:assert/strict`). No test framework.

## Architecture

```
┌──────────────────────────────────────────────┐
│  Railway Container                           │
│  ┌─────────────┐    ┌────────────────────┐   │
│  │   Wrapper    │───▶│  OpenClaw Gateway  │   │
│  │  (Express)   │    │   (port 18789)     │   │
│  │  port 8080   │    └────────────────────┘   │
│  └─────────────┘                              │
│        │            Secrets: 1Password        │
│  ┌─────┴──────┐     Volume: /data             │
│  │ /setup UI  │                               │
│  └────────────┘                               │
└──────────────────────────────────────────────┘
```

**Two processes in one container:**
- **Wrapper server** (`src/server.js`): Express app on port 8080. Handles `/setup` wizard UI, `/healthz`, debug console, backup/import, and proxies everything else to the OpenClaw gateway.
- **OpenClaw gateway**: Spawned as a child process on port 18789. Manages the actual Slack bot, LLM calls, and tool execution.

The wrapper manages the gateway lifecycle — starting, restarting, health checking, and collecting diagnostics.

## Key Files

| Path | Purpose |
|------|---------|
| `src/server.js` | Main wrapper server (~1300 lines, single file) |
| `src/setup-app.js` | Frontend JS for the `/setup` wizard |
| `openclaw.json` | Gateway config (Slack, Anthropic, Asana, model settings) |
| `op.env` | 1Password secret references (injected at runtime via `op run`) |
| `workspace/` | Bot personality and context (SOUL.md, AGENTS.md, TOOLS.md, MEMORY.md) |
| `workspace/context/` | Shared knowledge base (team, vendors, sponsors, etc.) |
| `workspace/templates/` | Message/email templates |
| `Dockerfile` | Multi-stage: builds OpenClaw from source, then minimal runtime with 1Password CLI |
| `railway.toml` | Railway deployment config |
| `_docs/` | Planning docs, setup guides, specs |

## server.js Structure

The server is a single large file organized in sections:

1. **Environment & config** — env var parsing with deprecation shims, path resolution
2. **Gateway lifecycle** — `ensureGatewayRunning()`, `restartGateway()`, `waitForGatewayReady()`, `runDoctorBestEffort()`
3. **Auth middleware** — `requireSetupAuth()` basic auth for `/setup` routes
4. **Health endpoints** — `GET /healthz` (public), `GET /setup/healthz`
5. **Setup wizard API** — Status, onboarding, auth group options
6. **Debug console** — Allowlisted commands (status, logs, devices, plugins)
7. **Config editor** — Read/write openclaw.json with backup + restart
8. **Backup/import** — Export/import tar.gz of state + workspace
9. **Proxy + lifecycle** — httpProxy to gateway, WebSocket upgrade, graceful shutdown

## Secrets & Config

Secrets live in 1Password vault `Gaib`, referenced in `op.env`. Only two env vars are set in Railway directly:
- `OP_SERVICE_ACCOUNT_TOKEN` — 1Password service account
- `SETUP_PASSWORD` — Protects `/setup` UI

The gateway isn't configured by default — it requires onboarding via the `/setup` web UI or a pre-existing config at `/data/.openclaw/openclaw.json`.

## ES Modules

This project uses ES modules (`"type": "module"` in package.json). Use `import`/`export`, not `require`.

## Docker Build

Multi-stage build: Stage 1 clones OpenClaw at a pinned git ref (`OPENCLAW_GIT_REF`), builds with Bun + pnpm. Stage 2 is a minimal Node 22 runtime with 1Password CLI. A daily GitHub Action creates PRs to bump the OpenClaw version.

## Deployment

Push to `main` triggers Railway auto-deploy. Workspace file edits (personality, context) take effect on redeploy. Secret changes require updating the 1Password vault item and restarting the Railway service. Slack allowlist is in `op.env` as `SLACK_ALLOWLIST`.
