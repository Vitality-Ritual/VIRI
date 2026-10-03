-- Records that somebody confirmed they are a woman at sign-up.
--
-- A timestamp rather than a gender column, deliberately. VIRI is for women, so
-- a gender field would hold the same value for every row and tell us nothing we
-- do not already know — while being far more sensitive to hold, and far worse
-- to leak. What is worth recording is the act: that this person was shown the
-- statement and affirmed it, and when.
--
-- Self-declared. Nothing here is verified, and the terms say so plainly:
-- gender cannot be checked reliably or ethically, and a document check would
-- fall hardest on trans women, who are women and are welcome here.

alter table public.profiles
  add column if not exists eligibility_confirmed_at timestamptz;

comment on column public.profiles.eligibility_confirmed_at is
  'When the member confirmed VIRI is for women and that they are a woman. Self-declared, never verified.';
