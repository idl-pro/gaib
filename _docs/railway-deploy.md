# IDL OS — Railway Deployment

**Goal:** Deploy OpenClaw to Railway for always-on, team-accessible AI coworker.

**Time:** ~30 minutes

**Why Railway:**
- Always online (no Mac mini dependency)
- Easy restarts and logs
- Environment variables for secrets
- $5/mo hobby plan is plenty

---

## Step 1: Prerequisites

Complete these first (same as before):

- [ ] **Slack app created** with Socket Mode enabled
  - Bot Token (`xoxb-...`)
  - App Token (`xapp-...`)
  - See `slack-setup.md` for details

- [ ] **Asana PAT** generated
  - From https://app.asana.com/0/my-apps

- [ ] **Anthropic API key**
  - From https://console.anthropic.com

---

## Step 2: Create 1Password Service Account

1. Go to [1Password.com](https://my.1password.com) → **Developer Tools** → **Service Accounts**
2. Click **Create Service Account**
3. Name: `IDL OS Railway`
4. Grant access to vault: `For IDL OS` (create this vault if needed)
5. Copy the **Service Account Token** (starts with `ops_...`)
6. Save token somewhere safe (you'll add it to Railway)

### Add secrets to 1Password vault

In the `For IDL OS` vault, create these items:

| Item Name | Field | Value |
|-----------|-------|-------|
| `Slack - Bot Token` | credential | `xoxb-...` |
| `Slack - App Token` | credential | `xapp-...` |
| `Asana - PAT` | credential | `1/...` |
| `Anthropic - API Key` | credential | `sk-ant-...` |

---

## Step 3: Create GitHub Repo

Railway deploys from GitHub. Create a repo for IDL OS:

```bash
# On your machine
mkdir idl-os && cd idl-os
git init

# Create package.json
cat > package.json << 'EOF'
{
  "name": "idl-os",
  "version": "1.0.0",
  "scripts": {
    "start": "op run -- openclaw gateway start --config openclaw.json"
  },
  "dependencies": {
    "openclaw": "latest"
  }
}
EOF

# Create Dockerfile (for 1Password CLI)
cat > Dockerfile << 'EOF'
FROM node:20-slim

# Install 1Password CLI
RUN apt-get update && apt-get install -y curl unzip ca-certificates && \
    curl -sSfL https://cache.agilebits.com/dist/1P/op2/pkg/v2.30.0/op_linux_amd64_v2.30.0.zip -o op.zip && \
    unzip op.zip && mv op /usr/local/bin/ && rm op.zip && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# op run injects secrets at runtime
CMD ["npm", "start"]
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
*.log
EOF
```

---

## Step 4: Create OpenClaw Config

**`openclaw.json`** (committed to repo — secrets injected via `op run`):

```json
{
  "$schema": "https://openclaw.ai/config.schema.json",
  "version": 1,
  
  "gateway": {
    "port": 3000,
    "host": "0.0.0.0"
  },
  
  "agents": {
    "defaults": {
      "model": "anthropic/claude-sonnet-4-20250514",
      "workspace": "./workspace",
      "models": {
        "anthropic/claude-sonnet-4-20250514": { "alias": "sonnet" },
        "anthropic/claude-opus-4-5": { "alias": "opus" }
      }
    }
  },
  
  "channels": {
    "slack": {
      "plugin": "slack",
      "socketMode": true,
      "appToken": "$SLACK_APP_TOKEN",
      "botToken": "$SLACK_BOT_TOKEN",
      "policy": {
        "dm": "allowlist",
        "allowlist": "$SLACK_ALLOWLIST"
      }
    }
  },
  
  "providers": {
    "anthropic": {
      "apiKey": "$ANTHROPIC_API_KEY"
    }
  },
  
  "tools": {
    "profile": "standard",
    "env": {
      "ASANA_PAT": "$ASANA_PAT"
    }
  }
}
```

**Create `op.env`** (1Password secret references):

```bash
cat > op.env << 'EOF'
SLACK_BOT_TOKEN=op://For IDL OS/Slack - Bot Token/credential
SLACK_APP_TOKEN=op://For IDL OS/Slack - App Token/credential
ANTHROPIC_API_KEY=op://For IDL OS/Anthropic - API Key/credential
ASANA_PAT=op://For IDL OS/Asana - PAT/credential
SLACK_ALLOWLIST=U_CONNOR,U_ALEC,U_JOSH
EOF
```

Update `package.json` to use the env file:

```json
{
  "scripts": {
    "start": "op run --env-file=op.env -- openclaw gateway start --config openclaw.json"
  }
}
```

---

## Step 5: Add Workspace Files

Copy the workspace-seed folder:

```bash
cp -r /path/to/IDL\ OS/workspace-seed ./workspace
```

Your repo structure:
```
idl-os/
├── package.json
├── openclaw.json
├── .gitignore
└── workspace/
    ├── SOUL.md
    ├── AGENTS.md
    ├── TOOLS.md
    ├── MEMORY.md
    ├── context/
    │   ├── team.md
    │   ├── vendors.md
    │   ├── sponsors.md
    │   ├── season-1.md
    │   └── systems.md
    └── templates/
```

---

## Step 6: Push to GitHub

```bash
git add .
git commit -m "Initial IDL OS setup"

# Create repo on GitHub (or use gh cli)
gh repo create idl-pro/idl-os --private --source=. --push

# Or manually:
git remote add origin git@github.com:idl-pro/idl-os.git
git push -u origin main
```

---

## Step 7: Deploy to Railway

### 7.1 Create Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `idl-pro/idl-os`
4. Railway will detect the Dockerfile and start building

### 7.2 Add Environment Variable

In Railway dashboard → your project → **Variables** tab:

| Variable | Value |
|----------|-------|
| `OP_SERVICE_ACCOUNT_TOKEN` | `ops_...` (from Step 2) |

That's it! All other secrets come from 1Password via `op run`.

### 7.3 Configure Build

Railway should auto-detect from Dockerfile, but verify:
- **Build:** Uses Dockerfile
- **Start Command:** `npm start` (runs `op run --env-file=op.env -- openclaw gateway start`)
- **Port:** 3000

### 7.4 Deploy

Click **Deploy** (or it auto-deploys on push).

Watch logs for:
```
Gateway started on port 3000
Slack connected via Socket Mode
```

---

## Step 8: Test

1. In Slack, find "IDL OS" under Apps
2. Send a DM: "Hello, can you hear me?"
3. Should get a response within a few seconds

**If no response:**
- Check Railway logs for errors
- Verify Slack tokens are correct
- Confirm your Slack user ID is in the allowlist

---

## Step 9: Get Slack User IDs

To find user IDs for the allowlist:

**Option A: In Slack**
1. Click on user's profile
2. Click **More** (three dots)
3. Click **Copy member ID**

**Option B: API call** (after bot is running)
```bash
curl -s -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  "https://slack.com/api/users.list" | jq '.members[] | {name: .real_name, id: .id}'
```

Update `SLACK_ALLOWLIST` in Railway with the IDs.

---

## Updating Content

### Update workspace files:
1. Edit files in `workspace/` locally
2. `git commit` and `git push`
3. Railway auto-redeploys

### Update secrets:
1. Update the item in 1Password (`For IDL OS` vault)
2. Restart the Railway service (secrets are fetched at startup)

### Update allowlist:
1. Edit `op.env` → update `SLACK_ALLOWLIST`
2. `git commit` and `git push`
3. Railway auto-redeploys

---

## Persistent Memory

**Important:** Railway containers are ephemeral. If the bot updates MEMORY.md, changes are lost on redeploy.

**Options:**

**A. GitHub-backed memory (simple):**
- Bot reads from repo
- For updates, create a cron job that commits changes back
- Works for read-heavy, write-light

**B. Railway Volume (recommended):**
1. In Railway → your service → **Settings** → **Volumes**
2. Add volume: Mount path `/app/workspace`
3. Update openclaw.json: `"workspace": "/app/workspace"`
4. Files persist across deploys

**C. External storage:**
- Use Obsidian sync, S3, or git-based storage
- More complex but more robust

For MVP, start with **A** (GitHub-backed). Upgrade to **B** if the bot needs to write frequently.

---

## Monitoring

**Railway Dashboard:**
- Logs: Real-time log streaming
- Metrics: CPU/memory usage
- Deploys: History and rollback

**Slack:**
- Bot shows as "Online" when connected
- If it goes offline, Railway likely crashed — check logs

---

## Cost

| Item | Cost |
|------|------|
| Railway Hobby | $5/mo (includes $5 credit) |
| Anthropic API | ~$10-50/mo depending on usage |
| Slack | Free (bot user doesn't count as seat) |
| 1Password | Free (if you already have it) |
| **Total** | ~$15-55/mo |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Bot doesn't respond | Check Railway logs; verify 1Password items exist |
| "User not in allowlist" | Update `SLACK_ALLOWLIST` in `op.env`, push, redeploy |
| `op` errors | Check `OP_SERVICE_ACCOUNT_TOKEN` is set; verify vault access |
| Deploys fail | Check build logs; ensure Dockerfile is valid |
| Memory not persisting | Add Railway volume or use git-backed storage |
| Rate limits | Reduce usage or upgrade Anthropic tier |

---

## Next Steps

1. [ ] Test with Connor, Alec, Josh
2. [ ] Add Railway volume for persistent memory
3. [ ] Set up daily brief cron job
4. [ ] Monitor usage and adjust model if needed
5. [ ] Consider adding Google Docs integration (requires OAuth setup)

---

## Quick Reference

**Railway Dashboard:** https://railway.app/dashboard

**Useful commands:**
```bash
# View logs locally
railway logs

# Open dashboard
railway open

# Redeploy
git push origin main
```

**Environment Variables (Railway):**
- `OP_SERVICE_ACCOUNT_TOKEN` — 1Password access (only env var needed!)

**1Password Items (in `For IDL OS` vault):**
- `Slack - Bot Token` — API calls
- `Slack - App Token` — Socket Mode connection
- `Anthropic - API Key` — LLM access
- `Asana - PAT` — Task management

**In `op.env` (committed to repo):**
- `SLACK_ALLOWLIST` — Comma-separated user IDs (not a secret)
