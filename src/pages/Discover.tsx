import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Clock, Zap } from "lucide-react";

const trendingArtists = [
  { name: "neon_oracle", followers: "12.4K", mood: "cyberpunk", avatar: "/placeholder.svg" },
  { name: "void_painter", followers: "8.7K", mood: "dark", avatar: "/placeholder.svg" },
  { name: "dream_weaver", followers: "15.2K", mood: "ethereal", avatar: "/placeholder.svg" },
  { name: "glitch_goddess", followers: "6.9K", mood: "chaotic", avatar: "/placeholder.svg" }
];

const ghostDrops = [
  {
    id: 1,
    title: "Midnight Frequency",
    artist: "signal_lost",
    location: "Williamsburg, NYC",
    timeLeft: "2h 34m",
    clues: 3,
    found: 47,
    total: 100
  },
  {
    id: 2,
    title: "Neon Dreams",
    artist: "cyber_monk",
    location: "Hidden coordinates",
    timeLeft: "6h 12m",
    clues: 1,
    found: 23,
    total: 50
  }
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
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('aura_followed_usernames') || '[]');
      if (Array.isArray(stored)) setFollowedArtists(new Set(stored));
    } catch {}
  }, []);

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

  return (
    <div className="min-h-screen bg-background pt-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover</h1>
          <p className="text-muted-foreground">Find your next vibe</p>
        </div>

        <Tabs defaultValue="artists" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="artists">Artists</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="drops">Ghost Drops</TabsTrigger>
            <TabsTrigger value="moods">Moods</TabsTrigger>
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
                    {collection.preview.map((img, idx) => (
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
              {ghostDrops.map((drop) => (
                <div key={drop.id} className="p-4 bg-surface border border-border rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium mb-1">{drop.title}</h3>
                      <p className="text-sm text-muted-foreground">by {drop.artist}</p>
                      <p className="text-sm text-muted-foreground mt-1">{drop.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium text-primary">
                        <Clock className="w-4 h-4" />
                        {drop.timeLeft}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Clues found</p>
                      <p className="font-medium">{drop.clues}/3</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Collectors</p>
                      <p className="font-medium">{drop.found}/{drop.total}</p>
                    </div>
                  </div>
                  <Button variant="aura" size="sm" className="w-full">
                    Join Hunt
                  </Button>
                </div>
              ))}
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
  );
};

export default Discover;