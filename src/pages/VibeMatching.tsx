import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Heart, X, RotateCcw, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

// Dynamic cards sourced from NFTs and user-selected moods
const VibeMatching = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const [nfts, setNfts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [moodQuery, setMoodQuery] = useState("");
  const [userMoods, setUserMoods] = useState<string[]>([]);
  const [creatorMap, setCreatorMap] = useState<Record<string, string>>({});
  const [creatorSearchMap, setCreatorSearchMap] = useState<Record<string, { display: string; username: string }>>({});

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim();
    if (q) {
      if (q !== moodQuery) setMoodQuery(q);
      const moods = q.split(',').map(m => m.toLowerCase().trim()).filter(Boolean).slice(0, 5);
      setUserMoods(moods);
      try { localStorage.setItem('aura_user_moods', JSON.stringify(moods)); } catch {}
      console.log('VibeMatching: URL param q detected', { q, moods });
    }
  }, [searchParams]);

  const currentCard = cards[currentIndex];

  useEffect(() => {
     const fetchNFTs = async () => {
       const { data, error } = await supabase
         .from('nfts')
         .select('id,title,description,image_url,rarity,attributes,creator_id')
         .limit(100);
       if (error) {
         console.error('VibeMatching: fetchNFTs error', error);
       } else {
         console.log('VibeMatching: fetched NFTs', { count: data?.length, sample: (data || []).slice(0, 3) });
         setNfts(data || []);
       }
     };
    fetchNFTs();
  }, []);

  // Load creator usernames for fetched NFTs
  useEffect(() => {
    const loadProfiles = async () => {
      const ids = Array.from(new Set((nfts || []).map((n: any) => n.creator_id).filter(Boolean)));
      if (ids.length === 0) { setCreatorMap({}); return; }
       const { data, error } = await supabase
         .from('profiles')
         .select('user_id, username, display_name')
         .in('user_id', ids as string[]);
       if (!error && data) {
         const nameMap: Record<string, string> = {};
         const searchMap: Record<string, { display: string; username: string }> = {};
         data.forEach((p: any) => {
           nameMap[p.user_id] = p.display_name || p.username || 'creator';
           searchMap[p.user_id] = {
             display: (p.display_name || '').toLowerCase(),
             username: (p.username || '').toLowerCase(),
           };
         });
         console.log('VibeMatching: loaded profiles', {
           creatorIds: ids,
           count: data.length,
           sample: data.slice(0, 3),
         });
         setCreatorMap(nameMap);
         setCreatorSearchMap(searchMap);
       } else if (error) {
         console.error('VibeMatching: loadProfiles error', error);
       }
    };
    loadProfiles();
  }, [nfts]);

  useEffect(() => {
     const tokens = userMoods.map(m => m.toLowerCase().trim()).filter(Boolean);
     console.log('VibeMatching: compute start', {
       tokens,
       nftsCount: nfts?.length,
       creatorMapSize: Object.keys(creatorMap || {}).length,
       creatorSearchMapSize: Object.keys(creatorSearchMap || {}).length,
     });
     const computed = (nfts || []).map((nft: any) => {
      const moods: string[] = ((nft?.attributes as any[]) || [])
        .filter((a: any) => (a?.trait_type || '').toLowerCase() === 'mood')
        .map((a: any) => (a?.value || '').toLowerCase().trim())
        .filter(Boolean);

      const artistName = creatorMap[nft.creator_id] || 'creator';
      const titleLower = (nft.title || '').toLowerCase();
      const descLower = (nft.description || '').toLowerCase();
      const searchNames = creatorSearchMap[nft.creator_id] || { display: '', username: '' };
      const artistLower = `${searchNames.display} ${searchNames.username} ${artistName}`.toLowerCase();

      const matchesCount = tokens.reduce((acc, t) => {
        const hit = moods.includes(t) || titleLower.includes(t) || descLower.includes(t) || artistLower.includes(t);
        return acc + (hit ? 1 : 0);
      }, 0);

      const score = tokens.length > 0 ? Math.round((matchesCount / tokens.length) * 100) : 0;

      return {
        id: nft.id,
        type: 'artwork',
        title: nft.title,
        artist: artistName,
        artistAvatar: '/placeholder.svg',
        mood: moods[0] || 'mood',
        image: nft.image_url,
        description: nft.description || '',
        rarity: nft.rarity || 'common',
        match: score,
      };
    })
    .sort((a, b) => b.match - a.match);

     const filtered = tokens.length ? computed.filter(c => c.match > 0) : computed;
     console.log('VibeMatching: compute result', {
       computed: computed.length,
       filtered: filtered.length,
       sample: filtered.slice(0, 3).map(c => ({ title: c.title, artist: c.artist, match: c.match }))
     });
     setCards(filtered);
     setCurrentIndex(0);
  }, [nfts, userMoods, creatorMap, creatorSearchMap]);

   const handleFindMatches = () => {
     const moods = moodQuery
       .split(',')
       .map(m => m.toLowerCase().trim())
       .filter(Boolean)
       .slice(0, 5);
     console.log('VibeMatching: search submit', { moodQuery, parsed: moods });
     setUserMoods(moods);
     try { localStorage.setItem('aura_user_moods', JSON.stringify(moods)); } catch {}
   };

  const handleSwipe = (direction: 'left' | 'right') => {
  if (direction === 'right') {
    setMatches(prev => {
      const next = [...prev, currentCard.id];
      try { localStorage.setItem('aura_liked_nft_ids', JSON.stringify(next)); } catch {}
      return next;
    });
  }
    
    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
    setDragOffset({ x: 0, y: 0 });
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX, y: clientY });
    e.preventDefault();
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    
    // Constrain vertical movement and prioritize horizontal
    const constrainedY = Math.max(-50, Math.min(50, deltaY * 0.3));
    
    setDragOffset({
      x: deltaX,
      y: constrainedY
    });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const swipeThreshold = 80;
    const velocityThreshold = Math.abs(dragOffset.x) > swipeThreshold;
    
    if (velocityThreshold) {
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      animateCardExit(direction);
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const animateCardExit = (direction: 'left' | 'right') => {
    const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
    setDragOffset({ x: exitX, y: dragOffset.y });
    
    setTimeout(() => {
      handleSwipe(direction);
    }, 200);
  };

  const getRotation = () => {
    return Math.max(-15, Math.min(15, dragOffset.x * 0.05)); // Smooth rotation with limits
  };

  const getSwipeDirection = () => {
    if (Math.abs(dragOffset.x) > 60) {
      return dragOffset.x > 0 ? 'right' : 'left';
    }
    return null;
  };

  const getSwipeOpacity = () => {
    const maxDistance = 150;
    const distance = Math.abs(dragOffset.x);
    return Math.max(0.3, 1 - (distance / maxDistance) * 0.7);
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
    <>
      <SEO title="Vibe Matching - Find mood-based art" description="Discover NFTs that match your mood and aesthetic." />
      {/* Mobile Navigation Banner */}
      <div className="lg:hidden bg-surface/50 border-b border-border/30">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          <Button 
            variant="ghost" 
            size="sm" 
            className="whitespace-nowrap hover-scale"
            onClick={() => navigate('/feed')}
          >
            Feed
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="whitespace-nowrap hover-scale"
            onClick={() => navigate('/discover')}
          >
            Discover
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="whitespace-nowrap hover-scale bg-primary/20 text-primary"
          >
            Match
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="whitespace-nowrap hover-scale"
            onClick={() => navigate('/create')}
          >
            Create
          </Button>
        </div>
      </div>
      <div className="max-w-md mx-auto relative">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 pt-4 md:pt-0">Your mood(s)</label>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <Input
              placeholder="e.g., melancholic, ethereal"
              value={moodQuery}
              onChange={(e) => setMoodQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFindMatches();
              }}
              className="h-8 md:h-10 py-1 md:py-2 text-sm md:text-base min-w-0 flex-1"
            />
            <Button
              variant="aura"
              size="sm"
              onClick={handleFindMatches}
              className="md:h-10 md:px-4 md:text-base"
            >
              Search
            </Button>
            {userMoods.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { 
                  setUserMoods([]); 
                  setMoodQuery(''); 
                  try { localStorage.removeItem('aura_user_moods'); } catch {}
                }}
                className="md:h-10 md:px-4 md:text-base"
              >
                Clear
              </Button>
            )}
          </div>
          {userMoods.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {userMoods.map((m, i) => (
                <Badge key={m + i} variant="secondary" className="capitalize">
                  {m}
                  <button
                    className="ml-2 text-xs opacity-70 hover:opacity-100"
                    onClick={() => setUserMoods(userMoods.filter((_, idx) => idx !== i))}
                    aria-label={`Remove ${m}`}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted-foreground">Tip: comma-separated, up to 5 moods.</p>
        </div>
        {/* Cards Stack */}
      <div className="relative h-96 mb-6">
        {/* Next card (background) */}
        {cards[currentIndex + 1] && (
          <Card className="absolute inset-0 bg-surface-elevated border-border scale-95 opacity-60">
            <CardContent className="p-0 h-full">
              <div className="h-full bg-gradient-to-b from-transparent to-black/60 rounded-lg" />
            </CardContent>
          </Card>
        )}
        
        {/* Current card */}
        <Card 
          ref={cardRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing transition-all duration-200 border-border overflow-hidden select-none"
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg)`,
            opacity: getSwipeOpacity(),
            transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.2s ease-out'
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Swipe direction indicators */}
          {isDragging && getSwipeDirection() && (
            <div className={`absolute inset-0 flex items-center justify-center z-10 ${
              getSwipeDirection() === 'right' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              <div className="text-6xl font-bold opacity-80">
                {getSwipeDirection() === 'right' ? '💖' : '👎'}
              </div>
            </div>
          )}
          
          <CardContent className="p-0 h-full relative">
            {currentCard.type === 'artwork' && (
              <>
                <div className="h-full bg-surface-elevated rounded-lg overflow-hidden mx-3 sm:mx-4">
                  <img 
                    src={currentCard.image} 
                    alt={currentCard.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-y-0 left-3 right-3 sm:left-4 sm:right-4 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg" />
                <div className="absolute bottom-0 left-3 right-3 sm:left-4 sm:right-4 p-6 text-white">
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
    </>
  );
};

export default VibeMatching;