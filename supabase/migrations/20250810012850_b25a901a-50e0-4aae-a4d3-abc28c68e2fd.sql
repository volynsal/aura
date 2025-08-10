-- Enforce mood-only attributes with max 5 items on nfts
CREATE OR REPLACE FUNCTION public.validate_nft_attributes_mood_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  elem jsonb;
BEGIN
  -- Allow NULL as empty
  IF NEW.attributes IS NULL THEN
    RETURN NEW;
  END IF;

  -- Must be an array
  IF jsonb_typeof(NEW.attributes) <> 'array' THEN
    RAISE EXCEPTION 'nfts.attributes must be a JSON array';
  END IF;

  -- Max 5
  IF jsonb_array_length(NEW.attributes) > 5 THEN
    RAISE EXCEPTION 'nfts.attributes cannot contain more than 5 items';
  END IF;

  -- Validate each element
  FOR elem IN SELECT jsonb_array_elements(NEW.attributes)
  LOOP
    IF jsonb_typeof(elem) <> 'object' THEN
      RAISE EXCEPTION 'each attribute must be an object';
    END IF;

    IF lower(coalesce(elem->>'trait_type','')) <> 'mood' THEN
      RAISE EXCEPTION 'trait_type must be ''mood'' only';
    END IF;

    IF length(trim(coalesce(elem->>'value',''))) = 0 THEN
      RAISE EXCEPTION 'attribute value cannot be empty';
    END IF;
  END LOOP;

  -- Normalize: force trait_type to 'mood' and trim values
  NEW.attributes := (
    SELECT jsonb_agg(jsonb_build_object(
      'trait_type','mood',
      'value', trim(elem->>'value')
    ))
    FROM jsonb_array_elements(NEW.attributes) AS elem
  );

  RETURN NEW;
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS trg_validate_nft_attributes_mood_only_ins ON public.nfts;
DROP TRIGGER IF EXISTS trg_validate_nft_attributes_mood_only_upd ON public.nfts;

CREATE TRIGGER trg_validate_nft_attributes_mood_only_ins
BEFORE INSERT ON public.nfts
FOR EACH ROW
EXECUTE FUNCTION public.validate_nft_attributes_mood_only();

CREATE TRIGGER trg_validate_nft_attributes_mood_only_upd
BEFORE UPDATE ON public.nfts
FOR EACH ROW
EXECUTE FUNCTION public.validate_nft_attributes_mood_only();