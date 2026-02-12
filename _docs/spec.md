# IDL OS — Specification

**Version:** 0.2
**Last Updated:** 2026-02-07
**Status:** Active Development

---

## 1. Overview

### 1.1 Vision
A dashboard-first AI coworker system for IDL team members. Not a chatbot you talk to — a visual command center that shows what your AI is doing, what it knows, and lets you direct it.

### 1.2 Key Insight (from Launch/OpenClaw Ultron)
> "Start with a dashboard. That should be your step one once you get your OpenClaw online... Being able to look at it visually is much better than trying to interact with its backend all just from a chat interface." — Oliver, This Week in Startups

### 1.3 What This Is
- **Dashboard** = primary interface (not chat)
- **AI Coworker** = runs tasks, surfaces information, drafts outputs
- **Shared Context** = IDL knowledge base all agents can read
- **Personal Memory** = user-specific preferences, history, workflows

### 1.4 Success Criteria
| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Time saved | 5+ hrs/week per user | ROI justification |
| Daily opens | 80%+ of workdays | Actual adoption |
| Task completion | 60%+ automated | Real work getting done |
| Edit rate | <20% on drafts | Quality output |

---

## 2. Dashboard Design

### 2.1 Core Views

```
┌────────────────────────────────────────────────────────────┐
│  IDL OS                          [Frances ▾] [⚙️] [?]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   TODAY      │  │   PENDING    │  │   DRAFTS     │     │
│  │   ────────   │  │   ────────   │  │   ────────   │     │
│  │ • 3 meetings │  │ • 5 vendor   │  │ • 2 emails   │     │
│  │ • 7 tasks    │  │   responses  │  │ • 1 recap    │     │
│  │ • 2 overdue  │  │ • 2 sponsor  │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  ACTIVITY FEED                           [Refresh]  │  │
│  │  ─────────────────────────────────────────────────  │  │
│  │  🕐 9:00am  Daily brief generated → View            │  │
│  │  🕐 9:15am  Asana scan: 2 stale items → View        │  │
│  │  🕐 10:30am Meeting prep: Honda call → View         │  │
│  │  🕐 11:00am Vendor draft: Soundcheck → Edit/Send    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │  MY PREFERENCES      │  │  SCHEDULED JOBS          │   │
│  │  ─────────────────   │  │  ────────────────────    │   │
│  │  • Tone: professional│  │  ☑ Daily brief (8am)     │   │
│  │  • CC me on vendor   │  │  ☑ Asana scan (9am)      │   │
│  │  • Flag urgent >$50K │  │  ☑ Vendor check (Mon)    │   │
│  │  [Edit Preferences]  │  │  ☐ Weekly recap (Fri)    │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  💬 QUICK COMMAND                                   │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │ Draft a follow-up to Soundcheck about...    │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 2.2 Dashboard Components

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| **Today** | Day-at-a-glance | Google Calendar + Asana |
| **Pending** | Items awaiting response | Gmail + Asana + custom tracking |
| **Drafts** | AI-generated content for review | OpenClaw workspace |
| **Activity Feed** | What AI did / is doing | OpenClaw logs |
| **Preferences** | User's rules & style | Memory files |
| **Scheduled Jobs** | Cron jobs status | OpenClaw cron |
| **Quick Command** | Ad-hoc requests | Chat fallback |

### 2.3 Key Interactions

**View → Review → Approve/Edit → Send**
1. AI generates draft (email, recap, task update)
2. Appears in Drafts section
3. User clicks to review
4. One-click send or inline edit
5. Sent items logged in Activity

**Pending Tracker**
- AI scans for items awaiting response (emails sent, vendors contacted)
- Dashboard shows aging (2 days, 5 days, etc.)
- Click to see context + draft follow-up
- User approves or dismisses

---

## 3. Users & Rollout

### 3.1 Phase 1 Users

| User | Role | Top Workflows | Why First |
|------|------|---------------|-----------|
| **Frances** | EA / Ops | Vendor tracking, meeting prep, task management | High volume of repetitive coordination |
| **Andrea** | Marketing | Content scheduling, social monitoring, recap drafts | Clear measurable outputs |

### 3.2 User Onboarding (per person)
1. **Kickoff call** (30 min) — explain system, gather preferences
2. **Workflow mapping** (60 min) — document their top 5 tasks step-by-step
3. **Preference setup** — configure their memory file (tone, rules, defaults)
4. **First week** — daily 10-min check-ins to tune prompts
5. **Graduation** — self-sufficient after ~1 week

### 3.3 Preference Examples

```markdown
# Frances — Preferences

