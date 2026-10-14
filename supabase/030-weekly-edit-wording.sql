-- 030 — The VIRI Edit is weekly now.
--
-- The confirmation email still called it "a monthly letter". This is the same
-- function as 021 with only that wording changed. Safe to run more than once.

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
      'text', 'Please confirm you would like The VIRI Edit, a weekly email from VIRI, every Sunday:' || chr(10) || chr(10)
              || link || chr(10) || chr(10)
              || 'If you did not ask for this, ignore this email and you will not hear from us.',
      'html', '<div style="font-family:Georgia,serif;color:#3b322a;max-width:520px;margin:0 auto;padding:24px">'
              || '<p style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#8a7d70">The VIRI Edit</p>'
              || '<p style="font-size:18px;line-height:1.5">Please confirm you would like The VIRI Edit, a weekly email from VIRI, every Sunday.</p>'
              || '<p style="margin:28px 0"><a href="' || link || '" style="background:#7a6656;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:.12em;text-transform:uppercase">Confirm my subscription</a></p>'
              || '<p style="font-size:14px;line-height:1.6;color:#8a7d70">If you did not ask for this, ignore this email and you will not hear from us.</p></div>'
    )
  );
  update public.subscribers set confirm_sent_at = now() where id = sub.id;
end $$;

revoke all on function public.subscribe(text, text) from public;
grant execute on function public.subscribe(text, text) to anon, authenticated;
