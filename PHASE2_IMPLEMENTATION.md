# Phase 2 implementation notes

## Files in this commit

- `cloud.html`: Supabase Auth and Version A project/request CRUD-lite interface.
- `supabase/migrations/20261118_version_a_owner_rls.sql`: proposed manual RLS migration for review only.
- `SUPABASE_SETUP.md`: setup, static checks, manual testing, and security instructions.

## Explicit exclusions

- `index.html` is unchanged in this commit.
- The migration is not executed.
- The browser UI does not expose project deletion.
- The browser UI does not expose stakeholder-request update/deletion.
- Live Supabase functionality has not been tested.
