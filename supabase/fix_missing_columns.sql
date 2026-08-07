-- Run this if you already had a submitted_projects / saved_briefs table
-- from before schema.sql was created. "create table if not exists" skips
-- tables that already exist, so any new columns never got added — this
-- patches them in. Safe to run multiple times.

alter table public.submitted_projects add column if not exists images       text[] not null default '{}';
alter table public.submitted_projects add column if not exists brief_data   jsonb;
alter table public.submitted_projects add column if not exists meta        jsonb;
alter table public.submitted_projects add column if not exists folder_color text;
alter table public.submitted_projects add column if not exists discipline  text;
alter table public.submitted_projects add column if not exists is_challenge boolean not null default false;
alter table public.submitted_projects add column if not exists is_public   boolean not null default true;

alter table public.saved_briefs add column if not exists discipline text;
alter table public.saved_briefs add column if not exists brief_data jsonb;

-- Force PostgREST to pick up the new columns immediately instead of
-- waiting for its next automatic schema cache refresh.
notify pgrst, 'reload schema';
