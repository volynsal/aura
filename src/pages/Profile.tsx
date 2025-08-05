import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Share, Heart, Grid3X3, Bookmark } from "lucide-react";

const userProfile = {
  username: "vibe_seeker",
  displayName: "Maya Chen",
  bio: "Digital nomad collecting moments that move me 🌙 Currently vibing: melancholic",
  followers: "2.4K",
  following: "847",
  auraScore: "✨ 94",
  joinedDate: "March 2024",
  avatar: "/placeholder.svg"
};

const userNFTs = [
  { id: 1, title: "Neon Dreams #23", artist: "cyber_artist", mood: "euphoric", image: "/placeholder.svg" },
  { id: 2, title: "Void Walker", artist: "dark_creator", mood: "melancholic", image: "/placeholder.svg" },
  { id: 3, title: "Digital Serenity", artist: "peace_maker", mood: "serene", image: "/placeholder.svg" },
  { id: 4, title: "Chaos Theory", artist: "rebel_mind", mood: "chaotic", image: "/placeholder.svg" },
  { id: 5, title: "Ethereal Flow", artist: "dream_weaver", mood: "ethereal", image: "/placeholder.svg" },
  { id: 6, title: "Urban Pulse", artist: "city_soul", mood: "vibrant", image: "/placeholder.svg" }
];

const savedCollections = [
  { name: "Late Night Vibes", pieces: 12, mood: "nocturnal", preview: "/placeholder.svg" },
  { name: "Emotional Abstracts", pieces: 8, mood: "melancholic", preview: "/placeholder.svg" },
  { name: "Future Nostalgia", pieces: 15, mood: "nostalgic", preview: "/placeholder.svg" }
];

const auraActivity = [
  { type: "minted", item: "Midnight Frequency #7", time: "2 hours ago", mood: "dark" },
  { type: "curated", item: "Digital Solitude collection", time: "5 hours ago", mood: "melancholic" },
  { type: "vibed", item: "Neon Dreams by cyber_artist", time: "1 day ago", mood: "euphoric" },
  { type: "collected", item: "Void Walker #12", time: "2 days ago", mood: "dark" }
];

const Profile = () => {
  const [isOwnProfile] = useState(true); // In real app, this would be determined by route params

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="w-24 h-24">
            <AvatarImage src={userProfile.avatar} />
            <AvatarFallback className="text-2xl">{userProfile.displayName[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-2xl font-bold">{userProfile.username}</h1>
              {isOwnProfile ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="minimal" size="sm">
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="aura" size="sm">Follow</Button>
                  <Button variant="outline" size="sm">Message</Button>
                </div>
              )}
            </div>
            
            <div className="flex gap-6 mb-3 text-sm">
              <span><strong>{userNFTs.length}</strong> collected</span>
              <span><strong>{userProfile.followers}</strong> followers</span>
              <span><strong>{userProfile.following}</strong> following</span>
            </div>
            
            <div className="mb-3">
              <h2 className="font-medium text-lg">{userProfile.displayName}</h2>
              <p className="text-muted-foreground">{userProfile.bio}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Aura Score: <span className="text-primary font-medium">{userProfile.auraScore}</span></span>
              <span>Joined {userProfile.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="collected" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collected" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Collected
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="wrapped">Wrapped</TabsTrigger>
          </TabsList>

          <TabsContent value="collected" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userNFTs.map((nft) => (
                <div key={nft.id} className="group cursor-pointer">
                  <div className="aspect-square bg-surface-elevated rounded-lg mb-2 relative overflow-hidden">
                    <img src={nft.image} alt={nft.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center">
                        <Badge variant="secondary" className="mb-2 capitalize">
                          {nft.mood}
                        </Badge>
                        <p className="text-white font-medium text-sm">{nft.title}</p>
                        <p className="text-white/80 text-xs">by {nft.artist}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="grid gap-4">
              {savedCollections.map((collection) => (
                <div key={collection.name} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl">
                  <div className="w-16 h-16 bg-surface-elevated rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground">{collection.pieces} pieces</p>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {collection.mood}
                    </Badge>
                  </div>
                  <Button variant="minimal" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="space-y-4">
              {auraActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="capitalize font-medium">{activity.type}</span>{" "}
                      <span className="text-muted-foreground">{activity.item}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {activity.mood}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wrapped" className="mt-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Your 2024 Aura Wrapped</h3>
              <p className="text-muted-foreground mb-6">Your aesthetic evolution this year</p>
              <Button variant="aura">Generate Wrapped</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;