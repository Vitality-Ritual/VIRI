-- A year cannot give an age.
--
-- Someone born in 2003 is 22 or 23 in 2026 depending on whether her birthday
-- has happened, and the profile was showing the higher number to everybody —
-- wrong for roughly half of members, all year round.
--
-- It matters more than tidiness: eligibility is 18+, and a birth year of 2008
-- belongs to somebody who may still be 17. The gate was approximate.
--
-- birth_year stays, filled from the date, so nothing that reads it breaks.

alter table public.profiles
  add column if not exists birth_date date;

comment on column public.profiles.birth_date is
  'Full date of birth. birth_year is derived from it; age is only correct when computed from this.';
