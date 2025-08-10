-- 1) Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT likes_unique UNIQUE (nft_id, user_id),
  CONSTRAINT likes_nft_fk FOREIGN KEY (nft_id) REFERENCES public.nfts(id) ON DELETE CASCADE
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can read likes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'likes' AND policyname = 'Likes are viewable by everyone'
  ) THEN
    CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
  END IF;
END $$;

-- RLS: users can like as themselves
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'likes' AND policyname = 'Users can like as themselves'
  ) THEN
    CREATE POLICY "Users can like as themselves" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Optional: allow users to delete their own likes
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'likes' AND policyname = 'Users can remove their own likes'
  ) THEN
    CREATE POLICY "Users can remove their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_likes_nft_id ON public.likes(nft_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- 2) Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comments_nft_fk FOREIGN KEY (nft_id) REFERENCES public.nfts(id) ON DELETE CASCADE
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can read comments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Comments are viewable by everyone'
  ) THEN
    CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
  END IF;
END $$;

-- RLS: users can comment as themselves
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Users can comment as themselves'
  ) THEN
    CREATE POLICY "Users can comment as themselves" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Optional: allow users to update/delete their own comments
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Users can edit their own comments'
  ) THEN
    CREATE POLICY "Users can edit their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Users can delete their own comments'
  ) THEN
    CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_comments_nft_id ON public.comments(nft_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- 3) Aura awarding for likes
CREATE OR REPLACE FUNCTION public.handle_like_aura()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_creator_id uuid;
BEGIN
  -- +3 to liker
  PERFORM public.increment_user_aura(NEW.user_id, 3);

  -- +3 to NFT creator for receiving a like (avoid self-like double count)
  SELECT creator_id INTO v_creator_id FROM public.nfts WHERE id = NEW.nft_id;
  IF v_creator_id IS NOT NULL AND v_creator_id <> NEW.user_id THEN
    PERFORM public.increment_user_aura(v_creator_id, 3);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_likes_aura ON public.likes;
CREATE TRIGGER trg_likes_aura
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_like_aura();

-- 4) Aura awarding for comments
CREATE OR REPLACE FUNCTION public.handle_comment_aura()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_creator_id uuid;
BEGIN
  -- +3 to commenter
  PERFORM public.increment_user_aura(NEW.user_id, 3);

  -- +3 to NFT creator for receiving a comment (avoid self-comment double count)
  SELECT creator_id INTO v_creator_id FROM public.nfts WHERE id = NEW.nft_id;
  IF v_creator_id IS NOT NULL AND v_creator_id <> NEW.user_id THEN
    PERFORM public.increment_user_aura(v_creator_id, 3);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_comments_aura ON public.comments;
CREATE TRIGGER trg_comments_aura
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_comment_aura();