import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Bookmark, Share, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";

const moods = ["common", "rare", "epic", "legendary"]; // Updated to match rarity values

const Feed = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [feedNFTs, setFeedNFTs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userMoods, setUserMoods] = useState<string[]>([]);
  const [followedUsernames, setFollowedUsernames] = useState<string[]>([]);
  const [followedCreatorIds, setFollowedCreatorIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const moods = JSON.parse(localStorage.getItem('aura_user_moods') || '[]');
      const follows = JSON.parse(localStorage.getItem('aura_followed_usernames') || '[]');
      if (Array.isArray(moods)) setUserMoods(moods);
      if (Array.isArray(follows)) setFollowedUsernames(follows);
    } catch {}
  }, []);

  useEffect(() => {
    const mapUsernamesToIds = async () => {
      if (!followedUsernames || followedUsernames.length === 0) {
        setFollowedCreatorIds([]);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('username', followedUsernames);
      if (!error && data) {
        setFollowedCreatorIds(data.map((p: any) => p.user_id));
      }
    };
    mapUsernamesToIds();
  }, [followedUsernames]);

  useEffect(() => {
    fetchFeedNFTs();
  }, []);

  const fetchFeedNFTs = async () => {
    try {
      const { data: nfts, error: nftError } = await supabase
        .from('nfts')
        .select(`
          *,
          profiles:creator_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_minted', true) // Only show minted NFTs in the feed
        .order('created_at', { ascending: false })
        .limit(50);

      if (nftError) throw nftError;
      
      // Transform the data to match our feed format
      const transformedNFTs = nfts?.map(nft => ({
        id: nft.id,
        artist: nft.profiles?.username || 'Anonymous',
        artistAvatar: nft.profiles?.avatar_url,
        title: nft.title,
        price: nft.price_eth ? `${nft.price_eth} ETH` : null,
        mood: nft.rarity || 'neutral', // Using rarity as mood for now
        image: nft.image_url,
        likes: Math.floor(Math.random() * 500), // Mock likes for now
        comments: Math.floor(Math.random() * 50), // Mock comments for now
        timeAgo: getTimeAgo(nft.created_at),
        description: nft.description,
        nftData: nft
      })) || [];

      setFeedNFTs(transformedNFTs);
    } catch (error: any) {
      toast({
        title: "Error loading feed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const handlePostClick = (nft: any) => {
    navigate(`/nft/${nft.id}`);
  };

  const filteredPosts = selectedMood 
    ? feedNFTs.filter(post => post.mood === selectedMood)
    : feedNFTs;

  // Mood-aware scoring similar to VibeMatching
  const tokens = (userMoods || []).map(m => m.toLowerCase().trim()).filter(Boolean);
  const getAttributeMoods = (nft: any): string[] => {
    const attrs = (nft?.attributes as any[]) || [];
    return attrs
      .filter((a: any) => (a?.trait_type || '').toLowerCase() === 'mood')
      .map((a: any) => (a?.value || '').toLowerCase().trim())
      .filter(Boolean);
  };
  const scoreByMoods = (nft: any, tks: string[], artistName: string): number => {
    if (!tks.length) return 0;
    const moods = getAttributeMoods(nft);
    const titleLower = (nft?.title || '').toLowerCase();
    const descLower = (nft?.description || '').toLowerCase();
    const artistLower = (artistName || '').toLowerCase();
    const matches = tks.reduce((acc, t) => (
      acc + (moods.includes(t) || titleLower.includes(t) || descLower.includes(t) || artistLower.includes(t) ? 1 : 0)
    ), 0);
    return Math.round((matches / tks.length) * 100);
  };

  const vibedPosts = tokens.length
    ? feedNFTs
        .map(p => ({ post: p, score: scoreByMoods(p.nftData, tokens, p.artist) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(x => x.post)
    : [];

  const followedPosts = followedCreatorIds.length
    ? feedNFTs.filter(p => followedCreatorIds.includes(p.nftData.creator_id)).slice(0, 8)
    : [];

  const trendingPosts = tokens.length
    ? feedNFTs
        .filter(p => scoreByMoods(p.nftData, tokens, p.artist) > 0)
        .sort((a, b) => new Date(b.nftData.created_at).getTime() - new Date(a.nftData.created_at).getTime())
        .slice(0, 8)
    : feedNFTs.slice(0, 8);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="AURA Feed — Personalized NFTs" description="Curated NFT feed based on your vibes, follows, and trends." />
      {/* Mood Filter Bar */}
      <div className="sticky top-14 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <Button
              variant={selectedMood === null ? "aura" : "minimal"}
              size="sm"
              onClick={() => setSelectedMood(null)}
              className="whitespace-nowrap"
            >
              All vibes
            </Button>
            {moods.map((mood) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? "aura" : "minimal"}
                size="sm"
                onClick={() => setSelectedMood(mood)}
                className="whitespace-nowrap capitalize"
              >
                {mood}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-2 space-y-10">
        {vibedPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Because you vibed with {tokens.slice(0,3).join(', ') || 'these moods'}</h2>
              <Badge variant="outline" className="text-xs">Why you're seeing this: your vibes</Badge>
            </div>
            {vibedPosts.map((post) => (
              <div 
                key={post.id} 
                className="mb-8 bg-surface border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handlePostClick(post)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.artistAvatar} />
                      <AvatarFallback>{post.artist[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{post.artist}</p>
                      <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
                    </div>
                  </div>
                  <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                <div className="aspect-square bg-surface-elevated relative group">
                  <img src={post.image} alt={`${post.title} — mood: ${post.mood}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Badge variant="secondary" className="mb-2 capitalize">{post.mood}</Badge>
                    <h3 className="text-white font-bold text-lg">{post.title}</h3>
                    <p className="text-white/80 text-sm">{post.price}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <Button variant="minimal" size="sm" onClick={(e) => { e.stopPropagation(); handleLike(post.id); }} className={likedPosts.has(post.id) ? "text-red-500" : ""}>
                        <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MessageCircle className="w-5 h-5" />
                      </Button>
                      <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                        <Share className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Bookmark className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="font-medium text-sm mb-1">{post.likes + (likedPosts.has(post.id) ? 1 : 0)} likes</p>
                  <div className="text-sm">
                    <span className="font-medium">{post.artist}</span>{" "}
                    <span className="text-muted-foreground">{post.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {followedPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">From creators you follow</h2>
              <Badge variant="outline" className="text-xs">Why you're seeing this: follows</Badge>
            </div>
            {followedPosts.map((post) => (
              <div 
                key={post.id} 
                className="mb-8 bg-surface border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handlePostClick(post)}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.artistAvatar} />
                      <AvatarFallback>{post.artist[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{post.artist}</p>
                      <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
                    </div>
                  </div>
                  <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                <div className="aspect-square bg-surface-elevated relative group">
                  <img src={post.image} alt={`${post.title} — mood: ${post.mood}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Badge variant="secondary" className="mb-2 capitalize">{post.mood}</Badge>
                    <h3 className="text-white font-bold text-lg">{post.title}</h3>
                    <p className="text-white/80 text-sm">{post.price}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <Button variant="minimal" size="sm" onClick={(e) => { e.stopPropagation(); handleLike(post.id); }} className={likedPosts.has(post.id) ? "text-red-500" : ""}>
                        <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                        <MessageCircle className="w-5 h-5" />
                      </Button>
                      <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                        <Share className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Bookmark className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="font-medium text-sm mb-1">{post.likes + (likedPosts.has(post.id) ? 1 : 0)} likes</p>
                  <div className="text-sm">
                    <span className="font-medium">{post.artist}</span>{" "}
                    <span className="text-muted-foreground">{post.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Trending {tokens.length ? 'in your moods' : 'now'}</h2>
            <Badge variant="outline" className="text-xs">Why you're seeing this: trending</Badge>
          </div>
          {trendingPosts.map((post) => (
            <div 
              key={post.id} 
              className="mb-8 bg-surface border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handlePostClick(post)}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.artistAvatar} />
                    <AvatarFallback>{post.artist[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{post.artist}</p>
                    <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
                  </div>
                </div>
                <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="aspect-square bg-surface-elevated relative group">
                <img src={post.image} alt={`${post.title} — mood: ${post.mood}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Badge variant="secondary" className="mb-2 capitalize">{post.mood}</Badge>
                  <h3 className="text-white font-bold text-lg">{post.title}</h3>
                  <p className="text-white/80 text-sm">{post.price}</p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <Button variant="minimal" size="sm" onClick={(e) => { e.stopPropagation(); handleLike(post.id); }} className={likedPosts.has(post.id) ? "text-red-500" : ""}>
                      <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                    <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Share className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button variant="minimal" size="sm" onClick={(e) => e.stopPropagation()}>
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </div>
                <p className="font-medium text-sm mb-1">{post.likes + (likedPosts.has(post.id) ? 1 : 0)} likes</p>
                <div className="text-sm">
                  <span className="font-medium">{post.artist}</span>{" "}
                  <span className="text-muted-foreground">{post.description}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Feed;