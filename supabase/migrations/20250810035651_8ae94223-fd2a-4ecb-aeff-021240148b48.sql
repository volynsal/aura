-- 1) Add aura column to profiles with default 10 and backfill existing rows
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS aura integer NOT NULL DEFAULT 10;

-- Ensure all existing rows are set to 10 explicitly
UPDATE public.profiles SET aura = 10 WHERE aura IS DISTINCT FROM 10;

-- 2) Helper function to increment a user's aura safely
CREATE OR REPLACE FUNCTION public.increment_user_aura(_user_id uuid, _delta integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO public
AS $$
  UPDATE public.profiles
  SET aura = COALESCE(aura, 0) + _delta,
      updated_at = now()
  WHERE user_id = _user_id;
$$;

-- 3) Trigger for awarding aura on NFT creation (draft posted)
CREATE OR REPLACE FUNCTION public.handle_nft_aura_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- +10 for posting a draft (any NFT creation)
  PERFORM public.increment_user_aura(NEW.creator_id, 10);

  -- +5 if it is already minted upon creation
  IF NEW.is_minted IS TRUE THEN
    PERFORM public.increment_user_aura(NEW.creator_id, 5);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_nfts_aura_on_insert ON public.nfts;
CREATE TRIGGER trg_nfts_aura_on_insert
AFTER INSERT ON public.nfts
FOR EACH ROW
EXECUTE FUNCTION public.handle_nft_aura_on_insert();

-- 4) Trigger for awarding aura when NFT gets minted (is_minted toggles to true)
CREATE OR REPLACE FUNCTION public.handle_nft_aura_on_mint()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF COALESCE(OLD.is_minted, false) = false AND COALESCE(NEW.is_minted, false) = true THEN
    -- +5 for minting
    PERFORM public.increment_user_aura(NEW.creator_id, 5);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_nfts_aura_on_mint ON public.nfts;
CREATE TRIGGER trg_nfts_aura_on_mint
AFTER UPDATE OF is_minted ON public.nfts
FOR EACH ROW
EXECUTE FUNCTION public.handle_nft_aura_on_mint();