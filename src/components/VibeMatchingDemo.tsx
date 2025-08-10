import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Heart } from "lucide-react";

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
    <section className="pt-2 md:pt-4 pb-8 md:pb-10 px-6 bg-gradient-to-b from-surface-elevated to-background">
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