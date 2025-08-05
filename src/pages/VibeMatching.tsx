import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, X, RotateCcw, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const vibeCards = [
  {
    id: 1,
    type: "artwork",
    title: "Neon Solitude #47",
    artist: "synthwave_dreams",
    artistAvatar: "/placeholder.svg",
    mood: "melancholic",
    image: "/placeholder.svg",
    description: "Finding beauty in the lonely glow of city lights...",
    rarity: "rare"
  },
  {
    id: 2,
    type: "artist",
    name: "digital_rebel",
    avatar: "/placeholder.svg",
    specialties: ["chaotic", "dark", "rebellious"],
    followers: "8.4K",
    recentWork: "Chaos Theory Series",
    description: "Breaking digital boundaries since 2019"
  },
  {
    id: 3,
    type: "artwork",
    title: "Ethereal Dreams",
    artist: "void_painter",
    artistAvatar: "/placeholder.svg",
    mood: "ethereal",
    image: "/placeholder.svg",
    description: "Floating between dimensions",
    rarity: "legendary"
  },
  {
    id: 4,
    type: "collector",
    name: "vibe_seeker",
    avatar: "/placeholder.svg",
    vibes: ["melancholic", "ethereal", "dark"],
    collection: 247,
    auraScore: 94,
    description: "Collecting moments that move me"
  }
];

const VibeMatching = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentCard = vibeCards[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setMatches(prev => [...prev, currentCard.id]);
    }
    
    // Move to next card
    if (currentIndex < vibeCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setDragOffset({
        x: clientX - centerX,
        y: clientY - centerY
      });
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const swipeThreshold = 100;
    if (Math.abs(dragOffset.x) > swipeThreshold) {
      handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const getRotation = () => {
    return dragOffset.x * 0.1; // Slight rotation based on drag
  };

  const getSwipeDirection = () => {
    if (Math.abs(dragOffset.x) > 50) {
      return dragOffset.x > 0 ? 'right' : 'left';
    }
    return null;
  };

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">No more cards!</h3>
          <Button onClick={() => setCurrentIndex(0)} variant="aura">
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto relative">
      {/* Cards Stack */}
      <div className="relative h-96 mb-6">
        {/* Next card (background) */}
        {vibeCards[currentIndex + 1] && (
          <Card className="absolute inset-0 bg-surface-elevated border-border scale-95 opacity-60">
            <CardContent className="p-0 h-full">
              <div className="h-full bg-gradient-to-b from-transparent to-black/60 rounded-lg" />
            </CardContent>
          </Card>
        )}
        
        {/* Current card */}
        <Card 
          ref={cardRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing transition-transform duration-200 border-border overflow-hidden"
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg)`,
            opacity: isDragging && Math.abs(dragOffset.x) > 50 ? 0.8 : 1
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <CardContent className="p-0 h-full relative">
            {currentCard.type === 'artwork' && (
              <>
                <div className="h-full bg-surface-elevated">
                  <img 
                    src={currentCard.image} 
                    alt={currentCard.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {currentCard.mood}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {currentCard.rarity}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{currentCard.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={currentCard.artistAvatar} />
                      <AvatarFallback>{currentCard.artist[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{currentCard.artist}</span>
                  </div>
                  <p className="text-sm text-white/80">{currentCard.description}</p>
                </div>
              </>
            )}
            
            {currentCard.type === 'artist' && (
              <div className="h-full p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={currentCard.avatar} />
                  <AvatarFallback className="text-2xl">{currentCard.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold mb-2">{currentCard.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{currentCard.followers} followers</p>
                <div className="flex gap-2 mb-3 flex-wrap justify-center">
                  {currentCard.specialties.map((mood) => (
                    <Badge key={mood} variant="secondary" className="capitalize">
                      {mood}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm font-medium mb-2">Latest: {currentCard.recentWork}</p>
                <p className="text-sm text-muted-foreground">{currentCard.description}</p>
              </div>
            )}
            
            {currentCard.type === 'collector' && (
              <div className="h-full p-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-secondary/20 to-secondary/5">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={currentCard.avatar} />
                  <AvatarFallback className="text-2xl">{currentCard.name[0]}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold mb-2">{currentCard.name}</h3>
                <div className="flex gap-4 mb-3 text-sm">
                  <span><strong>{currentCard.collection}</strong> pieces</span>
                  <span>Aura <strong>{currentCard.auraScore}</strong></span>
                </div>
                <div className="flex gap-2 mb-3 flex-wrap justify-center">
                  {currentCard.vibes.map((vibe) => (
                    <Badge key={vibe} variant="outline" className="capitalize">
                      {vibe}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{currentCard.description}</p>
              </div>
            )}
            
            {/* Swipe indicators */}
            {getSwipeDirection() === 'left' && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <div className="bg-red-500 text-white p-4 rounded-full">
                  <X className="w-8 h-8" />
                </div>
              </div>
            )}
            {getSwipeDirection() === 'right' && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <div className="bg-green-500 text-white p-4 rounded-full">
                  <Heart className="w-8 h-8" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-14 h-14 p-0"
          onClick={() => handleSwipe('left')}
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-14 h-14 p-0"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
        >
          <RotateCcw className="w-6 h-6" />
        </Button>
        <Button
          variant="aura"
          size="lg"
          className="rounded-full w-14 h-14 p-0"
          onClick={() => handleSwipe('right')}
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Match indicator */}
      {matches.length > 0 && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>{matches.length} matches found</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VibeMatching;