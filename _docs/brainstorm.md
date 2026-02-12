# IDL OS — Brainstorm

## The Opportunity
IDL is a 10-15 person team building a new sport. We're resource-constrained but need to punch above our weight. AI coworkers could multiply our effective headcount if deployed correctly.

OpenAI Frontier costs enterprise $$$. We can build a scrappy version using:
- OpenClaw (already deployed, battle-tested)
- Claude/GPT models (API access)
- MCP connectors (Asana, Slack, Google, etc.)
- Obsidian for shared context

## Who Needs This First?

**Candidates (non-technical, high-leverage):**
1. **Andrea (Head of Marketing)** — content calendar, social posts, competitor monitoring, influencer outreach
2. **Frances (Ops)** — event logistics, vendor coordination, timeline tracking
3. **Alec** — partnerships, sponsor tracking, outreach sequences
4. **Connor** — investor updates, board prep, sponsor pipeline

**Start with 1-2 people** who:
- Have repetitive workflows that eat time
- Are comfortable experimenting with new tools
- Will give honest feedback

## What Systems to Connect?

| System | Purpose | Priority |
|--------|---------|----------|
| Asana | Tasks, projects, deadlines | P0 |
| Slack | Communication, notifications | P0 |
| Google (Calendar, Gmail, Drive) | Scheduling, docs, email | P0 |
| Notion | Wiki, docs (if still used) | P1 |
| Airtable | Databases (sponsors, contacts?) | P1 |
| Social (Twitter, IG) | Monitoring, drafts | P2 |

## Highest-Value Workflows

### Operations
- [ ] Event checklist automation — what's due this week?
- [ ] Vendor follow-up tracking — who hasn't responded?
- [ ] Timeline updates — pull from Asana, format for stakeholders

### Marketing
- [ ] Content calendar management — what's scheduled, what's missing?
- [ ] Social listening — mentions, competitor posts, trends
- [ ] Draft generation — captions, threads, email copy

### Partnerships
- [ ] Sponsor pipeline tracking — status, next steps, blockers
- [ ] Outreach sequences — draft emails, follow-ups
- [ ] Meeting prep — pull context on who we're talking to

### Fundraising
- [ ] Investor update drafts — pull metrics, format narrative
- [ ] Board meeting prep — agenda, materials, action items
- [ ] Due diligence support — answer questions, pull docs

## Architecture Options

### Option A: OpenClaw Hub
- Central OpenClaw instance with multi-user sessions
- Each team member gets their own session/context
- Shared Brain vault for institutional knowledge
- MCP connectors for Asana, Slack, Google

**Pros:** Already have it, proven, I can help maintain
**Cons:** Requires some technical setup per user, learning curve

### Option B: Dedicated Claude Code Instances
- Each person gets their own Claude Code environment
- Read-only access to shared Obsidian vault
- Individual MCP configs for their specific tools

**Pros:** Isolated, each person owns their agent
**Cons:** More setup, harder to share context

### Option C: Hybrid
- Shared context layer (Obsidian vault with IDL knowledge)
- Individual Claude/OpenClaw instances that reference it
- Slack bot for quick queries anyone can use

**Pros:** Best of both worlds
**Cons:** More complexity

## MVP Proposal

**Week 1-2:**
1. Pick one person (Andrea or Frances)
2. Set up OpenClaw on their machine or shared instance
3. Connect Asana + Google
4. Document 3 specific workflows they do repeatedly
5. Build those workflows as skills/prompts

**Week 3-4:**
1. Iterate based on feedback
2. Add second person
3. Expand to more workflows
4. Document what works for team playbook

## Open Questions
- [ ] Where does IDL's institutional knowledge live today? (Notion? Docs? Slack threads?)
- [ ] What are the biggest time sinks for each team member?
- [ ] Who's most willing to experiment?
- [ ] Budget for API costs? (~$50-200/month per active user)
- [ ] Security/privacy considerations for sponsor data?

## References
- [[frontier-reference]] — OpenAI's enterprise approach
- Genos setup (this workspace) as reference implementation
- OpenClaw docs for MCP/skill patterns
