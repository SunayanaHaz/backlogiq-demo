# BacklogIQ Cloud Projects — Phase 2C setup, migration, and testing

## What is already present

- `index.html`: existing Guided Simulation and Advanced Workbench; only one ordinary sidebar anchor to `cloud.html` was added. Their internal simulation logic has not changed.
- `cloud.html`: Supabase login, projects, original stakeholder requests, and the new cloud backlog refinement form.
- `supabase/migrations/20261119_phase2c_backlog_items.sql`: **manual-only** database migration.

Cloud backlog is separate from the scripted simulation. Nothing here invokes a real AI model or an official UW service.

## Step 1 — Upload code to the development branch

Use **`phase2c-cloud-backlog`**, not `main`. Place:

- `index.html`, `cloud.html`, `README.md`, and `SUPABASE_SETUP.md` at the repository **root** (replace existing files on this branch).
- `20261119_phase2c_backlog_items.sql` at **`supabase/migrations/`**.
- `tests/phase2c_test.cjs` at **`tests/`** (recommended).

Review the GitHub diff before committing. Do **not** merge to `main` yet. GitHub Pages normally serves `main`, so the deployed site should not change until the merge.

## Step 2 — Check the existing Supabase schema and RLS

In the Supabase Dashboard, open **SQL Editor** for your existing BacklogIQ project. First run this **read-only preflight**, not the migration:

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema='public'
  and table_name in ('projects','stakeholder_requests')
  and column_name in ('id','project_id','owner_id')
order by table_name,column_name;

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public'
  and tablename in ('projects','stakeholder_requests')
order by tablename,policyname;

select tablename, rowsecurity
from pg_tables
where schemaname='public'
  and tablename in ('projects','stakeholder_requests');
```

Expected types: `projects.id`, `projects.owner_id`, `stakeholder_requests.id`, and `stakeholder_requests.project_id` are all `uuid`. Expect owner RLS policies that allow authenticated project owners to read/insert their own records, and deny unauthorized updates/deletes to original stakeholder requests. **Do not infer that RLS is correct just because Account A/B lists are separate in the UI.** If these checks do not match, stop and review the actual database before migrating.

If `backlog_items` already exists, stop and inspect it instead of rerunning this create-table migration.

## Step 3 — Manually run the SQL migration

Back up the project/database and open the SQL file `supabase/migrations/20261119_phase2c_backlog_items.sql` in the repository. Copy its complete contents into Supabase **SQL Editor** and click **Run** only after the preflight above matches. Run **once**.

The migration:

- Verifies UUID column types before attempting to create foreign keys.
- Adds a unique index on the original requests table's `(project_id, id)` pair without modifying request data.
- Creates `backlog_items` with a composite foreign key so the source request must belong to the same project.
- Adds checks for allowed item types, priority, status, and Ready acceptance criteria.
- Enables owner-scoped RLS on the new table.
- Grants authenticated users read, insert, and **editable-column-only update** permissions; not delete, source-link changes, timestamp changes, or anonymous access.
- Updates `updated_at` automatically via a database trigger.

**The website does not run migrations.** Do not disable RLS to work around errors. If SQL errors, stop and share the exact **non-secret** error message for review.

## Step 4 — Browser testing on the development branch

Before merging, test the new HTML using a local static server. On Windows, navigate in File Explorer to the **extracted Phase 2C package folder**. Click the address bar, type `cmd`, press Enter, and run `py -m http.server 8000` (requires Python). Open `http://localhost:8000/cloud.html` in your browser. The local version uses a different browser origin, so enter your existing public Supabase project URL and publishable key again. Do not open the HTML directly with `file://` if browser networking fails.

1. Sign in as **Account A** with your existing public project URL and public publishable key.
2. Select the **Husky SmartDesk AI** project and an existing fictional stakeholder request.
3. Click **Refine into backlog item**. Create a **Draft / User Story** with a title but no acceptance criteria. It should save.
4. Click **Edit**, select **Ready**, and attempt to save without Given/When/Then. It should be blocked.
5. Complete Given/When/Then; save again. It should succeed.
6. Reload the page or sign out/in. The item should remain present with its revised priority and status.
7. Create a **Ready Spike** with outcome/completion notes but without Given/When/Then; it should save.
8. Create a second project, select it, save a request, and confirm the project stays selected and the first project's backlog is not shown.
9. Sign out. Confirm no prior account project/request/backlog content remains visible.
10. Sign in as **Account B** in a separate browser profile. Confirm Account A's data is absent. Create one fictional item for Account B and confirm it is absent for Account A.

## Step 5 — Verify API authorization (manual, still required)

The user-interface Account A/B test is not a substitute for direct API checks. Using an authenticated test client's token **privately** (do not share token here), verify:

- Anonymous access to `backlog_items` is refused.
- Account B cannot select, insert, update, or delete Account A's backlog rows.
- Account A cannot link a backlog item to a request from another project, even a second project Account A owns.
- Account A cannot PATCH `stakeholder_request_id`, `project_id`, `created_at`, or `updated_at` on existing backlog items.
- Account A cannot DELETE backlog items.
- A user cannot UPDATE or DELETE original Version A stakeholder requests.
- A Ready User Story without complete Given/When/Then fails at the **database** level, even if the browser form is bypassed.

For an unauthorized `SELECT` with RLS, zero returned rows is expected; other blocked operations may return permission/constraint errors or affect zero rows. Do not judge security only by the HTTP status.

## Step 6 — Merge only after testing

When the migration, browser flow, and direct API tests pass, merge the reviewed Phase 2C pull request to `main`. After GitHub Pages finishes deploying, test the public BacklogIQ website and the Cloud Projects navigation link. Keep a backup of the current deployment for rollback.

## Development checks already performed

The source was checked using Node.js syntax validation for the inline JavaScript and the bundled `tests/phase2c_test.cjs` mock integration suite. These checks do **not** use the real Supabase project. SQL execution, true RLS verification, live API checks, and GitHub deployment remain manual.

## Credentials and data privacy

Use the Supabase project's **public publishable/anon key** only. Never enter your database password, `service_role`, `sb_secret_...`, or other privileged key in `cloud.html`, GitHub, or screenshots. Use fictional, nonconfidential stakeholder data only.
