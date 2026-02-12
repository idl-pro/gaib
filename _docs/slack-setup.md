# IDL OS — Slack Setup Guide

**Goal:** Get an AI coworker bot running in IDL's Slack workspace.

**Time:** ~30 minutes

**Prerequisites:**
- Admin access to IDL Slack workspace
- Access to the Mac mini running OpenClaw (or wherever you'll host this)

---

## Option A: Slack App (Recommended)

This is the "proper" way — creates a bot that's clearly an app.

### Step 1: Create Slack App

1. Go to https://api.slack.com/apps
2. Click **Create New App** → **From manifest**
3. Select your **IDL workspace**
4. Paste this manifest:

```json
{
  "display_information": {
    "name": "IDL OS",
    "description": "AI coworker for the IDL team"
  },
  "features": {
    "bot_user": {
      "display_name": "IDL OS",
      "always_online": true
    },
    "app_home": {
      "messages_tab_enabled": true,
      "messages_tab_read_only_enabled": false
    }
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "app_mentions:read",
        "channels:history",
        "channels:read",
        "chat:write",
        "groups:history",
        "groups:read",
        "im:history",
        "im:read",
        "im:write",
        "mpim:history",
        "mpim:read",
        "reactions:read",
        "reactions:write",
        "users:read"
      ]
    }
  },
  "settings": {
    "socket_mode_enabled": true,
    "event_subscriptions": {
      "bot_events": [
        "app_mention",
        "message.channels",
        "message.groups",
        "message.im",
        "message.mpim"
      ]
    }
  }
}
```

5. Click **Create**

### Step 2: Get Tokens

**App Token (for Socket Mode):**
1. Go to **Basic Information** → **App-Level Tokens**
2. Click **Generate Token and Scopes**
3. Name: `socket-token`
4. Add scope: `connections:write`
5. Click **Generate**
6. Copy the token (starts with `xapp-`)

**Bot Token:**
1. Go to **OAuth & Permissions**
2. Click **Install to Workspace** → **Allow**
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### Step 3: Configure OpenClaw

Create or update the OpenClaw config file. If running as a new instance:

```bash
# Create config directory
mkdir -p ~/.idl-os

# Create config file
cat > ~/.idl-os/openclaw.yaml << 'EOF'
gateway:
  bind: "127.0.0.1:3002"  # Different port from main Genos instance

channels:
  slack:
    enabled: true
    appToken: "xapp-YOUR-APP-TOKEN"
    botToken: "xoxb-YOUR-BOT-TOKEN"
    
    # DM policy - start with allowlist for safety
    dm:
      enabled: true
      policy: "allowlist"
      allowFrom:
        - "evan@idl.pro"      # Add team emails
        - "frances@idl.pro"
        - "andrea@idl.pro"
    
    # Channel policy - only respond in approved channels
    groupPolicy: "allowlist"
    channels:
      "#idl-os-test":         # Start with a test channel
        allow: true
        requireMention: true  # Must @mention the bot

agents:
  defaults:
    model: "anthropic/claude-sonnet-4-20250514"
EOF
```

**Or add to existing OpenClaw config:**

```yaml
channels:
  slack:
    enabled: true
    appToken: "xapp-..."
    botToken: "xoxb-..."
    dm:
      enabled: true
      policy: "allowlist"
      allowFrom:
        - "evan@idl.pro"
        - "frances@idl.pro"
    groupPolicy: "allowlist"
    channels:
      "#idl-os-test":
        allow: true
        requireMention: true
```

### Step 4: Add IDL Context

Create workspace files for IDL context:

```bash
mkdir -p ~/.idl-os/workspace

# Create AGENTS.md
cat > ~/.idl-os/workspace/AGENTS.md << 'EOF'
# IDL OS Agent

You are an AI coworker for the International Dance League (IDL) team.

## Your Role
- Help team members with daily tasks
- Track vendor communications and follow-ups
- Prepare meeting briefs
- Draft emails and updates
- Answer questions about IDL operations

## Key Context
- IDL is building a professional dance league
- Season 1 launches May 2026 in NYC
- Key events: NYC (May 2), Vancouver (Late May), Sydney (Aug), Seoul (Sep), LA (Sep 19-20)

## Team Members
- Connor: Co-founder & CEO (sponsorship, investors)
- Evan: Co-founder & President (product, ops)
- Frances: EA / Operations
- Andrea: Head of Marketing
- Alec: Partnerships
- Jason: CFO

## Systems We Use
- Asana: Task management
- Slack: Team communication
- Google Workspace: Email, calendar, docs
- Granola: Meeting notes

## How to Help
- Be concise and action-oriented
- When drafting emails, match the team's professional but warm tone
- Flag urgent items proactively
- Ask clarifying questions if needed
EOF

# Create MEMORY.md for ongoing context
cat > ~/.idl-os/workspace/MEMORY.md << 'EOF'
# IDL OS Memory

## Active Projects
- NYC Event (May 2): Hammerstein Ballroom
- Vancouver Event: UBC Thunderbird Arena
- Fan voting app: Launch May 2

## Key Vendors
- [Add as you learn them]

## Team Preferences
- [Add as team members share them]
EOF
```

### Step 5: Start OpenClaw

```bash
# If running as separate instance
cd ~/.idl-os
openclaw gateway start --config openclaw.yaml

# Or if adding to existing instance, just restart
openclaw gateway restart
```

### Step 6: Test in Slack

1. **Invite the bot** to `#idl-os-test` channel
   - Type `/invite @IDL OS` in the channel

2. **Test DM:**
   - Find "IDL OS" in your Slack sidebar under Apps
   - Send a message: "Hello, what can you help me with?"

3. **Test channel mention:**
   - In `#idl-os-test`, type: `@IDL OS what's on the calendar today?`

### Step 7: Add Integrations

Once basic chat works, add tool access:

**Asana:**
```yaml
# Add to config
tools:
  asana:
    enabled: true
    pat: "YOUR-ASANA-PAT"  # From ~/.clawdbot/asana/pat.json
    workspace: "1211178525495344"  # IDL workspace
```

**Google (via gog CLI):**
```yaml
# gog is already configured system-wide
# Just ensure the agent account has access
```

---

## Option B: User Account (Simpler, Not Recommended Long-Term)

If you want to skip the app setup and just use a regular Slack user:

### Step 1: Create User

1. Create `os@idl.pro` email account
2. Invite to IDL Slack workspace
3. Complete onboarding as that user

### Step 2: Get User Token

This requires OAuth flow or using Slack's legacy tokens (if available).

**Option B1: OAuth App for User Token**
1. Create app as above, but add **User Token Scopes**
2. Install app and authorize as `os@idl.pro`
3. Copy the User OAuth Token (`xoxp-...`)

**Option B2: Use the User Token with OpenClaw**
```yaml
channels:
  slack:
    enabled: true
    appToken: "xapp-..."    # Still need app for Socket Mode
    botToken: "xoxb-..."    # Bot token
    userToken: "xoxp-..."   # User token for reads
    userTokenReadOnly: false  # Allow user token writes
```

### Why Option A is Better

| Aspect | App (Option A) | User (Option B) |
|--------|---------------|-----------------|
| Setup complexity | Slightly more | Slightly less |
| Slack ToS | ✅ Compliant | ⚠️ Gray area |
| Seat cost | Free | Uses a license |
| Clear it's AI | ✅ "APP" badge | ❌ Looks human |
| Maintainability | Better | Worse |

---

## Troubleshooting

### Bot doesn't respond

1. Check OpenClaw is running: `openclaw gateway status`
2. Check logs: `openclaw gateway logs`
3. Verify tokens are correct in config
4. Make sure bot is invited to the channel
5. Check `groupPolicy` and `dm.policy` settings

### "Not authorized" errors

- Check `dm.allowFrom` includes the user's email
- Check `channels` allowlist includes the channel
- Verify the user has Slack access

### Bot responds but can't access Asana/Calendar

- Verify Asana PAT is valid
- Check gog CLI is authenticated: `gog calendar events evan@idl.pro --days 1`

---

## Next Steps After Setup

1. [ ] Test with Evan first
2. [ ] Add Frances to `dm.allowFrom`
3. [ ] Create `#idl-os` channel for team
4. [ ] Set up daily brief cron job
5. [ ] Document vendor list in MEMORY.md
6. [ ] Add per-user preference files

---

## Quick Reference

**Tokens needed:**
- App Token: `xapp-...` (Socket Mode)
- Bot Token: `xoxb-...` (API calls)

**Key config options:**
- `dm.policy`: `allowlist` | `pairing` | `open`
- `groupPolicy`: `allowlist` | `open` | `disabled`
- `requireMention`: `true` = must @mention in channels

**Useful commands:**
```bash
openclaw gateway status
openclaw gateway logs
openclaw gateway restart
```
