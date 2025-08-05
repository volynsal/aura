import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Bookmark, Share, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const moods = ["ethereal", "dark", "vibrant", "melancholic", "euphoric", "chaotic", "serene", "rebellious"];

const feedPosts = [
  {
    id: 1,
    artist: "synthwave_dreams",
    artistAvatar: "/placeholder.svg",
    title: "Neon Solitude #47",
    price: "2.3 ETH",
    mood: "melancholic",
    image: "/placeholder.svg",
    likes: 847,
    comments: 23,
    timeAgo: "4h",
    description: "Finding beauty in the lonely glow of city lights..."
  },
  {
    id: 2,
    artist: "digital_rebel",
    artistAvatar: "/placeholder.svg",
    title: "Chaos Theory",
    price: "1.8 ETH",
    mood: "chaotic",
    image: "/placeholder.svg",
    likes: 1204,
    comments: 67,
    timeAgo: "7h",
    description: "When order breaks down, art emerges"
  },
  {
    id: 3,
    artist: "ethereal_visions",
    artistAvatar: "/placeholder.svg",
    title: "Floating Dreams",
    price: "3.1 ETH",
    mood: "ethereal",
    image: "/placeholder.svg",
    likes: 592,
    comments: 15,
    timeAgo: "12h",
    description: "Suspended between reality and imagination"
  }
];

const Feed = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const handleLike = (postId: number) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const filteredPosts = selectedMood 
    ? feedPosts.filter(post => post.mood === selectedMood)
    : feedPosts;

  return (
    <div className="min-h-screen bg-background">
      {/* Mood Filter Bar */}
      <div className="sticky top-16 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
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
      <div className="max-w-2xl mx-auto px-4 py-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="mb-8 bg-surface border border-border rounded-xl overflow-hidden">
            {/* Post Header */}
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
              <Button variant="minimal" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* NFT Image */}
            <div className="aspect-square bg-surface-elevated relative group">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Badge variant="secondary" className="mb-2 capitalize">
                  {post.mood}
                </Badge>
                <h3 className="text-white font-bold text-lg">{post.title}</h3>
                <p className="text-white/80 text-sm">{post.price}</p>
              </div>
            </div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <Button
                    variant="minimal"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={likedPosts.has(post.id) ? "text-red-500" : ""}
                  >
                    <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="minimal" size="sm">
                    <MessageCircle className="w-5 h-5" />
                  </Button>
                  <Button variant="minimal" size="sm">
                    <Share className="w-5 h-5" />
                  </Button>
                </div>
                <Button variant="minimal" size="sm">
                  <Bookmark className="w-5 h-5" />
                </Button>
              </div>

              <p className="font-medium text-sm mb-1">
                {post.likes + (likedPosts.has(post.id) ? 1 : 0)} likes
              </p>
              
              <div className="text-sm">
                <span className="font-medium">{post.artist}</span>{" "}
                <span className="text-muted-foreground">{post.description}</span>
              </div>

              {post.comments > 0 && (
                <Button variant="minimal" size="sm" className="mt-2 p-0 h-auto text-muted-foreground">
                  View all {post.comments} comments
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;