# IDL OS — Quick Start

**Deploying to Railway?** → Go to [`railway-deploy.md`](railway-deploy.md)

---

## Pre-Setup Checklist

Before deploying anywhere, you need:

### 1. Slack App (15 min)

- [ ] Create app at [api.slack.com/apps](https://api.slack.com/apps) → From manifest
- [ ] Use manifest from `slack-setup.md`
- [ ] Enable Socket Mode → generate App Token (`xapp-...`)
- [ ] Install to workspace → get Bot Token (`xoxb-...`)
- [ ] Get Slack user IDs for Connor, Alec, Josh

### 2. Asana PAT (2 min)

- [ ] Go to [app.asana.com/0/my-apps](https://app.asana.com/0/my-apps)
- [ ] Create Personal Access Token
- [ ] Copy token

### 3. Anthropic API Key (2 min)

- [ ] Go to [console.anthropic.com](https://console.anthropic.com)
- [ ] Create API key (or use existing)

---

## Get Slack User IDs

For each user (Connor, Alec, Josh):
1. In Slack, click their profile
2. Click **More** → **Copy member ID**

```
Connor: U__________
Alec:   U__________
Josh:   U__________
```

---

## Deploy Options

| Option | Best For | Guide |
|--------|----------|-------|
| **Railway** | Always-on, team-managed | [`railway-deploy.md`](railway-deploy.md) |
| Mac mini | Local, Genos-managed | [`setup-guide.md`](setup-guide.md) |

---

## After Deploy

- [ ] Test DM: "Hello, can you hear me?"
- [ ] Test Asana: "What are my open tasks?"
- [ ] Add more users to allowlist as needed
