-- The Open Project — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT guards where possible).

-- ─── saved_briefs ──────────────────────────────────────────────────────────
-- One row per brief a user has saved to their workspace. The full brief
-- returned by Claude (title, client, industry, details, isChallenge, status,
-- categoryColor, etc.) is stored as-is in brief_data so the UI can read it
-- back without re-shaping.

create table if not exists public.saved_briefs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  discipline text,
  brief_data jsonb not null,
  saved_at   timestamptz not null default now()
);

-- In case this table already existed with an older/partial shape:
alter table public.saved_briefs add column if not exists discipline text;
alter table public.saved_briefs add column if not exists brief_data jsonb;

create index if not exists saved_briefs_user_id_idx on public.saved_briefs(user_id);

alter table public.saved_briefs enable row level security;

drop policy if exists "saved_briefs_select_own" on public.saved_briefs;
create policy "saved_briefs_select_own"
  on public.saved_briefs for select
  using (auth.uid() = user_id);

drop policy if exists "saved_briefs_insert_own" on public.saved_briefs;
create policy "saved_briefs_insert_own"
  on public.saved_briefs for insert
  with check (auth.uid() = user_id);

drop policy if exists "saved_briefs_delete_own" on public.saved_briefs;
create policy "saved_briefs_delete_own"
  on public.saved_briefs for delete
  using (auth.uid() = user_id);

-- ─── submitted_projects ────────────────────────────────────────────────────
-- One row per portfolio project. image_url is the cover image, images holds
-- any additional gallery images/PDFs (all Supabase Storage public URLs).
-- brief_data / meta store the richer nested objects the portfolio pages
-- render (brief.summary, brief.details, meta.client, meta.tools, etc.).

create table if not exists public.submitted_projects (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  discipline   text,
  description  text,
  image_url    text,
  images       text[] not null default '{}',
  brief_data   jsonb,
  meta         jsonb,
  folder_color text,
  is_challenge boolean not null default false,
  is_public    boolean not null default true,
  submitted_at timestamptz not null default now()
);

-- In case this table already existed with an older/partial shape:
alter table public.submitted_projects add column if not exists discipline   text;
alter table public.submitted_projects add column if not exists images       text[] not null default '{}';
alter table public.submitted_projects add column if not exists brief_data   jsonb;
alter table public.submitted_projects add column if not exists meta        jsonb;
alter table public.submitted_projects add column if not exists folder_color text;
alter table public.submitted_projects add column if not exists is_challenge boolean not null default false;
alter table public.submitted_projects add column if not exists is_public   boolean not null default true;

create index if not exists submitted_projects_user_id_idx on public.submitted_projects(user_id);

alter table public.submitted_projects enable row level security;

drop policy if exists "submitted_projects_select_own" on public.submitted_projects;
create policy "submitted_projects_select_own"
  on public.submitted_projects for select
  using (auth.uid() = user_id);

drop policy if exists "submitted_projects_select_public" on public.submitted_projects;
create policy "submitted_projects_select_public"
  on public.submitted_projects for select
  using (is_public = true);

drop policy if exists "submitted_projects_insert_own" on public.submitted_projects;
create policy "submitted_projects_insert_own"
  on public.submitted_projects for insert
  with check (auth.uid() = user_id);

drop policy if exists "submitted_projects_update_own" on public.submitted_projects;
create policy "submitted_projects_update_own"
  on public.submitted_projects for update
  using (auth.uid() = user_id);

drop policy if exists "submitted_projects_delete_own" on public.submitted_projects;
create policy "submitted_projects_delete_own"
  on public.submitted_projects for delete
  using (auth.uid() = user_id);

-- ─── Storage: portfolio images ─────────────────────────────────────────────
-- Public-read bucket. Uploads/updates/deletes are restricted to files under
-- the authenticated user's own folder: portfolio-images/<user_id>/...

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

drop policy if exists "portfolio_images_public_read" on storage.objects;
create policy "portfolio_images_public_read"
  on storage.objects for select
  using (bucket_id = 'portfolio-images');

drop policy if exists "portfolio_images_insert_own_folder" on storage.objects;
create policy "portfolio_images_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "portfolio_images_update_own_folder" on storage.objects;
create policy "portfolio_images_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "portfolio_images_delete_own_folder" on storage.objects;
create policy "portfolio_images_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Force PostgREST to pick up any newly added columns immediately instead
-- of waiting for its next automatic schema cache refresh.
notify pgrst, 'reload schema';
