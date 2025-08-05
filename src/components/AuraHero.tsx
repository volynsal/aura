import { Button } from "@/components/ui/button";

const AuraHero = () => {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-background to-surface-elevated">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Your mood is your gallery
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover and collect NFTs by how they make you feel. Aura is where digital art and emotion collide.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button variant="aura" size="lg" className="text-lg px-8 py-6">
            Start exploring
          </Button>
          <Button variant="subtle" size="lg" className="text-lg px-8 py-6">
            Learn more
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">12.4K</div>
            <div className="text-sm text-muted-foreground">Artworks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">2.8K</div>
            <div className="text-sm text-muted-foreground">Artists</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">890</div>
            <div className="text-sm text-muted-foreground">Collectors</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuraHero;