-- 032 — no confirmation step for the VIRI Edit.
--
-- Margaret's decision, 17 Oct 2026: signing up adds you to the list straight
-- away, like most newsletters. subscribe() now records the address as
-- confirmed and sends nothing; the first email anyone gets is the next issue,
-- whose unsubscribe link is the way off the list.
--
-- Addresses that signed up but never confirmed (for example the iCloud ones whose
-- confirmation email bounced) are counted as subscribed too, since they asked.
--
-- confirm_subscription() and the token columns stay, so an old confirmation
-- link that is clicked later still works. Safe to run more than once.

create or replace function public.subscribe(p_email text, p_source text default 'site')
returns void language plpgsql security definer set search_path = ''
as $$
declare
  addr text := lower(btrim(coalesce(p_email, '')));
begin
  if addr !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' or length(addr) > 254 then
    raise exception 'Please enter a valid email address.' using errcode = '22023';
  end if;

  insert into public.subscribers (email, source, confirmed_at)
  values (addr, left(coalesce(p_source, 'site'), 40), now())
  on conflict ((lower(email))) do update
    set confirmed_at = coalesce(public.subscribers.confirmed_at, now());
end $$;

revoke all on function public.subscribe(text, text) from public;
grant execute on function public.subscribe(text, text) to anon, authenticated;

update public.subscribers set confirmed_at = coalesce(confirm_sent_at, created_at, now())
where confirmed_at is null;
