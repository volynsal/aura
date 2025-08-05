import { Button } from "@/components/ui/button";
import heroImage from "@/assets/aura-hero.jpg";

const AuraHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grain">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-underground/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 flicker">
            <span className="text-vibe-purple">A</span>
            <span className="text-mood-pink">U</span>
            <span className="text-ghost-blue">R</span>
            <span className="text-flicker-yellow">A</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-light tracking-wide">
            Your mood is your gallery
          </p>
          <p className="text-md text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            The underground Instagram for NFTs — where digital art, emotion, and exclusive drops collide in a secret layer of the internet.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="aura" size="lg" className="text-lg px-8 py-6">
            Enter the Underground
          </Button>
          <Button variant="underground" size="lg" className="text-lg px-8 py-6">
            DM for location
          </Button>
        </div>
        
        <div className="mt-12">
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
            Not for clout. For feeling.
          </p>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-vibe-purple rounded-full animate-pulse opacity-60" />
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-mood-pink rounded-full animate-pulse opacity-40" />
      <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-ghost-blue rounded-full animate-pulse opacity-50" />
    </section>
  );
};

export default AuraHero;