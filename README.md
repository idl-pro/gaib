# Gaib

AI coworker for the IDL team, powered by [OpenClaw](https://openclaw.ai). Deployed on [Railway](https://railway.app).

Forked from [clawdbot-railway-template](https://github.com/vignesh07/clawdbot-railway-template).

## Architecture

```
┌──────────────────────────────────────────────┐
│  Railway Container                           │
│                                              │
│  ┌─────────────┐    ┌────────────────────┐   │
│  │   Wrapper    │───▶│  OpenClaw Gateway  │   │
│  │  (Express)   │    │   (port 18789)     │   │
│  │  port 8080   │    └────────────────────┘   │
│  └─────────────┘                              │
│        │                                      │
│  ┌─────┴──────┐                               │
│  │ /setup UI  │  (password-protected)         │
│  └────────────┘                               │
│                                               │
│  Secrets: 1Password (op run)                  │
│  Volume: /data (persistent state)             │
└──────────────────────────────────────────────┘
         │
    Slack Socket Mode
         │
  ┌──────┴──────┐
  │  IDL Slack  │
  │  (DMs)      │
  └─────────────┘
```

## Quick Reference

**Users:** Connor, Alec, Josh (via allowlist)
**Interface:** Slack DMs
**Integrations:** Slack, Asana
**Model:** Claude Sonnet 4

## Files

| Path | Purpose |
|------|---------|
| `workspace/` | Bot personality, context, and memory |
| `openclaw.json` | Gateway config (Slack, Anthropic, Asana) |
| `op.env` | 1Password secret references |
| `Dockerfile` | Builds OpenClaw from source + 1Password CLI |
| `railway.toml` | Railway deploy settings |
| `src/server.js` | Wrapper server (setup wizard, health, proxy) |
| `_docs/` | Planning and reference documentation |

## Secrets

All secrets are stored in the **1Password vault `Gaib`** and injected at runtime via `op run`.

| 1Password Item | Field | Used For |
|----------------|-------|----------|
| `Slack - Bot Token` | credential | Slack API calls |
| `Slack - App Token` | credential | Slack Socket Mode |
| `Anthropic - API Key` | credential | LLM access |
| `Asana - PAT` | credential | Task management |

**Railway env vars:**
- `OP_SERVICE_ACCOUNT_TOKEN` — 1Password service account (only secret in Railway)
- `SETUP_PASSWORD` — Password for the `/setup` web UI

## Updating

### Workspace files (personality, context)
Edit files in `workspace/`, commit, push. Railway auto-redeploys.

### Secrets
Update the item in 1Password (`Gaib` vault), then restart the Railway service.

### Slack allowlist
Edit `SLACK_ALLOWLIST` in `op.env` with comma-separated Slack user IDs, commit, push.

### OpenClaw version
The `OPENCLAW_GIT_REF` build arg in the Dockerfile pins the version. A daily GitHub Action creates a PR to bump it.

## Local Smoke Test

```bash
docker build -t gaib .

docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e SETUP_PASSWORD=test \
  -e OP_SERVICE_ACCOUNT_TOKEN=ops_... \
  -e OPENCLAW_STATE_DIR=/data/.openclaw \
  -e OPENCLAW_WORKSPACE_DIR=/data/workspace \
  -v $(pwd)/.tmpdata:/data \
  gaib

# open http://localhost:8080/setup (password: test)
```

## Deploy Checklist

See [`_docs/railway-deploy.md`](_docs/railway-deploy.md) for full details.

1. [ ] Create 1Password vault `Gaib` + service account
2. [ ] Create Slack app ([manifest](_docs/slack-setup.md)) + collect tokens
3. [ ] Collect Slack user IDs for allowlist, update `op.env`
4. [ ] Save all credentials to 1Password vault
5. [ ] Deploy to Railway (link this repo, add Volume at `/data`)
6. [ ] Set Railway vars: `OP_SERVICE_ACCOUNT_TOKEN`, `SETUP_PASSWORD`
7. [ ] Test: DM "Gaib" in Slack
