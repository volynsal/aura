-- Create user profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  is_creator BOOLEAN DEFAULT false,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_eth DECIMAL(18,8),
  price_usd DECIMAL(10,2),
  benefits TEXT[],
  max_subscribers INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tiers are viewable by everyone" 
ON public.subscription_tiers FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own tiers" 
ON public.subscription_tiers FOR ALL USING (auth.uid() = creator_id);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES public.subscription_tiers(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(subscriber_id, tier_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT USING (auth.uid() = subscriber_id);

CREATE POLICY "Creators can view subscriptions to their tiers" 
ON public.subscriptions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.subscription_tiers st 
    WHERE st.id = tier_id AND st.creator_id = auth.uid()
  )
);

CREATE POLICY "Users can create subscriptions" 
ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = subscriber_id);

-- Create collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_exclusive BOOLEAN DEFAULT false,
  required_tier_id UUID REFERENCES public.subscription_tiers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections are viewable by everyone" 
ON public.collections FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own collections" 
ON public.collections FOR ALL USING (auth.uid() = creator_id);

-- Create NFTs table
CREATE TABLE public.nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  collection_id UUID REFERENCES public.collections(id),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  metadata_url TEXT,
  price_eth DECIMAL(18,8),
  price_usd DECIMAL(10,2),
  is_minted BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,
  required_tier_id UUID REFERENCES public.subscription_tiers(id),
  token_id TEXT,
  contract_address TEXT,
  blockchain TEXT DEFAULT 'ethereum',
  rarity TEXT,
  attributes JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NFTs are viewable by everyone" 
ON public.nfts FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own NFTs" 
ON public.nfts FOR ALL USING (auth.uid() = creator_id);

-- Create marketplace orders table
CREATE TABLE public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_id UUID REFERENCES public.nfts(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  price_eth DECIMAL(18,8) NOT NULL,
  price_usd DECIMAL(10,2),
  status TEXT CHECK (status IN ('active', 'sold', 'cancelled')) DEFAULT 'active',
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sold_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders are viewable by everyone" 
ON public.marketplace_orders FOR SELECT USING (true);

CREATE POLICY "Users can create orders for their NFTs" 
ON public.marketplace_orders FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own orders" 
ON public.marketplace_orders FOR UPDATE USING (auth.uid() = seller_id);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('nft-images', 'nft-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('collection-covers', 'collection-covers', true);

-- Create storage policies for NFT images
CREATE POLICY "NFT images are publicly accessible" 
ON storage.objects FOR SELECT USING (bucket_id = 'nft-images');

CREATE POLICY "Authenticated users can upload NFT images" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'nft-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own NFT images" 
ON storage.objects FOR UPDATE USING (bucket_id = 'nft-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatar storage policies
CREATE POLICY "Avatars are publicly accessible" 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Collection cover storage policies
CREATE POLICY "Collection covers are publicly accessible" 
ON storage.objects FOR SELECT USING (bucket_id = 'collection-covers');

CREATE POLICY "Authenticated users can upload collection covers" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'collection-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own collection covers" 
ON storage.objects FOR UPDATE USING (bucket_id = 'collection-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();