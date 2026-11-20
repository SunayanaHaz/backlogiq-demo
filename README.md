# BacklogIQ — Product Owner simulation and cloud backlog

BacklogIQ is a learning prototype for the fictional **Husky SmartDesk AI** support product. It now has **two separate experiences**:

1. **Guided Simulation and Advanced Workbench** (`index.html`) — a browser-local, fictional, interactive product lifecycle with scripted/rules-based suggestions, Product Owner decisions, prioritization, QA, and a product preview. This is **not real AI**, and its session is not synchronized with cloud projects.
2. **Cloud Projects** (`cloud.html`) — actual Supabase email/password authentication, projects, original stakeholder requests, and a linked backlog. The Product Owner can create/edit backlog items, set type/priority/status, and refine acceptance criteria. These items persist in Supabase once the manual Phase 2C migration is installed.

**Cloud Projects is not an officially supported University of Washington application.** Use only synthetic/fictional data. A backlog status of **Done** is a tracking field, not proof that a real product feature was released.

## Setup

Read [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for step-by-step configuration, manual migration, rollout, and tests.

The new **`supabase/migrations/20261119_phase2c_backlog_items.sql`** file must be reviewed and **run manually** in Supabase, once. Neither the HTML nor GitHub deploys SQL. Do not apply it to a database whose existing schema and owner RLS policies have not been verified.

## Scope and limitations

- Cloud projects, source requests, and backlog items are persisted in Supabase and scoped to the authenticated project owner through RLS. Live authorization still requires testing after the migration.
- Original stakeholder requests are read-only in the UI; Version A database policies are expected to block their UPDATE/DELETE. Backlog item source request and project links cannot be edited through the public API once created.
- Draft backlog items may omit acceptance criteria. Ready stories and bugs require Given/When/Then; Ready epics, technical tasks, and spikes can instead provide an outcome/completion note.
- There is no real AI service, cloud-to-simulation synchronization, project collaboration, or official UW system integration.
- The browser stores the public Supabase connection settings and the login session in `localStorage` on that device. Avoid shared computers; sign out when finished.

## Developer checks

With Node.js installed, run from the repository root:

```sh
node tests/phase2c_test.cjs
```

The included tests use a **mock** REST/Auth backend to exercise create/edit, required fields, refresh, project switching and stale responses. They do not prove security of the live Supabase database. See the live-account and direct-API checklist in [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Security

Use **only** your Supabase public publishable/anon key in the browser. Never commit real passwords, access/refresh tokens, database credentials, `service_role`/secret keys, student records, or company-confidential data to this public repository.
