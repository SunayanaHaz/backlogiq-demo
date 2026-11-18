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

The file `supabase/migrations/20261118_version_a_owner_rls.sql` is for manual review and execution outside the app. It is not run automatically and has not been executed. Leave it unchanged until the existing database policies have been reviewed.

## Tests

### Static/manual browser checks (no Supabase credentials required)

- With empty local storage, open `cloud.html` and verify the connection form is visible.
- Connect using placeholder/public test settings only, then use Change connection settings and Forget saved connection to verify their visibility and local UI reset behavior.
- Verify Sign Out hides the workspace and clears project/request forms and cached rows immediately; no waiting on the logout request should be needed.
- To test stale response protection, delay a projects or requests fetch, sign out or switch connections before it resolves, and verify the old response does not repopulate the UI.
- Run a JavaScript syntax check by extracting the inline `<script>` body and executing `node --check` on the extracted file, or inspect browser devtools for syntax errors.
- Confirm requests render escaped values and the request insert payload omits `status`.
- Confirm `index.html` and the SQL migration are unchanged.

### Live checks requiring Supabase credentials

These have **not** been run. Against a configured test Supabase project, verify login, sign-out, account switching, project/request creation, refresh, re-login, Version A field mapping, default status behavior, owner isolation, and rejection of browser project-delete and request-update/delete attempts under reviewed RLS policies.

Do not use real student, employee, or confidential data in testing.
