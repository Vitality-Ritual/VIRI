-- Everybody tells us their age; nobody has to show it.
--
-- Age is required at sign-up because the product is 18+ and a liability waiver
-- a minor can disaffirm protects nobody. But knowing someone's age and
-- publishing it are different things, so display is opt-in and off by default.
--
-- The default matters: a column added to a live table applies its default to
-- every row that already exists, so nobody's age becomes visible because of
-- this migration.

alter table public.profiles
  add column if not exists show_age boolean not null default false;

comment on column public.profiles.show_age is
  'Opt-in. When false the birth year is still stored but never rendered on the profile.';
