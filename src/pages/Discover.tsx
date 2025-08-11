import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Clock, Zap, Home, Compass, ShoppingCart, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const trendingArtists = [
  { name: "neon_oracle", followers: "12.4K", mood: "cyberpunk", avatar: "/placeholder.svg" },
  { name: "void_painter", followers: "8.7K", mood: "dark", avatar: "/placeholder.svg" },
  { name: "dream_weaver", followers: "15.2K", mood: "ethereal", avatar: "/placeholder.svg" },
  { name: "glitch_goddess", followers: "6.9K", mood: "chaotic", avatar: "/placeholder.svg" }
];

const vibeCollections = [
  {
    name: "Late Night Energy",
    curator: "mood_curator",
    pieces: 24,
    mood: "nocturnal",
    preview: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  {
    name: "Digital Melancholy",
    curator: "soul_searcher", 
    pieces: 18,
    mood: "melancholic",
    preview: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  {
    name: "Euphoric Visions",
    curator: "vibe_master",
    pieces: 31,
    mood: "euphoric", 
    preview: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  }
];

const Discover = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set());
  const [drops, setDrops] = useState<any[]>([]);
  const [myCheckins, setMyCheckins] = useState<Set<string>>(new Set());
  const [checkingId, setCheckingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('aura_followed_usernames') || '[]');
      if (Array.isArray(stored)) setFollowedArtists(new Set(stored));
    } catch {}
  }, []);

  // Load ghost drops
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('ghost_drops')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Load drops error', error);
      }
      setDrops(data || []);
    })();
  }, []);

  // Load my check-ins
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('ghost_drop_checkins')
        .select('drop_id')
        .eq('user_id', user.id);
      if (error) {
        console.error('Load checkins error', error);
      }
      setMyCheckins(new Set((data || []).map((r: any) => r.drop_id)));
    })();
  }, [user]);

  const handleFollow = (artistName: string) => {
    const newFollowed = new Set(followedArtists);
    if (newFollowed.has(artistName)) {
      newFollowed.delete(artistName);
    } else {
      newFollowed.add(artistName);
    }
    setFollowedArtists(newFollowed);
    try { localStorage.setItem('aura_followed_usernames', JSON.stringify(Array.from(newFollowed))); } catch {}
  };

  const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatTimeLeft = (ends?: string | null) => {
    if (!ends) return null;
    const end = new Date(ends).getTime();
    const now = Date.now();
    const diff = Math.max(0, end - now);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const handleCheckIn = async (drop: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!('geolocation' in navigator)) {
      toast({ title: 'Location unavailable', description: 'Geolocation not supported in this browser.' });
      return;
    }
    setCheckingId(drop.id);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const dist = haversineMeters(pos.coords.latitude, pos.coords.longitude, drop.latitude, drop.longitude);
        const radius = drop.radius_m ?? 50;
        if (dist <= radius) {
          const { error } = await supabase.from('ghost_drop_checkins').insert({ drop_id: drop.id, user_id: user.id });
          if (error) throw error;
          setMyCheckins(prev => new Set([...prev, drop.id]));
          toast({ title: 'Unlocked!', description: `Checked in to ${drop.title}` });
        } else {
          toast({ title: 'Too far', description: `You are ${Math.round(dist)}m away. Get within ${radius}m to unlock.` });
        }
      } catch (e: any) {
        toast({ title: 'Check-in failed', description: e.message, variant: 'destructive' });
      } finally {
        setCheckingId(null);
      }
    }, (err) => {
      toast({ title: 'Location error', description: err.message, variant: 'destructive' });
      setCheckingId(null);
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  return (
    <div className="min-h-screen bg-background">
      
      <div className="pt-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover</h1>
          <p className="text-muted-foreground">Find your next vibe</p>
        </div>

        <Tabs defaultValue="artists" className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-1 bg-transparent p-0 h-auto">
            <TabsTrigger value="artists" className="w-full rounded-md py-2 transition-colors duration-200 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Artists</TabsTrigger>
            <TabsTrigger value="collections" className="w-full rounded-md py-2 transition-colors duration-200 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Collections</TabsTrigger>
            <TabsTrigger value="drops" className="w-full rounded-md py-2 transition-colors duration-200 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Ghost Drops</TabsTrigger>
            <TabsTrigger value="moods" className="w-full rounded-md py-2 transition-colors duration-200 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Moods</TabsTrigger>
          </TabsList>

          <TabsContent value="artists" className="mt-6">
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Trending Artists
              </h2>
              {trendingArtists.map((artist) => (
                <div key={artist.name} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-surface-elevated rounded-full" />
                    <div>
                      <p className="font-medium">{artist.name}</p>
                      <p className="text-sm text-muted-foreground">{artist.followers} followers</p>
                    </div>
                    <Badge variant="secondary" className="ml-2 capitalize">
                      {artist.mood}
                    </Badge>
                  </div>
                  <Button
                    variant={followedArtists.has(artist.name) ? "aura" : "outline"}
                    size="sm"
                    onClick={() => handleFollow(artist.name)}
                  >
                    {followedArtists.has(artist.name) ? "Following" : "Follow"}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Curated Collections
              </h2>
              {vibeCollections.map((collection) => (
                <div key={collection.name} className="p-4 bg-surface border border-border rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium mb-1">{collection.name}</h3>
                      <p className="text-sm text-muted-foreground">by {collection.curator}</p>
                      <Badge variant="secondary" className="mt-2 capitalize">
                        {collection.mood}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Follow Collection
                    </Button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {collection.preview.map((_, idx) => (
                      <div key={idx} className="w-16 h-16 bg-surface-elevated rounded-lg" />
                    ))}
                    <div className="w-16 h-16 bg-surface-elevated rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                      +{collection.pieces - 3}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{collection.pieces} pieces</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="drops" className="mt-6">
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Active Ghost Drops
              </h2>
              {drops.length === 0 ? (
                <p className="text-muted-foreground">No active drops right now.</p>
              ) : (
                drops.map((drop) => (
                  <div key={drop.id} className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium mb-1">{drop.title}</h3>
                        {drop.artist_username && (
                          <p className="text-sm text-muted-foreground">by {drop.artist_username}</p>
                        )}
                        {drop.location_name && (
                          <p className="text-sm text-muted-foreground mt-1">{drop.location_name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {formatTimeLeft(drop.ends_at) && (
                          <div className="flex items-center gap-1 text-sm font-medium text-primary">
                            <Clock className="w-4 h-4" />
                            {formatTimeLeft(drop.ends_at)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Radius</p>
                        <p className="font-medium">{drop.radius_m}m</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Collectors</p>
                        <p className="font-medium">{drop.found_count}/{drop.total}</p>
                      </div>
                    </div>
                    {myCheckins.has(drop.id) ? (
                      <Button variant="aura" size="sm" className="w-full" disabled>
                        Unlocked
                      </Button>
                    ) : (
                      <Button
                        variant="aura"
                        size="sm"
                        className="w-full"
                        onClick={() => handleCheckIn(drop)}
                        disabled={checkingId === drop.id}
                      >
                        {checkingId === drop.id ? 'Checking…' : 'Check in'}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="moods" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["ethereal", "dark", "vibrant", "melancholic", "euphoric", "chaotic", "serene", "rebellious", "nostalgic"].map((mood) => (
                <div key={mood} className="aspect-square bg-surface border border-border rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-surface-elevated transition-colors">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full mb-3 mx-auto" />
                    <p className="font-medium capitalize">{mood}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
};

export default Discover;
