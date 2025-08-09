-- Check if we need to create any missing triggers or update configuration
-- First, let's see the current auth configuration and make sure profiles are created automatically

-- Update the handle_new_user function to ensure it works properly with wallet users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name, wallet_address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user-' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'User'),
    NEW.raw_user_meta_data ->> 'wallet_address'
  );
  RETURN NEW;
END;
$$;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();