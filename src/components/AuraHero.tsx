import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const AuraHero = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <section className="relative bg-background">
        <div className="overflow-x-auto scrollbar-hide border-b border-border/20">
          <div className="flex gap-6 px-4 py-1.5 text-xs">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-muted-foreground">12.4K artworks</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Link to="/discover">
                <Button variant="ghost" size="sm" className="text-xs px-2 py-0.5 h-5">
                  Explore
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-muted-foreground">2.8K artists</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-6 md:pt-24 pb-6 md:pb-10 px-6 bg-gradient-to-b from-background to-surface-elevated">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6 md:mb-12">
          <h1 className="text-3xl md:text-7xl font-bold mb-3 md:mb-6 tracking-tight leading-tight">
            Your mood is your gallery
          </h1>
          <p className="text-base md:text-xl text-muted-foreground mb-4 md:mb-8 max-w-xl md:max-w-2xl mx-auto leading-relaxed">
            Discover and collect NFTs by how they make you feel. Aura is where digital art and emotion collide.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center items-center mb-8 md:mb-16">
          <Link to="/discover">
            <Button variant="aura" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              Start exploring
            </Button>
          </Link>
          <Link to="/vibe-matching">
            <Button variant="subtle" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
              Learn more
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-sm sm:max-w-md mx-auto">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-1">12.4K</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Artworks</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-1">2.8K</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Artists</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-1">890</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Collectors</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuraHero;