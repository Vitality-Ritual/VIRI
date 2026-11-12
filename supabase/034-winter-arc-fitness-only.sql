-- 034: the Winter Arc email only schedules workouts when Fitness is one of the
-- picked categories (a Relationships-only plan was getting six "Move" days).
-- Replaces send_winter_arc from 033; the tables and seed are unchanged.
-- Run this whole file once in the Supabase SQL editor.

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
