-- Record ideas guests submit at the party.
-- Run this once in the Supabase SQL editor.

create table if not exists public.record_ideas (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  guest_name text not null check (char_length(guest_name) between 1 and 40),
  title text not null check (char_length(title) between 4 and 90),
  measure text not null check (measure in ('most', 'fastest', 'longest')),
  unit text not null default '' check (char_length(unit) <= 30),
  time_limit_seconds int check (time_limit_seconds in (30, 60, 180)),
  target numeric,
  description text not null default '' check (char_length(description) <= 400)
);

alter table public.record_ideas enable row level security;

-- Guests can add ideas and read the party book. Nobody can edit or delete from the app.
create policy "guests can add ideas" on public.record_ideas for insert to anon with check (true);
create policy "guests can read ideas" on public.record_ideas for select to anon using (true);