## Communication Style
- Tone: Professional but warm
- Signature: "Best, Frances"
- Always CC evan@idl.pro on vendor emails >$10K

## Task Management  
- Flag overdue Asana items after 2 days
- Ignore tasks tagged "backburner"
- Priority order: Event logistics > Sponsor deliverables > Admin

## Vendors
- Soundcheck Audio: Primary contact is Mike
- Always mention PO# in payment discussions
- Aggressive follow-up OK (they're slow)

## Meetings
- Prep me 30 min before externals
- No prep needed for internal standups
```

---

## 4. Technical Architecture

### 4.1 Stack Recommendation

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Dashboard UI** | Streamlit | Fast to build, Python, non-technical friendly |
| **AI Backend** | OpenClaw | Already running, proven, Genos can maintain |
| **Context Store** | Obsidian vault | Markdown files, easy to edit, version controlled |
| **Integrations** | MCP + gog CLI | Asana, Google, Slack connectors exist |
| **Hosting** | Mac mini (local) | Cost-effective, data stays internal |

### 4.2 System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         IDL OS                               │
│                                                              │
│   ┌─────────────┐         ┌─────────────────────────────┐   │
│   │  Streamlit  │◄───────►│  OpenClaw Instance          │   │
│   │  Dashboard  │   API   │  (per user or shared)       │   │
│   └─────────────┘         └──────────────┬──────────────┘   │
│         │                                │                   │
│         │                                ▼                   │
│         │                 ┌─────────────────────────────┐   │
│         │                 │  Shared Context Vault       │   │
│         │                 │  (IDL knowledge base)       │   │
│         │                 └─────────────────────────────┘   │
│         │                                │                   │
│         ▼                                ▼                   │
│   ┌───────────────────────────────────────────────────────┐ │
│   │                  MCP Connectors                        │ │
│   │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      │ │
│   │  │ Asana  │  │ Google │  │ Slack  │  │ Custom │      │ │
│   │  └────────┘  └────────┘  └────────┘  └────────┘      │ │
│   └───────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Deployment Options

**Option A: Single OpenClaw, Multi-User Dashboard**
- One OpenClaw instance with user context switching
- Simpler to maintain
- Lower cost
- Risk: Context bleed between users

**Option B: OpenClaw per User** ← Recommended
- Each user gets their own OpenClaw instance
- Clean separation
- More setup, but scales better
- Genos manages/coordinates

**Option C: Shared OpenClaw + Lightweight Bots**
- Central OpenClaw for heavy lifting
- Simple Slack bots per user for interface
- Middle ground

---

## 5. Scheduled Jobs (Cron)

### 5.1 Universal Jobs (all users)

| Job | Schedule | What It Does |
|-----|----------|--------------|
| Daily Brief | 8:00 AM | Calendar + top Asana tasks + pending items |
| Asana Stale Check | 9:00 AM | Flag items with no activity >3 days |
| Meeting Prep | -30 min | Context on attendees before external meetings |

### 5.2 Frances-Specific Jobs

| Job | Schedule | What It Does |
|-----|----------|--------------|
| Vendor Response Check | Mon/Thu 10am | Who hasn't replied, draft follow-ups |
| Event Countdown | Daily | Days until next event, open items |
| Payment Tracker | Weekly Fri | Invoices pending, approvals needed |

### 5.3 Andrea-Specific Jobs

| Job | Schedule | What It Does |
|-----|----------|--------------|
| Content Calendar | Daily 8am | What's scheduled to post today |
| Social Mentions | 2x daily | IDL mentions, competitor activity |
| Weekly Recap Draft | Fri 3pm | Draft marketing update for team |

---

## 6. Integrations

### 6.1 Phase 1 (MVP)

| System | Access Level | Use Cases |
|--------|--------------|-----------|
| **Asana** | Read + Write | View tasks, create tasks, update status |
| **Google Calendar** | Read | Meeting info, availability |
| **Google Gmail** | Read + Draft | Read threads, draft replies (no auto-send) |
| **Slack** | Read + Send (internal) | Read channels, send to user's DM |

### 6.2 Phase 2

| System | Access Level | Use Cases |
|--------|--------------|-----------|
| **Notion** | Read | Pull reference docs |
| **Airtable** | Read | Sponsor database |
| **Social APIs** | Read | Monitoring mentions |

### 6.3 Integration Principles
1. **Read before write** — start read-only, add write after trust
2. **Draft, don't send** — external emails always require approval
3. **Log everything** — audit trail for all API calls
4. **Graceful degradation** — if integration fails, surface to user

---

## 7. Shared Context (IDL Knowledge Base)

### 7.1 Structure

```
IDL-Context/
├── README.md              # How to use this vault
├── overview.md            # Mission, vision, strategy
├── team-directory.md      # Who's who, roles, contacts
├── systems-map.md         # What tools we use
├── terminology.md         # IDL-specific terms
├── season-1/
│   ├── events.md          # Event schedule, venues, budgets
│   ├── sponsors.md        # Current sponsors, pipeline
│   └── kpis.md            # Targets, actuals
├── vendors/
│   ├── index.md           # Vendor list
│   └── [vendor-name].md   # Per-vendor context
└── templates/
    ├── email-vendor.md
    ├── email-sponsor.md
    └── meeting-recap.md
```

### 7.2 Maintenance
- Genos updates from Granola meeting notes
- Team can edit directly (it's just markdown)
- Weekly sync to catch drift

---

## 8. Authentication

### 8.1 Google OAuth (idl.pro only)

**Requirement:** Only @idl.pro emails can access the dashboard.

**Flow:**
```
User visits dashboard
    ↓
Redirect to Google OAuth
    ↓
User signs in with Google
    ↓
Check email domain == "idl.pro"
    ↓
✅ Allow access  OR  ❌ Reject + error message
```

**Implementation (Streamlit + Google OAuth):**

```python
# streamlit_app.py
import streamlit as st
from authlib.integrations.requests_client import OAuth2Session

GOOGLE_CLIENT_ID = st.secrets["google"]["client_id"]
GOOGLE_CLIENT_SECRET = st.secrets["google"]["client_secret"]
ALLOWED_DOMAIN = "idl.pro"

def check_auth():
    """Verify user is authenticated with @idl.pro email."""
    if "user" not in st.session_state:
        # Show login button
        if st.button("Sign in with Google"):
            # Redirect to Google OAuth
            oauth = OAuth2Session(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
            auth_url, state = oauth.create_authorization_url(
                "https://accounts.google.com/o/oauth2/auth",
                scope=["openid", "email", "profile"],
                hd=ALLOWED_DOMAIN  # Restricts to idl.pro in Google's UI
            )
            st.session_state["oauth_state"] = state
            st.markdown(f'<meta http-equiv="refresh" content="0;url={auth_url}">', 
                       unsafe_allow_html=True)
        st.stop()
    
    # Verify domain (belt + suspenders)
    email = st.session_state["user"]["email"]
    if not email.endswith(f"@{ALLOWED_DOMAIN}"):
        st.error(f"Access restricted to @{ALLOWED_DOMAIN} emails.")
        del st.session_state["user"]
        st.stop()
    
    return st.session_state["user"]
```

**Google Cloud Console Setup:**
1. Create project: `idl-os`
2. Enable Google OAuth 2.0
3. Configure consent screen (internal to idl.pro org)
4. Create OAuth credentials (Web application)
5. Add redirect URIs:
   - `http://localhost:8501/callback` (dev)
   - `https://os.idl.pro/callback` (prod)
6. Restrict to idl.pro domain in consent screen settings

**Secrets Management:**
```toml
# .streamlit/secrets.toml (not committed to git)
[google]
client_id = "xxx.apps.googleusercontent.com"
client_secret = "xxx"
```

### 8.2 Session Management

| Setting | Value | Rationale |
|---------|-------|-----------|
| Session timeout | 8 hours | Workday length |
| Refresh token | Yes | Don't re-auth constantly |
| Remember device | 30 days | Convenience on trusted devices |

### 8.3 User Context from OAuth

Once authenticated, we get:
- `email` → identifies user, loads their preferences
- `name` → display in UI
- `picture` → avatar (optional)

```python
# Map email to user config
USER_CONFIG = {
    "frances@idl.pro": {"role": "ops", "preferences": "frances-prefs.md"},
    "andrea@idl.pro": {"role": "marketing", "preferences": "andrea-prefs.md"},
    "evan@idl.pro": {"role": "admin", "preferences": "evan-prefs.md"},
}
```

---

## 9. Security & Guardrails

### 9.1 Data Access Control

| Data Type | AI Access | Example |
|-----------|-----------|---------|
| Public | Full | IDL website, social posts |
| Internal | Read | Strategy docs, team updates |
| Sensitive | Restricted | Contracts (summaries only) |
| Confidential | None | Term sheets, cap table |

### 9.2 Action Guardrails

| Action | Allowed? | Condition |
|--------|----------|-----------|
| Read internal docs | ✅ Yes | — |
| Draft email | ✅ Yes | — |
| Send internal Slack | ✅ Yes | User's own DM or approved channels |
| Send external email | ⚠️ Review | Must be approved in dashboard |
| Create Asana task | ✅ Yes | — |
| Modify Asana task | ⚠️ Review | Only user's own tasks |
| Access financials | ❌ No | — |

### 9.3 Audit Log
Every action logged with:
- Timestamp
- User
- Action type
- Target (email, task, etc.)
- Outcome (success/fail)
- Approval status

---

## 10. Implementation Plan

### 10.1 Week 1: Foundation
- [ ] Set up Google Cloud project + OAuth credentials (idl.pro restricted)
- [ ] Spin up Streamlit dashboard skeleton with auth
- [ ] Connect to OpenClaw workspace (read files)
- [ ] Build "Today" view (calendar + Asana)
- [ ] Frances kickoff call + workflow mapping

### 10.2 Week 2: Core Features
- [ ] Implement Daily Brief cron job
- [ ] Build Pending Tracker (email + vendor)
- [ ] Create Drafts review flow
- [ ] Frances daily check-ins + tuning

### 10.3 Week 3: Polish + Second User
- [ ] Activity Feed with history
- [ ] Preferences editor
- [ ] Andrea onboarding
- [ ] Cross-user testing

### 10.4 Week 4: Handoff
- [ ] Documentation for team
- [ ] Runbook for common issues
- [ ] Metrics dashboard
- [ ] Retrospective + next phase planning

---

## 11. Cost Estimate

| Item | Monthly Cost | Notes |
|------|--------------|-------|
| OpenClaw API usage | $50-150/user | Depends on volume |
| Hosting (Mac mini) | $0 | Already have hardware |
| Asana API | $0 | Included in plan |
| Google API | $0 | Workspace included |
| Slack API | $0 | Included in plan |
| **Total** | **$100-300/mo** | For 2 users |

---

## 12. Open Questions

- [ ] Frances available for kickoff this week?
- [ ] Which Asana workspace/projects should agents access?
- [ ] Slack channel for IDL OS feedback/issues?
- [ ] Budget approval for ~$200/mo API costs?
- [ ] Where to host Streamlit? (Mac mini, Vercel, internal?)
- [ ] Who has Google Workspace admin access to create OAuth app?
- [ ] Custom domain for dashboard? (e.g., os.idl.pro)

---

## 13. Next Actions

1. **Evan:** Confirm Frances as first user, intro to project
2. **Evan:** Create Google Cloud project + OAuth credentials (or delegate to Genos with admin access)
3. **Genos:** Build Streamlit skeleton with Google OAuth (idl.pro restricted)
4. **Genos:** Document Frances's top 5 workflows
5. **Genos:** Set up Asana PAT for agent access
6. **Week 1 target:** Working auth + "Today" view pulling live data

---

## Appendix

### A. Reference: OpenClaw Ultron Learnings
From Jason Calacanis / This Week in Startups (Feb 6, 2026):
- Dashboard first — visual > chat for understanding state
- Memory files for preferences — don't repeat yourself
- ~1 skill per 1-1.5 days realistic pace
- Cron jobs for proactive surfacing (Slack scan, stale items)
- 60% of production work automatable within 30 days (Oliver's estimate)

### B. Glossary
- **MCP:** Model Context Protocol
- **OpenClaw:** AI agent harness
- **Cron Job:** Scheduled recurring task
- **Pending:** Items awaiting external response
