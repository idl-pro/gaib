# IDL OS — Setup Guide

**Goal:** Get an OpenClaw instance running for Connor, Alec, and Josh with Slack, Google Docs, and Asana access.

**Time estimate:** 45-60 minutes

**Prerequisites:**
- Mac mini access (SSH or direct)
- IDL Slack admin access
- Google Workspace admin (idl.pro)
- 1Password access for storing secrets

---

## Step 1: Create Service Accounts

### 1.1 Google Account
1. Go to [Google Workspace Admin](https://admin.google.com) → Users → Add new user
2. Create: `agent@idl.pro` (or `idlos@idl.pro`)
3. Set a strong password, save to 1Password
4. **Important:** This account needs access to shared Google Docs/Drives the team uses

### 1.2 Asana Service Account (Optional)
You can reuse your PAT, or create a dedicated one:
1. Log into Asana as the service account (or your account)
2. Go to: https://app.asana.com/0/my-apps
3. Create new Personal Access Token
4. Name it: `IDL OS Bot`
5. Copy token → save to 1Password as `Asana - IDL OS PAT`

---

## Step 2: Create Slack App

### 2.1 Create the App
1. Go to: https://api.slack.com/apps
2. Click **Create New App** → **From scratch**
3. App Name: `IDL OS`
4. Workspace: Select IDL workspace
5. Click **Create App**

### 2.2 Configure Bot Permissions
1. In left sidebar: **OAuth & Permissions**
2. Scroll to **Scopes** → **Bot Token Scopes**
3. Add these scopes:
   ```
   channels:history      - Read public channel messages
   channels:read         - List channels
   chat:write           - Send messages
   groups:history       - Read private channel messages (if needed)
   groups:read          - List private channels
   im:history           - Read DMs
   im:read              - List DMs
   im:write             - Send DMs
   users:read           - Get user info
   users:read.email     - Get user emails
   ```

### 2.3 Enable Events (for real-time messages)
1. In left sidebar: **Event Subscriptions**
2. Toggle **Enable Events** → On
3. Request URL: `https://YOUR_GATEWAY_URL/slack/events` 
   - (We'll fill this in after OpenClaw is running)
4. Under **Subscribe to bot events**, add:
   ```
   message.im            - DMs to the bot
   app_mention           - @mentions in channels
   ```
5. Click **Save Changes**

### 2.4 Install to Workspace
1. In left sidebar: **Install App**
2. Click **Install to Workspace**
3. Authorize the permissions
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
5. Save to 1Password as `Slack - IDL OS Bot Token`

### 2.5 Get App Credentials
1. In left sidebar: **Basic Information**
2. Under **App Credentials**, copy:
   - **Signing Secret** → save to 1Password as `Slack - IDL OS Signing Secret`
   - **App ID** → note this down

### 2.6 Enable DMs
1. In left sidebar: **App Home**
2. Under **Show Tabs**, enable:
   - ✅ Messages Tab
   - ✅ "Allow users to send Slash commands and messages from the messages tab"

---

## Step 3: Google OAuth Setup

### 3.1 Create Google Cloud Project
1. Go to: https://console.cloud.google.com
2. Create new project: `idl-os`
3. Select the project

### 3.2 Enable APIs
1. Go to **APIs & Services** → **Library**
2. Enable these APIs:
   - Google Drive API
   - Google Docs API
   - Google Calendar API
   - Gmail API

### 3.3 Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. User Type: **Internal** (restricts to idl.pro)
3. App name: `IDL OS`
4. User support email: your email
5. Developer contact: your email
6. Click **Save and Continue** through scopes (we'll set in credentials)

### 3.4 Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Desktop app**
4. Name: `IDL OS CLI`
5. Click **Create**
6. Download JSON → save as `client_secret.json`
7. Also save Client ID and Client Secret to 1Password

### 3.5 Authorize gog CLI (on Mac mini)
```bash
# SSH into Mac mini
ssh agentzhou@macmini

# Create directory for IDL OS
mkdir -p ~/.idlos

# Copy client_secret.json to Mac mini (from your machine)
# scp client_secret.json agentzhou@macmini:~/.idlos/

# Install gog if not present
npm install -g gog-cli

# Authorize (this opens browser - do on machine with browser)
gog auth login --client-secret-file ~/.idlos/client_secret.json

# Test
gog drive list --limit 5
```

---

## Step 4: Install OpenClaw

### 4.1 Install on Mac mini
```bash
# SSH into Mac mini
ssh agentzhou@macmini

# Create IDL OS workspace
mkdir -p ~/.idlos/workspace
cd ~/.idlos

# Install OpenClaw (if not already installed globally)
npm install -g openclaw

# Initialize new instance
openclaw init --config ~/.idlos/openclaw.json
```

### 4.2 Create Config File

Create `~/.idlos/openclaw.json`:

```json
{
  "$schema": "https://openclaw.ai/config.schema.json",
  "version": 1,
  
  "gateway": {
    "port": 3737,
    "host": "127.0.0.1"
  },
  
  "agents": {
    "defaults": {
      "model": "anthropic/claude-sonnet-4-20250514",
      "workspace": "~/.idlos/workspace"
    }
  },
  
  "channels": {
    "slack": {
      "plugin": "slack",
      "botToken": "{{OP_SLACK_BOT_TOKEN}}",
      "signingSecret": "{{OP_SLACK_SIGNING_SECRET}}",
      "policy": {
        "dm": "allowlist",
        "allowlist": ["U_CONNOR_ID", "U_ALEC_ID", "U_JOSH_ID"]
      }
    }
  },
  
  "providers": {
    "anthropic": {
      "apiKey": "{{OP_ANTHROPIC_KEY}}"
    }
  },
  
  "tools": {
    "profile": "standard"
  }
}
```

### 4.3 Create Workspace Files

**~/.idlos/workspace/SOUL.md:**
```markdown
# IDL OS

You are IDL OS, an AI assistant for the IDL team.

## What You Do
- Help with Asana task management
- Draft and review documents in Google Docs
- Answer questions about IDL operations
- Track action items and follow-ups

## How You Work
- Be concise and actionable
- When asked to do something, do it (don't just explain how)
- For external communications, draft first and confirm before sending
- If you don't know something, say so

## Team Context
- Connor: Co-founder & CEO, handles sponsors and fundraising
- Alec: Partnerships and operations
- Josh: [Add Josh's role]
- Evan: Co-founder & President, product and ops

## Current Focus
- Season 1 launch: May 2, 2026 (NYC)
- 6 events across 5 cities
- Series A in progress
```

**~/.idlos/workspace/TOOLS.md:**
```markdown
# Tools

## Asana
- PAT stored in 1Password
- Workspace: IDL (1211178525495344)
- Can create, update, and query tasks

## Google Docs
- Access via gog CLI
- Account: agent@idl.pro
- Can read/write docs in shared drives

## Slack
- DM interface for Connor, Alec, Josh
- Can read channels for context (if granted)
```

---

## Step 5: Set Up 1Password Injection

### 5.1 Add Secrets to 1Password
Create items in your `For Genos` vault (or create `For IDL OS` vault):

| Item Name | Field | Value |
|-----------|-------|-------|
| `Slack - IDL OS Bot Token` | credential | xoxb-... |
| `Slack - IDL OS Signing Secret` | credential | (from Step 2.5) |
| `Asana - IDL OS PAT` | credential | (from Step 1.2) |
| `Anthropic - API Key` | credential | (existing or new) |

### 5.2 Create Injection Script

**~/.idlos/inject-secrets.sh:**
```bash
#!/bin/bash
set -e

export OP_SERVICE_ACCOUNT_TOKEN=$(cat ~/.config/op/service-account-token)

# Template with 1Password references
cat > ~/.idlos/openclaw.json << 'EOF'
{
  "$schema": "https://openclaw.ai/config.schema.json",
  "version": 1,
  
  "gateway": {
    "port": 3737,
    "host": "127.0.0.1"
  },
  
  "agents": {
    "defaults": {
      "model": "anthropic/claude-sonnet-4-20250514",
      "workspace": "/Users/agentzhou/.idlos/workspace"
    }
  },
  
  "channels": {
    "slack": {
      "plugin": "slack",
      "botToken": "SLACK_BOT_TOKEN_PLACEHOLDER",
      "signingSecret": "SLACK_SIGNING_SECRET_PLACEHOLDER",
      "policy": {
        "dm": "allowlist",
        "allowlist": []
      }
    }
  },
  
  "providers": {
    "anthropic": {
      "apiKey": "ANTHROPIC_KEY_PLACEHOLDER"
    }
  },
  
  "tools": {
    "profile": "standard"
  }
}
EOF

# Inject secrets
SLACK_TOKEN=$(op read "op://For Genos/Slack - IDL OS Bot Token/credential")
SLACK_SECRET=$(op read "op://For Genos/Slack - IDL OS Signing Secret/credential")
ANTHROPIC_KEY=$(op read "op://For Genos/Anthropic - API Key/credential")

sed -i '' "s|SLACK_BOT_TOKEN_PLACEHOLDER|$SLACK_TOKEN|g" ~/.idlos/openclaw.json
sed -i '' "s|SLACK_SIGNING_SECRET_PLACEHOLDER|$SLACK_SECRET|g" ~/.idlos/openclaw.json
sed -i '' "s|ANTHROPIC_KEY_PLACEHOLDER|$ANTHROPIC_KEY|g" ~/.idlos/openclaw.json

echo "✅ Secrets injected into ~/.idlos/openclaw.json"

if [ "$1" = "--restart" ]; then
  echo "Restarting IDL OS gateway..."
  pkill -f "openclaw.*3737" || true
  sleep 1
  cd ~/.idlos && nohup openclaw gateway start --config ~/.idlos/openclaw.json > ~/.idlos/gateway.log 2>&1 &
  echo "✅ Gateway restarted on port 3737"
fi
```

```bash
chmod +x ~/.idlos/inject-secrets.sh
```

---

## Step 6: Get Slack User IDs

Before starting, get the Slack user IDs for the allowlist:

1. In Slack, click on Connor's profile → **More** → **Copy member ID**
2. Repeat for Alec and Josh
3. Add these IDs to the allowlist in the config

Or use the API:
```bash
curl -s -H "Authorization: Bearer xoxb-YOUR-TOKEN" \
  "https://slack.com/api/users.list" | jq '.members[] | {name: .name, id: .id, email: .profile.email}'
```

---

## Step 7: Start the Gateway

```bash
# Inject secrets
~/.idlos/inject-secrets.sh

# Start gateway
cd ~/.idlos
openclaw gateway start --config ~/.idlos/openclaw.json

# Or run in background
nohup openclaw gateway start --config ~/.idlos/openclaw.json > ~/.idlos/gateway.log 2>&1 &

# Check status
openclaw gateway status --config ~/.idlos/openclaw.json

# View logs
tail -f ~/.idlos/gateway.log
```

---

## Step 8: Expose for Slack Events (if needed)

If Slack events aren't working (bot doesn't receive DMs), you need to expose the gateway:

### Option A: Tailscale Funnel (Recommended)
```bash
# If Tailscale is installed
tailscale funnel 3737
# Note the URL, add to Slack Event Subscriptions
```

### Option B: ngrok
```bash
ngrok http 3737
# Note the URL, add to Slack Event Subscriptions
```

### Option C: Socket Mode (No public URL needed)
1. In Slack app settings → **Socket Mode** → Enable
2. Generate App-Level Token with `connections:write` scope
3. Add to OpenClaw config:
```json
"slack": {
  "plugin": "slack",
  "socketMode": true,
  "appToken": "xapp-...",
  "botToken": "xoxb-...",
  ...
}
```

---

## Step 9: Test

1. **Slack DM test:**
   - Find "IDL OS" in Slack
   - Send a DM: "Hello, can you hear me?"
   - Should get a response

2. **Asana test:**
   - DM: "List my Asana tasks"
   - Should query and return tasks

3. **Google Docs test:**
   - DM: "List files in Google Drive"
   - Should return recent files

---

## Step 10: Onboard Users

Send to Connor, Alec, Josh:

> **IDL OS is live!** 🎉
> 
> You can now DM the IDL OS bot in Slack for help with:
> - Asana tasks (create, update, query)
> - Google Docs (find, summarize, draft)
> - General IDL operations questions
> 
> Just DM @IDL OS like you would a teammate.
> 
> A few notes:
> - It won't send external emails without your approval
> - It can see shared docs and Asana, so context is maintained
> - If something goes wrong, ping Evan
> 
> Try it: "What are my open Asana tasks?"

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Bot doesn't respond to DMs | Check Socket Mode or Event URL; verify user in allowlist |
| "Model not allowed" | Add model to `agents.defaults.models` in config |
| Asana errors | Verify PAT is valid; check workspace ID |
| Google auth fails | Re-run `gog auth login`; check token expiry |
| Gateway won't start | Check port 3737 not in use; check logs |

---

## Files Created

After setup, you'll have:
```
~/.idlos/
├── openclaw.json          # Main config (with secrets)
├── inject-secrets.sh      # Secret injection script
├── gateway.log            # Gateway logs
└── workspace/
    ├── SOUL.md            # Bot personality
    ├── TOOLS.md           # Tool notes
    ├── AGENTS.md          # Operating instructions
    └── MEMORY.md          # Long-term memory
```

---

## Next Steps After Setup

1. [ ] Monitor first few conversations for issues
2. [ ] Add IDL-specific context to SOUL.md (team structure, current priorities)
3. [ ] Consider adding skills for common workflows
4. [ ] Set up cron jobs for daily digests (if wanted)
5. [ ] Add more users to allowlist as needed
