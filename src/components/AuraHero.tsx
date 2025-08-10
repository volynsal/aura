import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AuraHero = () => {
  return (
    <section className="relative pt-12 md:pt-24 pb-8 md:pb-10 px-4 md:px-6 bg-gradient-to-b from-background to-surface-elevated">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tight leading-tight">
            Your mood is your gallery
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            Discover and collect NFTs by how they make you feel. Aura is where digital art and emotion collide.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center items-center mb-12 md:mb-16">
          <Link to="/discover">
            <Button variant="aura" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
              Start exploring
            </Button>
          </Link>
          <Link to="/vibe-matching">
            <Button variant="subtle" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
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