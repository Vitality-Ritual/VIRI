-- 033 — email people their VIRI Winter Arc.
--
-- After someone builds a plan on #/read/winter-arc-planner and enters their
-- email, the site calls send_winter_arc(). It sends one email through Resend
-- (same Vault key and pg_net call as the old confirmation email, 031).
--
-- The site sends only WHICH goals were picked (ids), never wording. The email is
-- built here from the arc_goals table, so this cannot be used to send someone
-- arbitrary text from read@vitalityritual.org. The one free-text part, a
-- "Something else" goal, is cut to 60 characters, stripped of anything that
-- looks like a web address, and escaped.
--
-- Limits: the address must already be on the subscribers list (the planner
-- subscribes it first); at most one email per address every 2 minutes and 3 a
-- day; at most 100 an hour overall (Resend's free plan allows 100 a day).
--
-- The wording in arc_goals is generated from app.js by tools/arc-seed.rb, so
-- the email and the page always say the same thing. When the wording changes,
-- regenerate and run only the part below "SEED".
--
-- Safe to run more than once.

create table if not exists public.arc_areas (
  id    text primary key,
  label text not null,
  sort  int  not null
);
create table if not exists public.arc_goals (
  area       text not null references public.arc_areas(id) on delete cascade,
  id         text not null,
  label      text not null,
  adj        text,
  phrase     text not null,
  workout    text,
  daily      text,
  block_day  int,
  block_b    text,
  block_i    text,
  block_t    boolean not null default false,
  habit      text not null,
  gentle     text not null,
  ambitious  text not null,
  ms1        text not null,
  ms2        text not null,
  ms3        text not null,
  sort       int  not null,
  primary key (area, id)
);
create table if not exists public.arc_emails (
  id      bigint generated always as identity primary key,
  email   text not null,
  sent_at timestamptz not null default now()
);
create index if not exists arc_emails_email_idx on public.arc_emails (lower(email), sent_at);

-- Read only by send_winter_arc(), which runs as its owner. No policies and no
-- grants: nobody can read or change these tables from the browser.
alter table public.arc_areas  enable row level security;
alter table public.arc_goals  enable row level security;
alter table public.arc_emails enable row level security;
revoke all on public.arc_areas, public.arc_goals, public.arc_emails from anon, authenticated;

create or replace function public.arc_esc(t text)
returns text language sql immutable set search_path = ''
as $$ select replace(replace(replace(replace(coalesce(t,''),'&','&amp;'),'<','&lt;'),'>','&gt;'),'"','&quot;') $$;

create or replace function public.send_winter_arc(p_email text, p_plan jsonb)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare
  addr     text := lower(btrim(coalesce(p_email, '')));
  apikey   text;
  v_days   int  := coalesce((p_plan->>'days')::int, 0);
  v_time   text := p_plan->>'time';
  v_style  text := p_plan->>'style';
  v_end    text := p_plan->>'end';
  start_d  date;
  end_d    date;
  weeks    int;
  amb      boolean;
  wt text; bt text; bed text;
  a text; gid text; n int;
  ctext    text;
  g        public.arc_goals;
  prim     public.arc_goals[] := '{}';
  sec      public.arc_goals[] := '{}';
  allg     public.arc_goals[];
  fit      public.arc_goals[] := '{}';
  area_ids text[] := '{}';
  area_lbl text[] := '{}';
  wdays    int[];
  v_fit    boolean;
  items    text[] := array['','','','','','',''];
  txt_items text[] := array['','','','','','',''];
  moved    boolean[] := array[false,false,false,false,false,false,false];
  dnames   text[] := array['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  i int; di int; lbl text; sub text;
  daily_h  text := ''; daily_t text := '';
  habits_h text := ''; habits_t text := ''; hcount int := 0;
  months   date[] := '{}'; m date; mi int; nm int; msidx int; mtxt text;
  months_h text := ''; months_t text := '';
  adjs     text[] := '{}'; line text;
  week_h   text := ''; week_t text := '';
  defaults text[][] := array[['Take a 10-minute walk daily','Fresh air, no phone.'],
                             ['Plan your week on Sunday','Fifteen minutes with your calendar.'],
                             ['Drink water before coffee','One full glass, first thing.']];
  mname    text;
  range_t  text;
  next_year int;
  html text; plain text;
  link text := 'https://vitalityritual.org/#/read/winter-arc-planner';
  serif text := 'font-family:Georgia,''Times New Roman'',serif;';
  muted text := 'color:#665a4e;';
begin
  -- who and how often
  if addr !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' or length(addr) > 254 then
    raise exception 'Please enter a valid email address.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.subscribers where lower(email) = addr) then return false; end if;
  if exists (select 1 from public.arc_emails where lower(email) = addr and sent_at > now() - interval '2 minutes') then return false; end if;
  if (select count(*) from public.arc_emails where lower(email) = addr and sent_at > now() - interval '1 day') >= 3 then return false; end if;
  if (select count(*) from public.arc_emails where sent_at > now() - interval '1 hour') >= 100 then return false; end if;

  -- the answers
  if v_time not in ('morning','evening') or v_style not in ('gentle','ambitious')
     or v_end not in ('dec','jan') then return false; end if;
  begin start_d := (p_plan->>'start')::date; exception when others then return false; end;
  if start_d is null or start_d < current_date - 2 or start_d > current_date + 9 then return false; end if;
  amb := v_style = 'ambitious';
  end_d := case when v_end = 'jan'
                then make_date(extract(year from start_d)::int + case when extract(month from start_d) = 1 then 0 else 1 end, 1, 31)
                else make_date(extract(year from start_d)::int, 12, 31) end;
  weeks := greatest(1, ceil((end_d - start_d) / 7.0)::int);
  next_year := case when extract(month from end_d) = 1 then extract(year from end_d)::int else extract(year from end_d)::int + 1 end;
  wt  := case when v_time = 'morning' then '6:30 am' else '6:00 pm' end;
  bt  := case when v_time = 'morning' then '7:30 am' else '7:30 pm' end;
  bed := case when v_time = 'morning' then '9:30' else '10:30' end;

  -- the goals, in the order they were picked: each category's first goal, then the second ones
  for a in select value from jsonb_array_elements_text(coalesce(p_plan->'areas','[]'::jsonb)) with ordinality order by ordinality loop
    if a = any(area_ids) or not exists (select 1 from public.arc_areas where id = a) then continue; end if;
    area_ids := area_ids || a;
    area_lbl := area_lbl || (select label from public.arc_areas where id = a);
    n := 0;
    for gid in select value from jsonb_array_elements_text(coalesce(p_plan->'goals'->a,'[]'::jsonb)) with ordinality order by ordinality loop
      exit when n >= 2;
      g := null;
      if gid = 'custom' then
        ctext := left(btrim(coalesce(p_plan->'custom'->>a, '')), 60);
        ctext := btrim(regexp_replace(regexp_replace(ctext, '\S*(\.|://|@)\S+', '', 'g'), '[[:cntrl:]]', '', 'g'));
        if ctext = '' then continue; end if;
        ctext := public.arc_esc(ctext);
        g.area := a; g.id := 'custom'; g.label := ctext; g.adj := null; g.phrase := 'closer to “' || ctext || '”';
        g.habit := 'Make time for “' || ctext || '”'; g.gentle := 'One small step every week.'; g.ambitious := 'Two focused sessions a week, tracked.';
        g.ms1 := 'Decide what “done” looks like'; g.ms2 := 'Reach the halfway point'; g.ms3 := 'Finish strong'; g.block_t := false;
        if a = 'fitness' then g.workout := ctext;
        elsif a = 'sleep' then g.daily := ctext;
        else g.block_day := case a when 'career' then 1 when 'side' then 5 when 'learning' then 3 when 'relationships' then 4 else 6 end;
             g.block_b := ctext; g.block_i := 'your own goal';
        end if;
      else
        select * into g from public.arc_goals where area = a and id = gid;
        if g.id is null then continue; end if;
      end if;
      if n = 0 then prim := prim || g; else sec := sec || g; end if;
      n := n + 1;
    end loop;
  end loop;
  allg := prim || sec;
  if coalesce(array_length(allg, 1), 0) = 0 then return false; end if;
  -- workouts only when Fitness is one of the picked categories
  v_fit := 'fitness' = any(area_ids);
  if v_fit and v_days not between 2 and 6 then return false; end if;

  -- the one-line summary: first three categories
  for i in 1 .. least(3, array_length(prim, 1)) - 1 loop
    if (prim[i]).adj is not null and not ((prim[i]).adj = any(adjs)) then adjs := adjs || (prim[i]).adj; end if;
  end loop;
  line := (prim[least(3, array_length(prim, 1))]).phrase;
  if array_length(adjs, 1) = 1 then line := adjs[1] || ' and ' || line;
  elsif array_length(adjs, 1) > 1 then line := array_to_string(adjs, ', ') || ', and ' || line; end if;
  line := upper(left(line, 1)) || substr(line, 2);
  line := case when right(line, 1) = '”' then left(line, -1) || '.”' else line || '.' end;

  -- the week
  wdays := case v_days when 2 then array[1,5] when 3 then array[0,2,5] when 4 then array[0,1,3,5]
                        when 5 then array[0,1,3,4,5] else array[0,1,2,3,4,5] end;
  foreach g in array allg loop if g.workout is not null then fit := fit || g; end if; end loop;
  for i in 1 .. case when v_fit then array_length(wdays, 1) else 0 end loop
    di := wdays[i] + 1;
    if coalesce(array_length(fit, 1), 0) > 0 then
      lbl := (fit[((i - 1) % array_length(fit, 1)) + 1]).workout; sub := wt || ' · ' || case when amb then '45 min' else '30 min' end;
    else lbl := 'Move'; sub := wt || ' · walk, class or ride'; end if;
    items[di] := items[di] || '<b>' || lbl || '</b> <span style="' || muted || '">' || sub || '</span><br>';
    txt_items[di] := txt_items[di] || lbl || ' (' || sub || '); ';
    moved[di] := true;
  end loop;
  foreach g in array allg loop
    if g.block_day is not null then
      di := g.block_day + 1;
      sub := case when g.block_t then bt || ' · ' else '' end || g.block_i;
      items[di] := items[di] || '<b>' || g.block_b || '</b> <span style="' || muted || '">' || sub || '</span><br>';
      txt_items[di] := txt_items[di] || g.block_b || ' (' || sub || '); ';
    end if;
    if g.daily is not null then
      daily_h := daily_h || case when daily_h = '' then '' else ' · ' end || replace(g.daily, '{bed}', bed);
      daily_t := daily_t || case when daily_t = '' then '' else '; ' end || replace(g.daily, '{bed}', bed);
    end if;
  end loop;
  items[7] := items[7] || '<b>Plan the week</b> <span style="' || muted || '">15 min with your calendar</span><br>';
  txt_items[7] := txt_items[7] || 'Plan the week (15 min with your calendar); ';
  for di in 1 .. 7 loop
    if v_fit and not moved[di] then
      items[di] := '<b style="font-weight:normal;' || muted || '">Rest</b> <span style="' || muted || '">stretch + walk</span><br>' || items[di];
      txt_items[di] := 'Rest (stretch + walk); ' || txt_items[di];
    elsif not v_fit and items[di] = '' then
      items[di] := '<b style="font-weight:normal;' || muted || '">Free</b> <span style="' || muted || '">nothing planned</span><br>';
      txt_items[di] := 'Free (nothing planned); ';
    end if;
    week_h := week_h || '<tr><td style="padding:9px 14px 9px 0;vertical-align:top;font-size:11px;letter-spacing:2px;text-transform:uppercase;' || muted
              || 'border-top:1px solid #d6cec2;width:44px">' || dnames[di] || '</td><td style="padding:9px 0;border-top:1px solid #d6cec2;font-size:14px;line-height:1.55">'
              || items[di] || '</td></tr>';
    week_t := week_t || dnames[di] || ': ' || rtrim(txt_items[di], '; ') || chr(10);
  end loop;

  -- three anchor habits
  foreach g in array allg loop
    exit when hcount >= 3;
    habits_h := habits_h || '<li style="margin:0 0 10px"><b>' || g.habit || '</b><br><span style="' || muted || '">' || case when amb then g.ambitious else g.gentle end || '</span></li>';
    habits_t := habits_t || '- ' || g.habit || ': ' || case when amb then g.ambitious else g.gentle end || chr(10);
    hcount := hcount + 1;
  end loop;
  i := 1;
  while hcount < 3 loop
    habits_h := habits_h || '<li style="margin:0 0 10px"><b>' || defaults[i][1] || '</b><br><span style="' || muted || '">' || defaults[i][2] || '</span></li>';
    habits_t := habits_t || '- ' || defaults[i][1] || ': ' || defaults[i][2] || chr(10);
    hcount := hcount + 1; i := i + 1;
  end loop;

  -- month by month
  m := date_trunc('month', start_d)::date;
  while m <= end_d loop months := months || m; m := (m + interval '1 month')::date; end loop;
  nm := array_length(months, 1);
  for mi in 0 .. nm - 1 loop
    mname := trim(to_char(months[mi + 1], 'FMMonth'));
    msidx := case when nm = 1 then 3 when nm = 2 then case when mi = 0 then 1 else 3 end else least(mi + 1, 3) end;
    months_h := months_h || '<p style="margin:14px 0 4px;' || serif || 'font-size:17px;color:#5a4433">' || mname || '</p><ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.6">';
    months_t := months_t || mname || chr(10);
    foreach g in array allg loop
      mtxt := case msidx when 1 then g.ms1 when 2 then g.ms2 else g.ms3 end;
      months_h := months_h || '<li>' || mtxt || '</li>';
      months_t := months_t || '- ' || mtxt || chr(10);
    end loop;
    months_h := months_h || '</ul>';
  end loop;

  range_t := to_char(start_d, 'FMMon FMDD') || ' – ' || to_char(end_d, 'FMMon FMDD, YYYY');

  html := '<div style="background:#e9e4dc;padding:24px 12px"><div style="max-width:600px;margin:0 auto;background:#fbf9f5;border:1px solid #d6cec2;padding:32px 26px;color:#3b322a;font-family:Arial,Helvetica,sans-serif">'
    || '<p style="margin:0 0 6px;text-align:center;font-size:10px;letter-spacing:3px;text-transform:uppercase;' || muted || '">' || range_t || ' · ' || weeks || ' weeks</p>'
    || '<p style="margin:0 0 10px;text-align:center;' || serif || 'font-size:30px;font-style:italic;color:#7d6d60">Your Winter Arc</p>'
    || '<p style="margin:0 0 8px;text-align:center;' || serif || 'font-size:22px;font-style:italic;line-height:1.35;color:#5a4433">' || line || '</p>'
    || '<p style="margin:0 0 26px;text-align:center;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;' || muted || '">' || array_to_string(area_lbl, ' · ') || ' · ' || initcap(v_style) || case when v_fit then ' · ' || v_days || ' workouts a week' else '' end || '</p>'
    || '<p style="margin:0 0 8px;' || serif || 'font-size:19px;color:#5a4433">Your weekly rhythm</p>'
    || case when daily_h = '' then '' else '<p style="margin:0 0 10px;padding:9px 12px;background:#f1ede6;font-size:14px"><span style="font-size:10px;letter-spacing:2px;text-transform:uppercase;' || muted || '">Every day</span>&nbsp; ' || daily_h || '</p>' end
    || '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 26px">' || week_h || '</table>'
    || '<p style="margin:0 0 10px;' || serif || 'font-size:19px;color:#5a4433">Three anchor habits</p>'
    || '<ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.5">' || habits_h || '</ul>'
    || '<p style="margin:0;' || serif || 'font-size:19px;color:#5a4433">Month by month</p>' || months_h
    || '<div style="margin:28px 0 0;padding:20px;background:#7d6d60;color:#fbf9f5">'
    || '<p style="margin:0 0 6px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#f4efe8">Closing ritual · ' || trim(to_char(end_d, 'FMMonth FMDD')) || '</p>'
    || '<p style="margin:0 0 8px;' || serif || 'font-size:19px">Close the arc on purpose.</p>'
    || '<p style="margin:0 0 8px;font-size:14px;line-height:1.6">Set aside thirty minutes on the last day. Bring this plan and answer three questions:</p>'
    || '<ol style="margin:0;padding-left:20px;font-size:14px;line-height:1.6"><li>What am I proudest of from these ' || weeks || ' weeks?</li><li>Which habit do I want to carry into ' || next_year || '?</li><li>What do I want my next arc to be about?</li></ol></div>'
    || '<p style="margin:26px 0 0;text-align:center"><a href="' || link || '" style="display:inline-block;padding:13px 24px;background:#5a4433;color:#fbf9f5;text-decoration:none;font-size:11px;letter-spacing:2.5px;text-transform:uppercase">Open your plan on VIRI</a></p>'
    || '<p style="margin:26px 0 0;font-size:13px;line-height:1.6;' || muted || '">You’re getting this because you built a Winter Arc on vitalityritual.org. You’ll also get The VIRI Edit on Sundays; every issue has an unsubscribe link.</p>'
    || '<p style="margin:10px 0 0;font-size:12px;color:#8a7d70">VIRI · 300 K St NW, Washington, DC 20001</p>'
    || '</div></div>';

  plain := 'Your VIRI Winter Arc' || chr(10) || range_t || ' · ' || weeks || ' weeks' || chr(10) || chr(10)
    || line || chr(10) || chr(10)
    || 'YOUR WEEKLY RHYTHM' || chr(10) || case when daily_t = '' then '' else 'Every day: ' || daily_t || chr(10) end || week_t || chr(10)
    || 'THREE ANCHOR HABITS' || chr(10) || habits_t || chr(10)
    || 'MONTH BY MONTH' || chr(10) || months_t || chr(10)
    || 'CLOSING RITUAL (' || trim(to_char(end_d, 'FMMonth FMDD')) || ')' || chr(10)
    || '1. What am I proudest of from these ' || weeks || ' weeks?' || chr(10)
    || '2. Which habit do I want to carry into ' || next_year || '?' || chr(10)
    || '3. What do I want my next arc to be about?' || chr(10) || chr(10)
    || 'Open your plan on VIRI: ' || link || chr(10) || chr(10)
    || 'VIRI · 300 K St NW, Washington, DC 20001';
  plain := replace(replace(replace(replace(plain, '&amp;', '&'), '&lt;', '<'), '&gt;', '>'), '&quot;', '"');

  select decrypted_secret into apikey from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  if apikey is null then return false; end if;
  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization', 'Bearer ' || apikey, 'Content-Type', 'application/json'),
    body    := jsonb_build_object(
      'from', 'The VIRI Edit <read@vitalityritual.org>',
      'reply_to', 'info@vitalityritual.org',
      'to', jsonb_build_array(addr),
      'subject', 'Your VIRI Winter Arc',
      'html', html,
      'text', plain));
  insert into public.arc_emails (email) values (addr);
  return true;
end $$;

revoke all on function public.send_winter_arc(text, jsonb) from public;
grant execute on function public.send_winter_arc(text, jsonb) to anon, authenticated;
revoke all on function public.arc_esc(text) from public, anon, authenticated;

-- SEED (generated by tools/arc-seed.rb from app.js; do not edit by hand)
begin;
insert into public.arc_areas (id, label, sort) values ('fitness', 'Fitness', 0) on conflict (id) do update set label = excluded.label, sort = excluded.sort;
insert into public.arc_areas (id, label, sort) values ('career', 'Career', 1) on conflict (id) do update set label = excluded.label, sort = excluded.sort;
insert into public.arc_areas (id, label, sort) values ('side', 'Side Project', 2) on conflict (id) do update set label = excluded.label, sort = excluded.sort;
insert into public.arc_areas (id, label, sort) values ('nutrition', 'Nutrition', 3) on conflict (id) do update set label = excluded.label, sort = excluded.sort;
insert into public.arc_areas (id, label, sort) values ('sleep', 'Sleep & Recovery', 4) on conflict (id) do update set label = excluded.label, sort = excluded.sort;
insert into public.arc_areas (id, label, sort) values ('mental', 'Mental Health', 5) on conflict (id) do update set label = excluded.label, sort = excluded.sort;
insert into public.arc_areas (id, label, sort) values ('learning', 'Reading & Learning', 6) on conflict (id) do update set label = excluded.label, sort = excluded.sort;
insert into public.arc_areas (id, label, sort) values ('relationships', 'Relationships', 7) on conflict (id) do update set label = excluded.label, sort = excluded.sort;
insert into public.arc_areas (id, label, sort) values ('money', 'Money', 8) on conflict (id) do update set label = excluded.label, sort = excluded.sort;
delete from public.arc_goals;
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('fitness', 'consistent', 'Stay consistent', 'more consistent', 'showing up every week', 'Workout', null, null, null, null, false, 'Never miss twice in a row', 'A short workout beats a skipped one.', 'Hit every planned workout and track your streak.', 'Track every workout for a month', 'Get through the holidays without a two-week gap', 'Your longest streak yet', 0);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('fitness', 'routine', 'Build a workout routine', 'more structured', 'in a real workout routine', 'Workout', null, null, null, null, false, 'Work out on your scheduled days', 'Twenty minutes counts.', 'Every scheduled workout, and never skip twice in a row.', 'Two weeks without skipping', 'Build each session to 45 minutes', 'Exercise feels like part of your week', 1);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('fitness', 'strong', 'Get stronger', 'stronger', 'stronger than in September', 'Strength', null, null, null, null, false, 'Lift on your scheduled days', 'A simple full-body routine, 30 minutes.', 'Log every lift and add weight when the last set feels easy.', 'Learn one full-body routine by heart', 'Add weight to your main lifts', 'Train without a plan in front of you', 2);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('fitness', 'classes', 'Take more classes', 'more energized', 'a regular at my favorite class', 'Class', null, null, null, null, false, 'Book your classes a week ahead', 'Pilates, yoga, spin, HIIT, whatever you love.', 'Book every class a week ahead and try one new format each month.', 'Find a studio and class time you love', 'Go to the same class every week', 'Become a regular somewhere', 3);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('fitness', 'endurance', 'Build endurance', 'fitter', 'with more endurance than ever', 'Cardio', null, null, null, null, false, 'Do steady cardio on your scheduled days', 'Running, cycling, swimming or rowing.', 'Three cardio sessions a week, with one longer session on the weekend.', 'Find a cardio you actually enjoy', 'Go longer than you could in week one', 'Your longest session yet feels doable', 4);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('fitness', 'event', 'Train for an event', 'event-ready', 'ready for race day', 'Training', null, null, null, null, false, 'Follow your training week', 'A race, a triathlon, a big hike.', 'Follow the plan exactly and log every session.', 'Sign up and pick a training plan', 'Hit your biggest training week', 'Taper and trust the work', 5);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('fitness', 'sport', 'Play a sport', 'more competitive', 'playing on a team', 'Practice / game', null, null, null, null, false, 'Show up for your team', 'One game or practice a week.', 'Practice, games, and one extra skills session a week.', 'Sign up for a winter league', 'Learn your teammates’ names', 'Finish the season', 6);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('fitness', 'mobility', 'Get more flexible', 'looser', 'moving without stiffness', 'Mobility', null, null, null, null, false, 'Stretch or do mobility work', 'Fifteen minutes on workout days.', 'A 30-minute mobility session plus a 10-minute daily stretch.', 'Find a routine you actually like', 'Get noticeably closer to your toes', 'Mobility is part of every workout', 7);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('fitness', 'move', 'Move more every day', 'more active', 'hitting my steps every day', 'Long walk', null, null, null, null, false, 'Hit a daily step goal', 'Start at 8,000 steps.', '10,000 steps a day, plus one long weekend walk or hike.', 'Find your current daily average', 'Add 2,000 steps a day', 'Walking becomes your default', 8);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('career', 'promo', 'Earn a promotion', 'sharper', 'ready for promotion season', null, null, 1, 'Career hour', 'log wins, plan next steps', true, 'Keep a weekly wins log', 'Three lines every Friday.', 'A wins log, reviewed with your manager every two weeks.', 'Start your wins log', 'Ask your manager what “next level” looks like', 'Walk into reviews with proof', 0);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('career', 'job', 'Find a new job', 'ready to move', 'in a job I’m excited about', null, null, 2, 'Job search hour', 'applications + outreach', true, 'Apply with intention', 'Two tailored applications a week.', 'Five tailored applications and two networking messages a week.', 'Update your résumé and LinkedIn', 'Land your first interviews', 'Have an offer or a clear next step', 1);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('career', 'visible', 'Get noticed at work', 'more visible', 'known for my work', null, null, 4, 'Weekly update', 'share one win with your team', false, 'Share your work weekly', 'One update to your manager or team.', 'A weekly update plus one stretch project.', 'Volunteer for one new project', 'Present your work once', 'Leadership knows your name', 2);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('career', 'network', 'Grow my network', 'more connected', 'known in my field', null, null, 3, 'Reach out', 'one message or coffee', false, 'Reach out to one person a week', 'A message, a coffee, a comment.', 'Two conversations a week, with a follow-up within 48 hours.', 'List ten people you’d like to know', 'Have four real conversations', 'Ask one person for advice or an intro', 3);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('career', 'skill', 'Build a skill for work', 'more skilled', 'better at my job', null, null, 0, 'Skill hour', 'one lesson, notes after', true, 'Do one lesson a week', 'Write down one takeaway.', 'Two lessons a week and one small project that uses them.', 'Choose the skill and block the time', 'Use it on a real task at work', 'Teach it to someone else', 4);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('career', 'bounds', 'Set work boundaries', 'less burned out', 'leaving work at work', null, 'Log off by 6:00', null, null, null, false, 'Keep a hard log-off time', 'No email after you log off.', 'Hard log-off, no work apps on your phone, one full day off a week.', 'Pick your log-off time and keep it', 'Turn off work notifications at night', 'Get through the holidays without work creep', 5);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('side', 'start', 'Start a side project', 'bolder', 'a side project further along', null, null, 5, 'Side-project block', '2 hours, phone away', false, 'Protect your project hours', 'One focused block a week.', 'Two focused blocks a week, each with one finished task.', 'Pick one goal for the month', 'Finish the first real piece', 'Share it with ten people', 0);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('side', 'idea', 'Figure out my idea', 'more decisive', 'clear on my idea', null, null, 2, 'Idea hour', 'research + notes', true, 'Keep a running idea list', 'Add to it whenever something sparks.', 'Test one idea a week by talking to someone who’d use it.', 'List ten ideas', 'Pick one and test it', 'Commit to it for the new year', 1);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('side', 'launch', 'Launch something', 'launched', 'with something live', null, null, 5, 'Launch block', 'build toward the date', false, 'Work toward one launch date', 'Pick it and put it on your calendar.', 'A launch date plus two build sessions a week.', 'Set the launch date and scope', 'Finish a version you’d show a friend', 'Launch it publicly', 2);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('side', 'content', 'Post content consistently', 'more consistent online', 'posting on a real schedule', null, null, 6, 'Content batch', 'shoot, write, schedule', false, 'Post on a set schedule', 'Once a week, same day.', 'Three posts a week, batched in one session.', 'Choose your platform and schedule', 'Batch a full month of content', 'Look back at what worked', 3);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('side', 'write', 'Start a newsletter or blog', 'published', 'writing every week', null, null, 3, 'Writing hour', 'draft, edit, publish', true, 'Publish one post a week', 'Short is fine.', 'One post a week, with the next one already in drafts.', 'Pick a name and publish the first post', 'Publish every week of the month', 'Reach your first 50 readers', 4);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('side', 'sell', 'Make my first sale', 'in business', 'with my first paying customer', null, null, 5, 'Sales block', 'reach out to five people', false, 'Ask for the sale', 'Tell one person a week what you offer.', 'Five outreach messages a week.', 'Decide what you’ll sell and for how much', 'Make your first offer', 'Land your first paying customer', 5);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('nutrition', 'prep', 'Meal prep every week', 'prepared', 'with meals ready every week', null, null, 6, 'Meal prep', 'list first, 2 hours', false, 'Meal prep on Sundays', 'Two lunches and one dinner ready.', 'Every weekday lunch prepped, plus two dinners.', 'Find three go-to prep meals', 'Prep every Sunday this month', 'Prep without needing a recipe', 0);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('nutrition', 'cook', 'Cook at home more', 'nourished', 'cooking most nights', null, null, 2, 'Cook dinner', 'try one new recipe', false, 'Cook dinner at home', 'Two nights a week to start.', 'Four nights a week, with one new recipe each week.', 'Learn three easy dinners', 'Cook more than you order', 'Host a dinner', 1);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('nutrition', 'protein', 'Eat more protein', 'fueled', 'eating to fuel my training', null, 'Protein at every meal', null, null, null, false, 'Build meals around protein', 'Start with breakfast.', 'Hit a daily protein target and track it for the month.', 'Find five high-protein breakfasts', 'Protein at every meal, most days', 'It’s how you eat now', 2);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('nutrition', 'water', 'Drink more water', 'hydrated', 'actually hydrated', null, 'Refill your bottle twice', null, null, null, false, 'Drink water through the day', 'A full bottle by lunch.', 'Two full bottles a day, water before coffee.', 'Find a bottle you’ll carry everywhere', 'Hit your goal five days a week', 'Hit it every day without thinking', 3);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('nutrition', 'whole', 'Eat more whole foods', 'nourished', 'eating more whole foods', null, 'Vegetables at lunch and dinner', null, null, null, false, 'Add a vegetable to every meal', 'Keep it simple.', 'Vegetables at every meal and processed snacks out of the house.', 'Swap one processed snack', 'Shop the edges of the store', 'Most of your meals are whole foods', 4);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('nutrition', 'caffeine', 'Cut back on caffeine', 'steadier', 'off the caffeine rollercoaster', null, 'Coffee before noon only', null, null, null, false, 'Keep coffee to the morning', 'Nothing after noon.', 'One coffee a day, and none after 10 a.m.', 'Track how much you actually drink', 'Cut one cup a day', 'Afternoons without the crash', 5);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('sleep', 'eight', 'Get 8 hours a night', 'more rested', 'finally well rested', null, 'Lights out by {bed}', null, null, null, false, 'Keep the same bedtime', 'Phone charges outside the bedroom.', 'Same bedtime and wake time every day, weekends included.', 'Pick a bedtime and keep it on weeknights', 'Keep it on weekends too', 'Eight hours is normal now', 0);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('sleep', 'snooze', 'Wake up without snoozing', 'more awake', 'up with my first alarm', null, 'Same wake-up time', null, null, null, false, 'Get up with the first alarm', 'Alarm across the room.', 'First alarm, every day, and sunlight within ten minutes.', 'Move your alarm across the room', 'No snoozing for two weeks', 'You wake before the alarm', 1);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('sleep', 'winddown', 'Build a wind-down routine', 'calmer at night', 'winding down instead of scrolling', null, 'Screens off an hour before bed', null, null, null, false, 'Start winding down an hour before bed', 'Dim lights, book, tea.', 'Screens off an hour before bed, every night.', 'Choose three steps for your routine', 'Do it five nights a week', 'Your body knows when it’s bedtime', 2);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('sleep', 'morning', 'Build a morning routine', 'more grounded', 'grounded in a morning routine', null, 'Water, light, then phone', null, null, null, false, 'Start the day the same way', 'Water, light, then everything else.', 'Same wake time plus 30 minutes for yourself before work.', 'Choose your wake time and stick to it', 'Add one thing you look forward to', 'The routine runs without thinking', 3);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('sleep', 'stretch', 'Stretch after every workout', 'looser', 'recovering properly', null, 'Stretch after you move', null, null, null, false, 'Stretch after every workout', 'Five minutes, no matter how easy it felt.', 'Ten minutes after every workout, plus a weekly foam-roll session.', 'Learn a five-minute routine', 'Never skip it after a hard day', 'Fewer aches, better runs', 4);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('sleep', 'restdays', 'Take real rest days', 'recovered', 'resting without guilt', null, null, 6, 'Full rest day', 'nothing scheduled', false, 'Keep one day a week unscheduled', 'No workouts, no to-do list.', 'One full rest day plus one easy-only day each week.', 'Protect one rest day a week', 'Notice how your body feels after it', 'Rest is part of the plan', 5);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('mental', 'stress', 'Stress less', 'lighter', 'calmer through the busy season', null, '10-minute walk, no phone', null, null, null, false, 'Take a daily no-phone walk', 'Ten minutes is enough.', 'A daily walk, plus one evening a week with no work at all.', 'Notice what drains you most', 'Cut or move one of those things', 'Leave the holidays rested, not depleted', 0);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('mental', 'scroll', 'Scroll less', 'more present', 'off my phone and present', null, 'No phone for the first hour', null, null, null, false, 'Keep the first hour phone-free', 'Alarm clock, not phone.', 'No phone for the first and last hour of the day.', 'Check your screen time and set a limit', 'Cut it by an hour a day', 'Delete the app you miss least', 1);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('mental', 'journal', 'Journal', 'clearer', 'clear on what I want next', null, 'Three lines before bed', null, null, null, false, 'Write three lines a night', 'What happened, how it felt, one thing for tomorrow.', 'A page every night and a longer entry every Sunday.', 'Write every night for two weeks', 'Reread November and notice patterns', 'Write a letter to yourself for next year', 2);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('mental', 'meditate', 'Meditate', 'calmer', 'starting the day calm', null, '10 minutes of quiet', null, null, null, false, 'Sit quietly for a few minutes', 'Five minutes, same time every day.', 'Fifteen minutes every morning.', 'Find a guided practice you like', 'Meditate most days', 'Reach for it when stress hits', 3);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('mental', 'checkin', 'Check in with myself', 'more self-aware', 'checked in with myself', null, null, 6, 'Weekly check-in', 'how am I, really?', false, 'Do a weekly check-in', 'Fifteen minutes on Sunday.', 'A weekly check-in plus a short monthly review.', 'Name what you need more and less of', 'Make one change based on it', 'Know your own warning signs', 4);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('mental', 'outside', 'Get outside every day', 'sunnier', 'outside every day', null, '20 minutes outside', null, null, null, false, 'Get outside daily', 'Even a walk around the block.', 'Thirty minutes outside every day, morning light first.', 'Find three outdoor spots near you', 'Outside every day for a month', 'Winter weather doesn’t stop you', 5);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('learning', 'read', 'Read more', 'more curious', 'a few books deeper', null, '20 pages before bed', null, null, null, false, 'Read before bed', 'Twenty pages, phone in another room.', 'Thirty pages a night and one book finished each month.', 'Finish your first book of the arc', 'Start a reading list for next year', 'Finish book three', 0);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('learning', 'club', 'Join a book club', 'well read', 'reading with a group', null, null, 3, 'Book club', 'or reading night', true, 'Join or start a book club', 'One book a month.', 'One book a month, and you host one meeting.', 'Find or start a club', 'Finish the first book on time', 'Pick the next book', 1);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('learning', 'grad', 'Plan for grad school', 'prepared', 'with a grad school plan', null, null, 0, 'Grad school hour', 'one program at a time', true, 'Research one hour a week', 'One program or requirement at a time.', 'Two hours a week, plus a call with a current student.', 'Shortlist five programs', 'Book test prep or info sessions', 'Make your enrollment plan', 2);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('learning', 'course', 'Take an online class', 'sharper', 'finishing a class I chose', null, null, 1, 'Class hour', 'one lesson, notes after', true, 'Do one lesson a week', 'Write down one takeaway.', 'Two lessons a week and finish the course.', 'Pick a course and enroll', 'Finish half of it', 'Finish it and use what you learned', 3);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('learning', 'news', 'Keep up with the news', 'more informed', 'actually informed', null, 'Ten minutes of news', null, null, null, false, 'Read the news daily', 'Ten minutes, one trusted source.', 'Ten minutes daily plus one long-form article a week.', 'Pick your sources', 'Read daily for a month', 'Talk about what you read', 4);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('learning', 'language', 'Learn a language', 'more fluent', 'conversational in a new language', null, '10 minutes of practice', null, null, null, false, 'Practice daily', 'Ten minutes in an app counts.', 'Twenty minutes daily plus one conversation a week.', 'Learn the 100 most common words', 'Hold a simple conversation', 'Watch a show in that language', 5);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('relationships', 'friends', 'See friends more', 'closer', 'closer to my people', null, null, 4, 'Plans with friends', 'one standing plan', false, 'Keep one plan on the calendar each week', 'Dinner, a walk, a class together.', 'One plan a week and a call to someone far away.', 'Make a standing weekly plan', 'Host something small', 'Start the year with a group tradition', 0);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('relationships', 'family', 'Call family more', 'closer to home', 'closer to my family', null, null, 2, 'Call someone you love', 'on your walk or commute', false, 'Call one family member a week', 'Use your walk or commute.', 'Two calls a week and one visit during the arc.', 'Set a standing call', 'Plan a holiday visit', 'Start a family tradition for next year', 1);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('relationships', 'newfriends', 'Make new friends', 'more social', 'with new friends in my city', null, null, 3, 'Try a group event', 'run club, class, meetup', false, 'Go to one group event a week', 'Run club, class, meetup.', 'One event a week and follow up with one new person.', 'Find two groups to try', 'Become a regular at one', 'Make plans with someone you met', 2);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('relationships', 'texts', 'Be better at texting back', 'more responsive', 'the friend who texts back', null, 'Zero unread texts', null, null, null, false, 'End the day with no unread texts', 'Answer while it’s quick.', 'No unread texts, plus one “thinking of you” message a day.', 'Clear your backlog', 'Reply within a day for a month', 'People notice', 3);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('relationships', 'dates', 'Plan more dates', 'more connected', 'prioritizing my relationship', null, null, 4, 'Date night', 'plan it, don’t default', false, 'Plan one date a week', 'Something you planned on purpose.', 'A weekly date, alternating who plans it.', 'Make a list of date ideas', 'Try three new ones', 'Plan something special for the new year', 4);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('relationships', 'host', 'Host more', 'the host', 'hosting the people I love', null, null, 5, 'Host something', 'dinner, game night, brunch', false, 'Host once a month', 'Keep it simple.', 'Host every two weeks, and one holiday gathering.', 'Host something small', 'Host a holiday get-together', 'Start a recurring gathering', 5);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('money', 'save', 'Save money', 'more secure', 'with more in savings', null, null, 6, 'Money check-in', '15 minutes, review the week', false, 'Do a weekly money check-in', 'Fifteen minutes on Sunday.', 'A weekly check-in and an automatic transfer every payday.', 'Know exactly what you spend in a month', 'Hit your first savings target', 'Start the year with a savings goal', 0);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('money', 'budget', 'Make a budget', 'organized', 'with a budget that works', null, null, 6, 'Budget check-in', 'compare plan to actual', false, 'Set a simple budget', 'Needs, wants, savings.', 'A detailed budget, tracked weekly.', 'Track every expense for a month', 'Build your budget from real numbers', 'Stick to it for a full month', 1);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('money', 'holiday', 'Stay on budget for the holidays', 'more prepared', 'through the holidays on budget', null, null, 6, 'Gift + travel check', 'update the list', false, 'Set a holiday spending limit', 'Write the list before you shop.', 'A set budget per person, tracked in one list.', 'Set your holiday budget', 'Finish shopping under budget', 'Start January with no holiday debt', 2);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('money', 'fund', 'Build an emergency fund', 'safer', 'with a real safety net', null, null, 6, 'Savings check', 'watch the fund grow', false, 'Save automatically each payday', 'Any amount counts.', 'A fixed percentage every payday, untouched.', 'Open a separate savings account', 'Reach your first milestone', 'Have one month of expenses saved', 3);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('money', 'spend', 'Spend less on impulse', 'more intentional', 'spending on purpose', null, 'Wait 48 hours before buying', null, null, null, false, 'Wait before you buy', 'Forty-eight hours for anything non-essential.', 'A 48-hour rule plus one no-spend week a month.', 'Unsubscribe from shopping emails', 'Do your first no-spend week', 'Spend less than last year’s December', 4);
insert into public.arc_goals (area, id, label, adj, phrase, workout, daily, block_day, block_b, block_i, block_t, habit, gentle, ambitious, ms1, ms2, ms3, sort) values ('money', 'learn', 'Learn about money', 'money-smart', 'confident with money', null, null, 0, 'Money hour', 'one book chapter or podcast', true, 'Learn one money topic a week', 'A chapter, podcast or article.', 'Two topics a week and a written plan for next year.', 'Pick a beginner money book', 'Understand your paycheck and benefits', 'Write your money goals for next year', 5);
commit;
