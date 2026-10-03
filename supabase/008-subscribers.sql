-- The VIRI edit mailing list.
--
-- Addresses are collected here rather than sent straight to Resend, because
-- adding a contact to a Resend audience needs the secret API key and this site
-- is static — the key would be readable by anybody who opened the page, and
-- whoever took it could send mail as vitalityritual.org. Collect here, export
-- to Resend when there is actually something to send.
--
-- The policy below is the important part: anyone may add their own address and
-- NOBODY may read the table. An anon-readable subscriber list is a list anyone
-- can download. Read it in the Supabase dashboard, which runs as the owner.

create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text,
  created_at  timestamptz not null default now(),
  constraint subscribers_email_shape check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$')
);

-- One row per address. The insert upserts onto this, so subscribing twice is
-- not an error and does not duplicate anybody.
create unique index if not exists subscribers_email_key
  on public.subscribers (lower(email));

alter table public.subscribers enable row level security;

drop policy if exists "subscribers: anyone may join" on public.subscribers;
drop policy if exists "subscribers: nobody may read" on public.subscribers;

create policy "subscribers: anyone may join" on public.subscribers
  for insert to anon, authenticated
  with check (true);

-- Deliberately no SELECT, UPDATE or DELETE policy for anon or authenticated.
-- With RLS on and no policy, those are refused outright.

comment on table public.subscribers is
  'The VIRI edit list. Insert-only from the browser; read it in the dashboard. Export to Resend to send.';
