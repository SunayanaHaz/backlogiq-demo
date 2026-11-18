# BacklogIQ Cloud Projects — setup and testing

This document explains the manual setup for the new `cloud.html` Phase 2 prototype. It does not change or deploy the existing `index.html` simulation.

## Version A compatibility

The page uses only these existing tables and columns:

- `projects`: `id`, `owner_id`, `name`, `goal`, `created_at`
- `stakeholder_requests`: `id`, `project_id`, `stakeholder`, `request_text`, `status`, `created_at`

Project inserts send `owner_id`, `name`, and `goal`. Request inserts send only `project_id`, `stakeholder`, and `request_text`. `status` is omitted so the existing database default applies.

## First browser setup

1. Open `cloud.html` in a browser with empty local storage. The connection form should appear.
2. Enter the Supabase Project URL and public publishable/anon key. The browser stores these public settings in `localStorage` under `backlogiq.supabase.config.v1`.
3. Sign in or create an account. After successful authentication the password field is cleared, and the workspace remains hidden until its records have finished loading.
4. Use **Change connection settings** to edit or reselect the connection later. If the URL or key changes, the saved auth session and in-memory project/request records are cleared and sign-in is required again. Use **Forget saved connection** to clear the connection and session.

Never enter or commit database passwords, service-role keys, secret keys, or tokens.

## Authentication setup

In Supabase:

1. Enable Email/Password auth under Authentication → Providers.
2. Configure email confirmation and allowed redirect/site URLs for the deployment origin.
3. Review current RLS policies before adding the separate migration.
4. Back up the database before manually running any SQL.

## Manual RLS migration

The file `supabase/migrations/20261118_version_a_owner_rls.sql` is for manual review and execution outside the app. It is not run automatically and has not been executed.

The proposed migration inventories existing policies, replaces policies on only the Version A tables, creates owner-only project select/insert/update policies (no project DELETE policy), and creates owner-only request select/insert policies (no request UPDATE or DELETE policy). It revokes project DELETE and request UPDATE/DELETE privileges from the authenticated browser role. Preserve this migration unchanged until the existing database policies have been reviewed.

## Tests

### Static/manual browser checks (no Supabase credentials required)

- With empty local storage, open `cloud.html` and verify the connection form is visible.
- Connect using placeholder/public test settings only, then use Change connection settings and Forget saved connection to verify their visibility and local UI reset behavior.
- Run a JavaScript syntax check by extracting the inline `<script>` body and executing `node --check` on the extracted file, or inspect browser devtools for syntax errors.
- Confirm requests render escaped values and the request insert payload omits `status`.
- Confirm `index.html` is unchanged.

### Live checks requiring Supabase credentials

These have **not** been run. Against a configured test Supabase project, verify:

1. Login: valid credentials authenticate; invalid credentials show an error; password is cleared after successful login.
2. Sign-out: auth fields clear, cached projects disappear from memory/UI, project selection resets, and the next login reloads that user's data.
3. Account switching: sign out of account A, then sign in as account B; account A's records must not remain visible during or after B's loading.
4. New browser storage: setup panel displays; configure public URL/key; sign in and confirm saved records load.
5. Project/request creation, refresh, re-login, Version A field mapping, default status behavior, and owner isolation under RLS.

Do not use real student, employee, or confidential data in testing.
