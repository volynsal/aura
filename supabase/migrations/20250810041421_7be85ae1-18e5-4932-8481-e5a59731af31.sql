-- 1) Ghost drops table (location-based)
CREATE TABLE IF NOT EXISTS public.ghost_drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  artist_username text,
  location_name text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  radius_m integer NOT NULL DEFAULT 50,
  total integer NOT NULL DEFAULT 100,
  found_count integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ghost_drops ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ghost_drops' AND policyname='Ghost drops are viewable by everyone'
  ) THEN
    CREATE POLICY "Ghost drops are viewable by everyone" ON public.ghost_drops FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ghost_drops' AND policyname='Creators can manage their own drops'
  ) THEN
    CREATE POLICY "Creators can manage their own drops" ON public.ghost_drops FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ghost_drops_creator_id ON public.ghost_drops(creator_id);
CREATE INDEX IF NOT EXISTS idx_ghost_drops_coords ON public.ghost_drops(latitude, longitude);

-- 2) Check-ins table
CREATE TABLE IF NOT EXISTS public.ghost_drop_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES public.ghost_drops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ghost_drop_checkins_unique UNIQUE (drop_id, user_id)
);

ALTER TABLE public.ghost_drop_checkins ENABLE ROW LEVEL SECURITY;

-- Anyone can see aggregate progress (non-sensitive)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ghost_drop_checkins' AND policyname='Ghost drop check-ins are viewable by everyone'
  ) THEN
    CREATE POLICY "Ghost drop check-ins are viewable by everyone" ON public.ghost_drop_checkins FOR SELECT USING (true);
  END IF;
END $$;

-- Users can create their own check-ins
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ghost_drop_checkins' AND policyname='Users can create their own check-ins'
  ) THEN
    CREATE POLICY "Users can create their own check-ins" ON public.ghost_drop_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3) Increment found_count on check-in
CREATE OR REPLACE FUNCTION public.handle_checkin_increment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  UPDATE public.ghost_drops
  SET found_count = found_count + 1
  WHERE id = NEW.drop_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ghost_drop_checkins_increment ON public.ghost_drop_checkins;
CREATE TRIGGER trg_ghost_drop_checkins_increment
AFTER INSERT ON public.ghost_drop_checkins
FOR EACH ROW
EXECUTE FUNCTION public.handle_checkin_increment();