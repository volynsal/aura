-- Drop all existing avatar policies
DROP POLICY IF EXISTS "Avatar uploads by authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Avatar updates by owners" ON storage.objects;
DROP POLICY IF EXISTS "Avatar deletes by owners" ON storage.objects;
DROP POLICY IF EXISTS "Avatar public read access" ON storage.objects;

-- Create simple, working storage policies for avatars
CREATE POLICY "Allow authenticated users to upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to update their avatars" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow users to delete their avatars" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow public access to avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');