-- Create NFT storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('nft-images', 'nft-images', true);

-- Create NFTs table
CREATE TABLE public.nfts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price_eth DECIMAL(20, 8),
  price_usd DECIMAL(10, 2),
  rarity TEXT CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_exclusive BOOLEAN DEFAULT FALSE,
  attributes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;

-- Create policies for NFTs
CREATE POLICY "Anyone can view NFTs" 
ON public.nfts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own NFTs" 
ON public.nfts 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own NFTs" 
ON public.nfts 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own NFTs" 
ON public.nfts 
FOR DELETE 
USING (auth.uid() = creator_id);

-- Create storage policies for NFT images
CREATE POLICY "NFT images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'nft-images');

CREATE POLICY "Users can upload their own NFT images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'nft-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own NFT images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'nft-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own NFT images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'nft-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_nfts_updated_at
BEFORE UPDATE ON public.nfts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();