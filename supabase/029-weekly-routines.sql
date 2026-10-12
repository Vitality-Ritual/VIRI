-- 029 — "Your week" is for one week.
--
-- A routine used to be saved once and then repeat every week for good. Most
-- people's weeks are not the same twice, so a week set in September was still
-- matching people in October with classes nobody was going to. Each routine
-- now belongs to the week it was planned for (week_start, the Sunday), and the
-- site only reads this week's. Every Sunday the week starts empty and the
-- member plans it again; "Same as last week" copies the one before in a tap.
--
-- What is already there counts as this week, so nobody's week empties in the
-- middle of it. From next Sunday each week is entered fresh.
--
-- Safe to run more than once.

alter table public.routines add column if not exists week_start date;

-- the Sunday of the current week, on US Eastern time
update public.routines
   set week_start = (now() at time zone 'America/New_York')::date
                    - extract(dow from (now() at time zone 'America/New_York'))::int
 where week_start is null;

-- the site always sends week_start; this covers anything that does not
alter table public.routines alter column week_start
  set default ((now() at time zone 'America/New_York')::date
               - extract(dow from (now() at time zone 'America/New_York'))::int);
alter table public.routines alter column week_start set not null;

-- one routine per activity, place, day and window, within a week (the same
-- Tuesday class can be in this week and last week)
drop index if exists public.routines_unique_slot;
create unique index if not exists routines_unique_slot_week
  on public.routines (profile_id, week_start, activity, coalesce(venue_label,''), weekday, time_band);

create index if not exists routines_week_idx on public.routines (week_start, venue_id);

comment on column public.routines.week_start is
  'The Sunday of the week this was planned for. The site shows and matches on the current week only.';
