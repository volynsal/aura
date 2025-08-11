import { Heart, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";
import nft1 from "@/assets/nft-1.jpg";
import nft2 from "@/assets/nft-2.jpg";
import nft3 from "@/assets/nft-3.jpg";
import nft4 from "@/assets/nft-4.jpg";
import nft5 from "@/assets/nft-5.jpg";
import nft6 from "@/assets/nft-6.jpg";

const nftPosts = [
  {
    id: 1,
    image: nft1,
    artist: "minimalist.eth",
    title: "Geometric Dreams #47",
    mood: "contemplative",
    likes: 234,
    price: "0.8 ETH"
  },
  {
    id: 2,
    image: nft2,
    artist: "ethereal_landscapes",
    title: "Misty Mountains",
    mood: "serene",
    likes: 892,
    price: "1.2 ETH"
  },
  {
    id: 3,
    image: nft3,
    artist: "portrait.creator",
    title: "Quiet Moments",
    mood: "peaceful",
    likes: 456,
    price: "0.6 ETH"
  },
  {
    id: 4,
    image: nft4,
    artist: "fluid.art",
    title: "Flow State #12",
    mood: "meditative",
    likes: 1203,
    price: "2.1 ETH"
  },
  {
    id: 5,
    image: nft5,
    artist: "arch.minimal",
    title: "Clean Lines",
    mood: "focused",
    likes: 567,
    price: "0.9 ETH"
  },
  {
    id: 6,
    image: nft6,
    artist: "botanical.soul",
    title: "Growth #8",
    mood: "hopeful",
    likes: 789,
    price: "0.7 ETH"
  }
];

const NftPost = ({ post }: { post: typeof nftPosts[0] }) => {
  return (
    <article className="bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg ember-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-surface-elevated rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">{post.artist[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{post.artist}</p>
            <p className="text-xs text-muted-foreground">2 hours ago</p>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground" />
      </div>

      {/* Image */}
      <div className="aspect-square relative group cursor-pointer">
        <img 
          src={post.image} 
          alt={`${post.title} — mood: ${post.mood}`}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 gradient-glow opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 cursor-pointer hover:text-red-400 transition-all duration-300 hover:scale-110" />
            <MessageCircle className="w-6 h-6 cursor-pointer hover:text-primary transition-all duration-300 hover:scale-110" />
            <Bookmark className="w-6 h-6 cursor-pointer hover:text-primary transition-all duration-300 hover:scale-110" />
          </div>
          <span className="text-sm font-medium text-primary">{post.price}</span>
        </div>

        <p className="text-sm font-medium mb-1">{post.likes.toLocaleString()} likes</p>
        
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">{post.artist}</span> {post.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Mood: <span className="text-primary">{post.mood}</span>
          </p>
        </div>
      </div>
    </article>
  );
};

const AuraFeed = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-0" role="feed" aria-label="NFT feed by mood">

      {/* Explore Heading */}
      <div className="text-center my-10">
        <h2 className="text-4xl md:text-5xl font-bold">Explore</h2>
      </div>

      {/* Mood Filter Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-max mx-auto">
            {['all', 'contemplative', 'serene', 'energetic', 'melancholic', 'hopeful', 'nostalgic'].map((mood) => (
              <button
                key={mood}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  mood === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-elevated text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nftPosts.map((post) => (
          <NftPost key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-12">
        <button className="px-8 py-3 bg-surface-elevated text-foreground border border-border rounded-lg hover:bg-accent hover:border-primary/30 transition-all duration-300 hover:scale-105">
          Load more vibes
        </button>
      </div>
    </div>
  );
};

export default AuraFeed;