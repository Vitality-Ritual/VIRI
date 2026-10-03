-- Not everything happens in a studio.
--
-- Routines required a venue from the studio list, which assumed every member's
-- week is boutique classes. Somebody who runs five mornings a week and takes
-- one class had nothing to enter — the feature was useless to her, which is
-- most runners.
--
-- A routine is now an activity, optionally somewhere. "Running, Tuesday
-- mornings" is a complete answer. So is "Running, Tuesday mornings, Rock Creek
-- Park", and so is "Pilates, Tuesday mornings, [solidcore] Logan Circle".
--
-- The place is free text as well as a picked studio, because a member knows
-- where she trains and we should not need a row for it first. That also covers
-- the gyms missing from the list — Equinox, VIDA, Gold's and the rest — until
-- those are added properly.

alter table public.routines alter column venue_id    drop not null;
alter table public.routines alter column venue_label drop not null;
alter table public.routines alter column activity    set not null;

-- the old constraint keyed on a venue that may now be absent
alter table public.routines drop constraint if exists routines_profile_id_venue_id_weekday_time_band_key;

-- one routine per activity, place, day and window
create unique index if not exists routines_unique_slot
  on public.routines (profile_id, activity, coalesce(venue_label,''), weekday, time_band);

comment on column public.routines.venue_label is
  'Where, if anywhere. A studio from the list, a park, a gym we do not list yet, or null for things with no fixed place.';
