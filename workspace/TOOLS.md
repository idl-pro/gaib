# TOOLS.md — Gaib

## Asana

- **PAT Location:** 1Password (`op://Gaib/Asana - PAT/credential`)
- **Workspace:** IDL (`1211178525495344`)
- **Access:** Read/write tasks

### Quick Commands
```bash
export ASANA_PAT=$(op read "op://Gaib/Asana - PAT/credential")
WS="1211178525495344"

# List tasks assigned to me
curl -s -H "Authorization: Bearer $ASANA_PAT" \
  "https://app.asana.com/api/1.0/tasks?workspace=$WS&assignee=me&completed_since=now&opt_fields=gid,name,due_on" | jq

# Search tasks
curl -s -H "Authorization: Bearer $ASANA_PAT" \
  "https://app.asana.com/api/1.0/workspaces/$WS/tasks/search?text=KEYWORD&opt_fields=gid,name,due_on,assignee.name" | jq
```

### Team GIDs (for assignment)
- Connor Lim: `1211178514890492`
- Alec Albright: `1211178616062279`
- Frances Vista: `1211751884876024`
- Andrea Chen: `1211414272431978`
- Jason Ton: `1212666606105100`
- Evan Zhou: (workspace owner)

## Google (gog CLI)

- **Account:** `agent@idl.pro` (or configured service account)
- **Calendar access:** IDL calendar via `evan@idl.pro`

### Quick Reference
```bash
# Calendar - next 24h
gog calendar events evan@idl.pro --days 1 --account agent@idl.pro

# Drive - list files
gog drive list --limit 10 --account agent@idl.pro

# Gmail - search
gog gmail search "is:unread" --account agent@idl.pro --max 20
```

## Slack

- **Interface:** Socket Mode (no public URL needed)
- **Allowed users:** Connor, Alec, Josh (via allowlist)
- **Bot name:** Gaib

### Interactions
- Users DM the bot directly
- Bot can send messages but defaults to drafting first for externals

## 1Password

If using 1Password service account:

```bash
export OP_SERVICE_ACCOUNT_TOKEN=$(cat ~/.config/op/service-account-token)

# Read secret
op read "op://Gaib/Item Name/field"

# List items
op item list --vault "Gaib"
```

## Drafts

External communications saved to `drafts/` folder:
- `drafts/YYYY-MM-DD-recipient-subject.md`
- Frontmatter: type, to, subject, created, status

User reviews and approves before sending.
