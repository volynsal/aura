import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Heart } from "lucide-react";
import nft1 from "@/assets/nft-1.jpg";
import nft2 from "@/assets/nft-2.jpg";
import nft3 from "@/assets/nft-3.jpg";
import nft4 from "@/assets/nft-4.jpg";
import nft5 from "@/assets/nft-5.jpg";
import nft6 from "@/assets/nft-6.jpg";

const vibeCards = [
  {
    id: 1,
    title: "Cybermelancholy",
    description: "Digital nostalgia meets future sadness",
    match: 94,
    gradient: "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
  },
  {
    id: 2,
    title: "Neon Dreams",
    description: "Vivid fantasies in electric hues",
    match: 87,
    gradient: "bg-gradient-to-br from-pink-500/20 to-purple-500/20"
  },
  {
    id: 3,
    title: "Mystic Tech",
    description: "Ancient wisdom through digital lens",
    match: 76,
    gradient: "bg-gradient-to-br from-teal-500/20 to-blue-500/20"
  },
  {
    id: 4,
    title: "Void Serenity",
    description: "Peaceful emptiness as artistic statement",
    match: 91,
    gradient: "bg-gradient-to-br from-gray-500/20 to-slate-500/20"
  },
  {
    id: 5,
    title: "Solar Punk",
    description: "Optimistic futures in green harmony",
    match: 82,
    gradient: "bg-gradient-to-br from-green-500/20 to-yellow-500/20"
  }
];

const mockGallery = [
  { id: 'a', title: 'Neon Bloom', mood: 'Neon Dreams', src: nft1 },
  { id: 'b', title: 'Circuit Shrine', mood: 'Mystic Tech', src: nft2 },
  { id: 'c', title: 'Silent Nebula', mood: 'Void Serenity', src: nft3 },
  { id: 'd', title: 'Solar Garden', mood: 'Solar Punk', src: nft4 },
  { id: 'e', title: 'Chromatic Echo', mood: 'Cybermelancholy', src: nft5 },
  { id: 'f', title: 'Prism Pulse', mood: 'Neon Dreams', src: nft6 }
] as const;

const VibeMatchingDemo = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);
  
  const currentCard = vibeCards[currentCardIndex];
  
  const handlePass = () => {
    if (currentCardIndex < vibeCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0); // Reset to start
    }
  };
  
  const handleVibe = () => {
    setMatches([...matches, currentCard.id]);
    if (currentCardIndex < vibeCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0); // Reset to start
    }
  };

  return (
    <section className="pt-8 md:pt-10 pb-24 px-6 bg-gradient-to-b from-surface-elevated to-background">
      <div className="max-w-4xl mx-auto text-center">
        {/* Top mood cards preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <h3 className="font-semibold text-purple-300 mb-2">Neon Dreams</h3>
            <p className="text-sm text-muted-foreground">Vivid fantasies in electric hues</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/20">
            <h3 className="font-semibold text-teal-300 mb-2">Mystic Tech</h3>
            <p className="text-sm text-muted-foreground">Ancient wisdom through digital lens</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-gray-500/10 to-slate-500/10 border border-gray-500/20">
            <h3 className="font-semibold text-gray-300 mb-2">Void Serenity</h3>
            <p className="text-sm text-muted-foreground">Peaceful emptiness as artistic statement</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Vibe Matching Demo</h2>
          <p className="text-xl text-muted-foreground">
            Swipe through aesthetic frequencies to find your perfect match
          </p>
        </div>

        {/* Main vibe card */}
        <div className="relative max-w-sm mx-auto mb-8">
          <div className={`p-8 rounded-2xl border border-border/30 backdrop-blur-sm ${currentCard.gradient} transition-all duration-300`}>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/30 to-aura-accent/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-aura-accent animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{currentCard.title}</h3>
              <p className="text-muted-foreground mb-4">{currentCard.description}</p>
              <p className="text-lg font-semibold text-primary">
                {currentCard.match}% frequency match
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-6 justify-center mb-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handlePass}
            className="w-20 h-20 rounded-full border-2 hover:border-red-400 hover:text-red-400 transition-colors"
          >
            <X className="w-8 h-8" />
          </Button>
          <Button 
            variant="aura" 
            size="lg" 
            onClick={handleVibe}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-aura-accent hover:scale-105 transition-transform"
          >
            <Heart className="w-8 h-8" />
          </Button>
        </div>

        {/* Take quiz button */}
        <div>
          <Button variant="subtle" size="lg" className="px-12">
            Take the Vibe Quiz
          </Button>
        </div>

        {/* Static mock data gallery */}
        <section className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Explore</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {mockGallery.map((item) => (
              <article key={item.id} className="rounded-lg overflow-hidden border border-border bg-surface-elevated">
                <img
                  src={item.src}
                  alt={`${item.title} — ${item.mood} NFT artwork`}
                  loading="lazy"
                  className="w-full h-32 sm:h-40 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.mood}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Match counter */}
        {matches.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              You've matched with {matches.length} vibe{matches.length !== 1 ? 's' : ''}!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VibeMatchingDemo;