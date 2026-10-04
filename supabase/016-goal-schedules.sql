-- 016 — goals say when to ask about them, and their owner can edit them.
--
-- A goal used to be asked about every day of its week or month. "Three long
-- runs this month" was asked about thirty times to record three answers. Now a
-- goal carries one of:
--   check_days   weekdays to ask about, 0 = Sunday … 6 = Saturday
--   check_dates  particular dates to ask about
-- Both null means every day, which is how every existing goal carries on.
--
-- There was no policy letting a member change a goal once set, so a goal could
-- only be removed and set again. This adds one for the owner.
--
-- Safe to run more than once.

alter table public.goals add column if not exists check_days  smallint[];
alter table public.goals add column if not exists check_dates date[];

alter table public.goals drop constraint if exists goals_check_days_valid;
alter table public.goals add  constraint goals_check_days_valid check (
  check_days is null
  or (cardinality(check_days) between 1 and 7
      and check_days <@ array[0,1,2,3,4,5,6]::smallint[])
);

alter table public.goals drop constraint if exists goals_check_dates_valid;
alter table public.goals add  constraint goals_check_dates_valid check (
  check_dates is null or cardinality(check_dates) between 1 and 31
);

-- one schedule or the other, never both
alter table public.goals drop constraint if exists goals_one_schedule;
alter table public.goals add  constraint goals_one_schedule check (
  check_days is null or check_dates is null
);

drop policy if exists "goals: owner may edit" on public.goals;
create policy "goals: owner may edit" on public.goals
  for update to authenticated
  using      (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));
