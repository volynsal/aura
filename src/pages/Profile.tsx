import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Share, Heart, Bookmark, Rss, Quote, Image, Music } from "lucide-react";

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

const userPosts = [
  { 
    id: 1, 
    type: "image", 
    title: "Neon Dreams #23", 
    content: "Sometimes the city speaks in neon languages only dreamers understand...", 
    artist: "cyber_artist", 
    mood: "euphoric", 
    image: "/placeholder.svg",
    notes: 847,
    timestamp: "3 hours ago"
  },
  { 
    id: 2, 
    type: "quote", 
    content: "We are all walking through our own personal void, but at least the void is aesthetic.",
    source: "Midnight Thoughts",
    mood: "melancholic",
    notes: 1203,
    timestamp: "1 day ago"
  },
  { 
    id: 3, 
    type: "text", 
    title: "Digital Serenity", 
    content: "Found this hidden corner of the internet today. It's quiet here. The kind of quiet that makes you remember who you are when no one's watching. Sometimes I think the best parts of ourselves only exist in these liminal digital spaces.",
    mood: "serene",
    notes: 234,
    timestamp: "2 days ago"
  },
  { 
    id: 4, 
    type: "audio", 
    title: "Chaos Theory Mixtape", 
    content: "Late night sessions producing this ambient chaos. Every glitch tells a story.",
    artist: "rebel_mind", 
    mood: "chaotic",
    duration: "4:23",
    notes: 567,
    timestamp: "3 days ago"
  },
  { 
    id: 5, 
    type: "image", 
    title: "Ethereal Flow", 
    content: "Caught this moment between dimensions. The algorithm gods smiled upon my feed today.",
    artist: "dream_weaver", 
    mood: "ethereal", 
    image: "/placeholder.svg",
    notes: 923,
    timestamp: "4 days ago"
  }
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
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tumblr-style Header */}
        <div className="text-center mb-8 border-b border-border/50 pb-8">
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/20">
            <AvatarImage src={userProfile.avatar} />
            <AvatarFallback className="text-3xl">{userProfile.displayName[0]}</AvatarFallback>
          </Avatar>
          
          <h1 className="text-3xl font-bold mb-2 gradient-text">{userProfile.username}</h1>
          <h2 className="text-lg text-muted-foreground mb-4">{userProfile.displayName}</h2>
          
          <div className="max-w-md mx-auto mb-6">
            <p className="text-center leading-relaxed">{userProfile.bio}</p>
          </div>
          
          <div className="flex justify-center gap-6 mb-4 text-sm text-muted-foreground">
            <span>Aura: <span className="text-primary font-medium">{userProfile.auraScore}</span></span>
            <span>Since {userProfile.joinedDate}</span>
          </div>
          
          {isOwnProfile ? (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button variant="minimal" size="sm">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <Button variant="aura" size="sm">Follow</Button>
              <Button variant="outline" size="sm">Message</Button>
            </div>
          )}
        </div>

        {/* Blog-style Navigation */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Rss className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Likes
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Following
            </TabsTrigger>
            <TabsTrigger value="wrapped">Archive</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-8">
              {userPosts.map((post) => (
                <article key={post.id} className="border border-border/50 rounded-xl overflow-hidden bg-surface/50 backdrop-blur-sm">
                  {/* Post Header */}
                  <div className="p-6 border-b border-border/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {post.type === "image" && <Image className="w-5 h-5 text-primary" />}
                        {post.type === "quote" && <Quote className="w-5 h-5 text-primary" />}
                        {post.type === "text" && <Rss className="w-5 h-5 text-primary" />}
                        {post.type === "audio" && <Music className="w-5 h-5 text-primary" />}
                        <Badge variant="secondary" className="capitalize text-xs">
                          {post.mood}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{post.timestamp}</span>
                    </div>
                    {post.title && <h3 className="font-bold text-lg mb-2">{post.title}</h3>}
                  </div>
                  
                  {/* Post Content */}
                  <div className="p-6">
                    {post.type === "image" && (
                      <div className="mb-4">
                        <img src={post.image} alt={post.title} className="w-full rounded-lg" />
                      </div>
                    )}
                    
                    {post.type === "quote" && (
                      <blockquote className="text-xl italic font-medium leading-relaxed mb-4 pl-4 border-l-4 border-primary">
                        "{post.content}"
                        {post.source && (
                          <cite className="block text-sm text-muted-foreground mt-2 not-italic">
                            — {post.source}
                          </cite>
                        )}
                      </blockquote>
                    )}
                    
                    {(post.type === "text" || post.type === "image") && post.content && (
                      <p className="leading-relaxed mb-4">{post.content}</p>
                    )}
                    
                    {post.type === "audio" && (
                      <div className="bg-surface-elevated rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                            <Music className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{post.title}</p>
                            <p className="text-sm text-muted-foreground">Duration: {post.duration}</p>
                          </div>
                        </div>
                        {post.content && <p className="mt-3 text-sm">{post.content}</p>}
                      </div>
                    )}
                    
                    {post.artist && (
                      <p className="text-sm text-muted-foreground mb-4">by {post.artist}</p>
                    )}
                  </div>
                  
                  {/* Post Footer */}
                  <div className="px-6 pb-6 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{post.notes.toLocaleString()} notes</span>
                    <div className="flex gap-4">
                      <button className="hover:text-primary transition-colors">Reblog</button>
                      <button className="hover:text-primary transition-colors">Like</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="grid gap-6">
              {savedCollections.map((collection) => (
                <div key={collection.name} className="border border-border/50 rounded-xl p-6 bg-surface/50 backdrop-blur-sm hover:bg-surface/80 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-aura rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{collection.name}</h3>
                      <p className="text-muted-foreground mb-3">{collection.pieces} posts liked</p>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="capitalize">
                          {collection.mood}
                        </Badge>
                        <button className="text-sm text-primary hover:underline">
                          View all likes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-bold mb-2">Following</h3>
              <p className="text-muted-foreground mb-6">Blogs you're following will appear here</p>
              <div className="space-y-4 max-w-md mx-auto">
                {["aesthetic_dreams", "void_poetry", "digital_nostalgia"].map((blog) => (
                  <div key={blog} className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{blog[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{blog}</p>
                      <p className="text-xs text-muted-foreground">Active 2h ago</p>
                    </div>
                    <Button variant="outline" size="sm">Unfollow</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wrapped" className="mt-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Archive</h3>
              <p className="text-muted-foreground mb-6">Browse your posts by month and year</p>
              <div className="max-w-sm mx-auto space-y-2">
                {["December 2024", "November 2024", "October 2024"].map((month) => (
                  <button key={month} className="w-full p-3 text-left bg-surface border border-border rounded-lg hover:bg-surface-elevated transition-colors">
                    <span className="font-medium">{month}</span>
                    <span className="text-sm text-muted-foreground ml-2">(12 posts)</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;