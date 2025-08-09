-- Update NFTs table to add missing columns if they don't exist
DO $$ 
BEGIN 
    -- Add rarity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nfts' AND column_name = 'rarity') THEN
        ALTER TABLE public.nfts ADD COLUMN rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'));
    END IF;

    -- Add updated_at column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nfts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.nfts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
    END IF;
END $$;

-- Create storage policies for NFT images (if they don't exist)
DO $$ 
BEGIN
    -- Check if policies exist before creating them
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'NFT images are publicly accessible') THEN
        CREATE POLICY "NFT images are publicly accessible" 
        ON storage.objects 
        FOR SELECT 
        USING (bucket_id = 'nft-images');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload their own NFT images') THEN
        CREATE POLICY "Users can upload their own NFT images" 
        ON storage.objects 
        FOR INSERT 
        WITH CHECK (bucket_id = 'nft-images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update their own NFT images') THEN
        CREATE POLICY "Users can update their own NFT images" 
        ON storage.objects 
        FOR UPDATE 
        USING (bucket_id = 'nft-images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete their own NFT images') THEN
        CREATE POLICY "Users can delete their own NFT images" 
        ON storage.objects 
        FOR DELETE 
        USING (bucket_id = 'nft-images' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
END $$;

-- Create trigger for automatic timestamp updates (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_nfts_updated_at') THEN
        CREATE TRIGGER update_nfts_updated_at
        BEFORE UPDATE ON public.nfts
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;