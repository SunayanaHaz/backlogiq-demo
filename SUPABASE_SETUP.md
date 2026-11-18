# BacklogIQ Cloud Projects — setup and testing

This document explains the manual setup for the new `cloud.html` Phase 2 prototype. It does not change or deploy the existing `index.html` simulation.

## Version A compatibility

The page uses only these existing tables and columns:

- `projects`: `id`, `owner_id`, `name`, `goal`, `created_at`
- `stakeholder_requests`: `id`, `project_id`, `stakeholder`, `request_text`, `status`, `created_at`

Project inserts send `owner_id`, `name`, and `goal`. Request inserts send only `project_id`, `stakeholder`, and `request_text`. `status` is omitted so the existing database default applies.

## First browser setup

1. Open `cloud.html` in a browser with empty local storage.
2. The connection panel must appear first, with fields for the Supabase Project URL and public publishable/anon key.
3. The browser stores only the public URL/key in `localStorage` under `backlogiq.supabase.config.v1`.
4. After connecting, sign in or create an account.
5. Use **Change connection settings** to edit or reselect the connection later. Use **Forget saved connection** to remove public settings and the saved Auth session.

Never enter or commit database passwords, service-role keys, secret keys, or tokens.

## Authentication setup

In Supabase:

1. Enable Email/Password auth under Authentication → Providers.
2. Configure email confirmation and allowed redirect/site URLs for the deployment origin.
3. Review current RLS policies before adding the separate migration.
4. Back up the database before manually running any SQL.

## Manual RLS migration

The file `supabase/migrations/20261118_version_a_owner_rls.sql` is for manual review and execution outside the app. It is not run automatically.

The proposed migration:

- inventories existing policies;
- removes existing policies on only `projects` and `stakeholder_requests`;
- creates owner-only project select/insert/update policies;
- creates no project DELETE policy;
- creates owner-only request select/insert policies;
- creates no request UPDATE or DELETE policy;
- revokes project DELETE and request UPDATE/DELETE privileges from the `authenticated` browser role;
- preserves existing schemas and rows.

Existing project or request policies outside these tables are not modified. The migration should not be run until a database administrator confirms the policy inventory and existing FK behavior.

## Static checks

These checks do not require live credentials:

- A new browser/empty local storage branch renders the setup panel first.
- `showState()` does not hide setup merely because `config` is null.
- A “Change connection settings” button is available from auth and workspace states.
- Inline JavaScript should be syntax-checked from the complete file using Node: `node --check` against an extracted script or by using a browser console.
- Stored values are rendered through `esc()` rather than as raw HTML.
- No database password or service-role/secret key is present in the browser file.
- `index.html` is unchanged by this first commit.

## Manual live tests requiring Supabase credentials

No live test has been performed in this repository tooling. A Supabase project, public key, and test accounts are required to verify:

1. sign-in and account creation;
2. project insert and cross-device retrieval;
3. request insert using exact Version A fields;
4. default `status` behavior;
5. sign-out and sign-in-again retrieval;
6. cross-account isolation with RLS;
7. attempts to delete a project from the browser fail or are blocked;
8. attempts to update/delete a request from the browser fail or are blocked.

## Safety scope

This phase does not add a project-delete control or API call. The RLS migration also contains no project DELETE policy and no browser request UPDATE/DELETE policy. The migration is a separate file and must be executed manually only after review.
