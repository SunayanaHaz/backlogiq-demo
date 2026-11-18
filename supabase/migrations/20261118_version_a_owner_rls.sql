-- BacklogIQ Version A RLS migration — MANUAL REVIEW ONLY
-- This file is documentation for the database administrator. It is not executed by cloud.html,
-- GitHub Actions, or this repository. Run only after backup and policy review.
-- The migration preserves existing table and column names and existing row data.

begin;

-- First, review these existing policies. Any legacy permissive policy, especially
-- FOR ALL, could combine with another permissive policy through OR if left behind.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('projects', 'stakeholder_requests')
order by tablename, policyname;

-- Replace every existing policy on only these two Version A tables.
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('projects', 'stakeholder_requests')
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end
$$;

alter table public.projects enable row level security;
alter table public.stakeholder_requests enable row level security;

-- Project ownership: browser users may select, insert, and update their own projects.
-- Deliberately no project DELETE policy is created.
create policy backlogiq_projects_owner_select on public.projects
  for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy backlogiq_projects_owner_insert on public.projects
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy backlogiq_projects_owner_update on public.projects
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Stakeholder requests: browser users may read and insert rows only for owned projects.
-- Deliberately no UPDATE or DELETE policy is created for original records.
create policy backlogiq_requests_owner_select on public.stakeholder_requests
  for select to authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = stakeholder_requests.project_id
        and p.owner_id = (select auth.uid())
    )
  );

create policy backlogiq_requests_owner_insert on public.stakeholder_requests
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.projects p
      where p.id = stakeholder_requests.project_id
        and p.owner_id = (select auth.uid())
    )
  );

-- Remove anonymous API access and project/request modification rights not used by this Phase 2 UI.
revoke all on table public.projects from anon;
revoke all on table public.stakeholder_requests from anon;

grant select, insert, update on table public.projects to authenticated;
revoke delete, truncate, references, trigger on table public.projects from authenticated;

grant select, insert on table public.stakeholder_requests to authenticated;
revoke update, delete, truncate, references, trigger on table public.stakeholder_requests from authenticated;

commit;

-- Post-migration verification:
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('projects', 'stakeholder_requests')
order by tablename, policyname;
