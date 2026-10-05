-- 021 — "confirm your email" for The VIRI Edit.
--
-- Anyone could put anyone's address on the list. Now the browser calls
-- subscribe(), which records the address and has the database send a
-- confirmation email through Resend; only addresses whose link was clicked
-- have confirmed_at set, and only those should be sent the newsletter.
--
-- The Resend key never reaches the website. It lives in Supabase's encrypted
-- Vault under the name 'resend_api_key' and only these functions read it.
-- Store it once, yourself, in the SQL editor (it is not in this file):
--     select vault.create_secret('re_…your key…', 'resend_api_key');
-- Until it is stored, sign-ups are still recorded; the email is simply not sent.
--
-- Limits, so the form cannot be used to send mail to strangers: one email per
-- address every 10 minutes, and at most 60 confirmation emails an hour overall.
-- Whether an address is new, waiting or already confirmed is never revealed.
--
-- Safe to run more than once.

create extension if not exists pg_net;

alter table public.subscribers add column if not exists confirm_token   uuid not null default gen_random_uuid();
alter table public.subscribers add column if not exists confirmed_at    timestamptz;
alter table public.subscribers add column if not exists confirm_sent_at timestamptz;
create unique index if not exists subscribers_confirm_token_key on public.subscribers (confirm_token);

-- the browser no longer writes to the table directly; it goes through subscribe()
drop policy if exists "subscribers: anyone may join" on public.subscribers;

create or replace function public.subscribe(p_email text, p_source text default 'site')
returns void language plpgsql security definer set search_path = ''
as $$
declare
  addr   text := lower(btrim(coalesce(p_email, '')));
  sub    public.subscribers;
  apikey text;
  recent int;
  link   text;
begin
  if addr !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' or length(addr) > 254 then
    raise exception 'Please enter a valid email address.' using errcode = '22023';
  end if;

  insert into public.subscribers (email, source)
  values (addr, left(coalesce(p_source, 'site'), 40))
  on conflict ((lower(email))) do nothing;

  select * into sub from public.subscribers where lower(email) = addr;
  if sub.confirmed_at is not null then return; end if;
  if sub.confirm_sent_at is not null and sub.confirm_sent_at > now() - interval '10 minutes' then return; end if;
  select count(*) into recent from public.subscribers where confirm_sent_at > now() - interval '1 hour';
  if recent >= 60 then return; end if;

  select decrypted_secret into apikey from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  if apikey is null then return; end if;

  link := 'https://vitalityritual.org/#/confirm-subscription/' || sub.confirm_token::text;
  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || apikey, 'Content-Type', 'application/json'),
    body    := jsonb_build_object(
      'from', 'The VIRI Edit <read@vitalityritual.org>',
      'to', jsonb_build_array(sub.email),
      'subject', 'Confirm your subscription to The VIRI Edit',
      'text', 'Please confirm you would like The VIRI Edit, a monthly letter from VIRI:' || chr(10) || chr(10)
              || link || chr(10) || chr(10)
              || 'If you did not ask for this, ignore this email and you will not hear from us.',
      'html', '<div style="font-family:Georgia,serif;color:#3b322a;max-width:520px;margin:0 auto;padding:24px">'
              || '<p style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#8a7d70">The VIRI Edit</p>'
              || '<p style="font-size:18px;line-height:1.5">Please confirm you would like The VIRI Edit, a monthly letter from VIRI.</p>'
              || '<p style="margin:28px 0"><a href="' || link || '" style="background:#7a6656;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:.12em;text-transform:uppercase">Confirm my subscription</a></p>'
              || '<p style="font-size:14px;line-height:1.6;color:#8a7d70">If you did not ask for this, ignore this email and you will not hear from us.</p></div>'
    )
  );
  update public.subscribers set confirm_sent_at = now() where id = sub.id;
end $$;

create or replace function public.confirm_subscription(p_token uuid)
returns boolean language sql security definer set search_path = ''
as $$
  with done as (
    update public.subscribers set confirmed_at = coalesce(confirmed_at, now())
    where confirm_token = p_token
    returning 1
  )
  select exists (select 1 from done);
$$;

revoke all on function public.subscribe(text, text) from public;
revoke all on function public.confirm_subscription(uuid) from public;
grant execute on function public.subscribe(text, text) to anon, authenticated;
grant execute on function public.confirm_subscription(uuid) to anon, authenticated;

comment on table public.subscribers is
  'The VIRI Edit list. Written only by subscribe(); read it in the dashboard. Send only to rows with confirmed_at set.';
