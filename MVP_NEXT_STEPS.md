# BacklogIQ — real-product MVP roadmap (beginner edition)

## One-sentence MVP
A Product Owner signs in, creates one product, writes a new stakeholder request, receives a genuine AI-assisted analysis, approves or edits the recommendation, and finds the updated backlog next time they return.

## The six essential features

| Feature | What a user can do | Essential test |
|---|---|---|
| Sign-in | Make a private account and return | Another user cannot see this user's projects |
| Product workspace | Create a name, goal and scope | Saved project appears after logout/login |
| Request intake | Add an original stakeholder message with source/date | Original message is preserved |
| AI suggestion | Suggest work type, rationale, priority inputs, uncertainty, next action | Clearly labeled suggestion; a malformed response doesn't create work |
| Human decision | Accept, edit, split or defer | AI recommendation and decision are both recorded |
| Saved backlog | Review/refine/reorder accepted work | Data persists across different browsers/devices for same account |

## Architecture — add only when ready

`Browser UI (existing prototype)` → `Supabase Auth + Postgres with Row Level Security`.

For AI: `Browser` → `Authenticated server function` → `LLM API` → `Structured recommendation` → `Product Owner approval`.

Do **not** call an AI provider directly from public HTML or commit an API key. Store secrets only on the server side. For a first pilot, manually entered requests are adequate; integrations with Jira/Azure DevOps/ServiceNow can wait.

### Suggested data model
- `projects`: user/owner, name, goal, constraints
- `stakeholder_requests`: project, source, immutable request body, received timestamp
- `ai_analyses`: request, proposed classification, explanation, assumptions, model version, created timestamp
- `backlog_items`: project, source request, item type, title, description, status, priority, estimate, parent epic
- `decisions`: actor, action, previous/proposed/approved values, rationale, timestamp
- `release_plans`: project, target, capacity, release state

Design authorization rules so users see only projects they own or are explicitly invited to; for a one-user MVP, ownership rules are enough. AI never approves release commitments automatically.

## Suggested incremental build sequence

1. **Demo online.** Publish the current static HTML on GitHub Pages. Do not call it live AI.
2. **Real saving.** Add sign-in, one-project-per-user cloud data, and browser-to-database data retrieval. Keep mock AI analysis.
3. **Actual AI analysis.** Add one authenticated server-side endpoint with strict JSON validation, controlled costs, audit records, and human approval.
4. **Real backlog actions.** Accept/edit/defer, split epics, add Given–When–Then criteria, estimate and reorder.
5. **Quality pilot.** Test 20–30 synthetic requests with 3–5 Product Owners. Record whether classifications and recommended next actions are helpful, and whether errors are correctable.
6. **Only then expand.** Multi-user collaboration, Jira/ServiceNow integration, analytics, and broader product scope.

## Completion criteria for MVP
- Someone other than the maker can sign in and use it without instructions.
- The same user can see their backlog after signing in on a second device.
- A new request receives an actual model-generated suggestion; suggestions are never mislabeled as guaranteed truth.
- The Product Owner must explicitly confirm, edit or reject the suggestion.
- Each suggestion and approval is auditable.
- Cross-account data access is blocked in tests.
- A user can export or delete their own test data.
- No AI credentials are visible in the webpage or GitHub repo.
- No real student/employee/confidential data is used in the pilot.

## Services to consider

- **GitHub Pages:** public static demo hosting.
- **Supabase:** login, Postgres database, row-level security and serverless Edge Functions. Free-tier availability and limits can change; confirm at https://supabase.com/pricing.
- **AI provider:** use an API called from a server function with budget/usage caps; AI API calls may cost money.

Treat the existing educational simulation as the **prototype**, and this real-user workflow as the **MVP**. They can share the same design and domain concepts without pretending the demo already has production security.
