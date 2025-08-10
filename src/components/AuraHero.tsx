import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AuraHero = () => {
  return (
    <section className="relative pt-4 sm:pt-6 md:pt-24 pb-4 sm:pb-6 md:pb-10 px-3 md:px-6 bg-gradient-to-b from-background to-surface-elevated">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-4 sm:mb-6 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-7xl font-bold mb-2 sm:mb-3 md:mb-6 tracking-tight leading-tight">
            Your mood is your gallery
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground mb-3 sm:mb-4 md:mb-8 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto leading-relaxed px-1 sm:px-2">
            Discover and collect NFTs by how they make you feel. Aura is where digital art and emotion collide.
          </p>
        </div>
        
        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:gap-4 justify-center items-center mb-6 sm:mb-8 md:mb-16">
          <Link to="/discover">
            <Button variant="aura" size="lg" className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-8 py-2.5 sm:py-3 md:py-6">
              Start exploring
            </Button>
          </Link>
          <Link to="/vibe-matching">
            <Button variant="subtle" size="lg" className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-4 sm:px-5 md:px-8 py-2.5 sm:py-3 md:py-6">
              Learn more
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-8 max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-0.5 sm:mb-1">12.4K</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Artworks</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-0.5 sm:mb-1">2.8K</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Artists</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-0.5 sm:mb-1">890</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Collectors</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuraHero;