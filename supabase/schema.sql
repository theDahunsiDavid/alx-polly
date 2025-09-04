-- Schema for Polling App (Supabase Postgres)
-- Tables: profiles, polls, poll_options, votes
-- Includes: constraints, indexes, RLS, and updated_at trigger

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Helper: updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Profiles table (mirror Supabase auth.users basic fields for convenience)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function set_updated_at();

alter table public.profiles enable row level security;

-- RLS: users can select their own profile; public read not necessary
drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Polls
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_by uuid not null references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  allow_multiple_votes boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger polls_set_updated_at
  before update on public.polls
  for each row execute function set_updated_at();

alter table public.polls enable row level security;

-- RLS policies for polls
-- Public can read active polls
drop policy if exists "Public can read active polls" on public.polls;
create policy "Public can read active polls"
  on public.polls for select
  using (
    is_active = true and (expires_at is null or expires_at > now())
  );

-- Owners can read their own polls regardless of status
drop policy if exists "Owners can read their polls" on public.polls;
create policy "Owners can read their polls"
  on public.polls for select
  using (auth.uid() = created_by);

-- Authenticated users can create polls
drop policy if exists "Users can create polls" on public.polls;
create policy "Users can create polls"
  on public.polls for insert
  with check (auth.uid() = created_by);

-- Owners can update/delete their polls
drop policy if exists "Owners can modify polls" on public.polls;
create policy "Owners can modify polls"
  on public.polls for update using (auth.uid() = created_by) with check (auth.uid() = created_by);

drop policy if exists "Owners can delete polls" on public.polls;
create policy "Owners can delete polls"
  on public.polls for delete using (auth.uid() = created_by);

-- Poll Options
create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  text text not null,
  vote_count integer not null default 0, -- cached counter, updated via trigger
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (poll_id, text)
);
create trigger poll_options_set_updated_at
  before update on public.poll_options
  for each row execute function set_updated_at();

alter table public.poll_options enable row level security;

-- RLS: Read options of readable polls; owners can manage
drop policy if exists "Public can read options of readable polls" on public.poll_options;
create policy "Public can read options of readable polls"
  on public.poll_options for select
  using (
    exists (
      select 1 from public.polls p
      where p.id = poll_id
        and (
          (p.is_active = true and (p.expires_at is null or p.expires_at > now()))
          or p.created_by = auth.uid()
        )
    )
  );

drop policy if exists "Owners can insert options" on public.poll_options;
create policy "Owners can insert options"
  on public.poll_options for insert
  with check (
    exists (
      select 1 from public.polls p
      where p.id = poll_id and p.created_by = auth.uid()
    )
  );

drop policy if exists "Owners can update/delete options" on public.poll_options;
create policy "Owners can update/delete options"
  on public.poll_options for update using (
    exists (select 1 from public.polls p where p.id = poll_id and p.created_by = auth.uid())
  ) with check (
    exists (select 1 from public.polls p where p.id = poll_id and p.created_by = auth.uid())
  );

drop policy if exists "Owners can delete options" on public.poll_options;
create policy "Owners can delete options"
  on public.poll_options for delete using (
    exists (select 1 from public.polls p where p.id = poll_id and p.created_by = auth.uid())
  );

-- Votes
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, option_id, user_id)
);

alter table public.votes enable row level security;

-- Enforce single-vote vs multi-vote per poll using constraint trigger
create or replace function check_vote_rules()
returns trigger as $$
declare
  allow_multi boolean;
begin
  select allow_multiple_votes into allow_multi from public.polls where id = new.poll_id;
  if allow_multi is null then
    raise exception 'Poll not found';
  end if;
  if allow_multi = false then
    if exists (
      select 1 from public.votes v
      where v.poll_id = new.poll_id and v.user_id = new.user_id
    ) then
      raise exception 'Multiple votes are not allowed for this poll';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists votes_check_vote_rules on public.votes;
create trigger votes_check_vote_rules
  before insert on public.votes
  for each row execute function check_vote_rules();

-- Maintain cached vote_count on poll_options
create or replace function increment_option_vote_count()
returns trigger as $$
begin
  update public.poll_options set vote_count = vote_count + 1, updated_at = now() where id = new.option_id;
  return new;
end;
$$ language plpgsql;

create or replace function decrement_option_vote_count()
returns trigger as $$
begin
  update public.poll_options set vote_count = greatest(vote_count - 1, 0), updated_at = now() where id = old.option_id;
  return old;
end;
$$ language plpgsql;

drop trigger if exists votes_after_insert on public.votes;
create trigger votes_after_insert
  after insert on public.votes
  for each row execute function increment_option_vote_count();

drop trigger if exists votes_after_delete on public.votes;
create trigger votes_after_delete
  after delete on public.votes
  for each row execute function decrement_option_vote_count();

-- RLS for votes
drop policy if exists "Users can create votes on active polls" on public.votes;
create policy "Users can create votes on active polls"
  on public.votes for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.polls p
      where p.id = poll_id
        and p.is_active = true
        and (p.expires_at is null or p.expires_at > now())
    ) and
    exists (
      select 1 from public.poll_options o
      where o.id = option_id and o.poll_id = poll_id
    )
  );

drop policy if exists "Users can read their own votes" on public.votes;
create policy "Users can read their own votes"
  on public.votes for select
  using (auth.uid() = user_id);

-- Owners can view aggregated votes via options and polls policies. Direct select on votes is restricted to voter.

-- Indexes
create index if not exists idx_polls_created_by on public.polls(created_by);
create index if not exists idx_polls_is_active_expires on public.polls(is_active, expires_at);
create index if not exists idx_poll_options_poll_id on public.poll_options(poll_id);
create index if not exists idx_votes_poll_id_user_id on public.votes(poll_id, user_id);
create index if not exists idx_votes_option_id on public.votes(option_id);
