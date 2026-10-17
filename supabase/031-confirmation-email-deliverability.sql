-- 031 — a confirmation email iCloud will accept.
--
-- iCloud bounced the confirmation email with "554 5.7.1 [HM08] Message rejected
-- due to local policy" (content rejected), while Gmail delivered it. The old
-- email was one line, an all-caps button and a long tokened link, which reads as
-- bulk mail from a new sender. This one reads like a short personal note: plain
-- link written out, a reply-to that reaches a real inbox, who sent it and why,
-- and the postal address. Same function as 030 otherwise; safe to run again.

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
      'reply_to', 'info@vitalityritual.org',
      'to', jsonb_build_array(sub.email),
      'subject', 'Please confirm your email for the VIRI Edit',
      'text', 'Hi,' || chr(10) || chr(10)
              || 'Thanks for signing up for the VIRI Edit, a weekly email from VIRI that arrives on Sundays.' || chr(10) || chr(10)
              || 'To finish signing up, open this link:' || chr(10)
              || link || chr(10) || chr(10)
              || 'If you didn''t sign up, you can ignore this email and you won''t hear from us again.' || chr(10) || chr(10)
              || 'Margaret' || chr(10)
              || 'VIRI, vitalityritual.org' || chr(10)
              || '300 K St NW, Washington, DC 20001',
      'html', '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:16px;line-height:1.6;color:#3b322a;max-width:520px;margin:0 auto;padding:24px">'
              || '<p>Hi,</p>'
              || '<p>Thanks for signing up for the VIRI Edit, a weekly email from VIRI that arrives on Sundays.</p>'
              || '<p>To finish signing up, <a href="' || link || '" style="color:#5a4433">confirm your email address</a>.</p>'
              || '<p style="font-size:14px;color:#6b5f54">If the link doesn''t work, copy this into your browser:<br>' || link || '</p>'
              || '<p>If you didn''t sign up, you can ignore this email and you won''t hear from us again.</p>'
              || '<p>Margaret<br>VIRI, <a href="https://vitalityritual.org" style="color:#5a4433">vitalityritual.org</a></p>'
              || '<p style="font-size:12px;color:#8a7d70">300 K St NW, Washington, DC 20001</p></div>'
    )
  );
  update public.subscribers set confirm_sent_at = now() where id = sub.id;
end $$;

revoke all on function public.subscribe(text, text) from public;
grant execute on function public.subscribe(text, text) to anon, authenticated;
