-- Fix the RLS policy for profile creation
-- The trigger needs to insert profiles when users are created, but they're not authenticated yet
-- So we need to modify the INSERT policy to allow the trigger to work

DROP POLICY "Users can insert their own profile" ON public.profiles;

-- Create a new policy that allows both authenticated users and the trigger to insert
CREATE POLICY "Allow profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to insert their own profile
  auth.uid() = user_id
  OR 
  -- Allow the system (trigger) to insert profiles during user creation
  auth.uid() IS NULL
);