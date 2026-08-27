ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

COMMENT ON COLUMN public.profiles.latitude IS 'Approximate city-level latitude for talent map; must not contain precise residential coordinates.';
COMMENT ON COLUMN public.profiles.longitude IS 'Approximate city-level longitude for talent map; must not contain precise residential coordinates.';

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_latitude_range CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  ADD CONSTRAINT profiles_longitude_range CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180);