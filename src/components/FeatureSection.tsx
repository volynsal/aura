import { Button } from "@/components/ui/button";
import moodFeedImage from "@/assets/mood-feed.jpg";
import ghostDropsImage from "@/assets/ghost-drops.jpg";

const features = [
  {
    title: "Mood Feeds",
    description: "Discover NFTs by how they make you feel — not by trending tabs. Swipe through vibes, not vanity metrics.",
    image: moodFeedImage,
    color: "vibe-purple",
    tagline: "Scroll with soul"
  },
  {
    title: "Ghost Drops",
    description: "Time-limited NFT releases tied to real-life events, parties, or coordinates. Secret AR scavenger hunts across the city.",
    image: ghostDropsImage,
    color: "ghost-blue",
    tagline: "Mint for access"
  },
  {
    title: "Vibe Matching",
    description: "Swipe-style pairing of collectors and artists by aesthetic taste. Meet people through what they feel, not what they flex.",
    image: null,
    color: "mood-pink",
    tagline: "Connect through feeling"
  },
  {
    title: "Unlockables",
    description: "Owning an NFT gives you access to private zines, unreleased music, party invites, or DMs with the artist.",
    image: null,
    color: "flicker-yellow",
    tagline: "Own to unlock"
  }
];

const FeatureSection = () => {
  return (
    <section className="py-24 px-6 bg-underground/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-vibe-purple">Features</span> that feel
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aura is the digital backroom for emotional taste-makers — not a product, but a scene.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`group relative p-8 rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm hover:border-${feature.color}/50 transition-all duration-500 underground-shadow`}
            >
              {feature.image && (
                <div className="mb-6 overflow-hidden rounded-lg">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-48 object-cover kinetic-blur group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 bg-${feature.color} rounded-full animate-pulse`} />
                  <h3 className="text-2xl font-semibold">{feature.title}</h3>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                <p className={`text-sm text-${feature.color} font-medium uppercase tracking-wide`}>
                  {feature.tagline}
                </p>
              </div>
              
              {/* Hover glow effect */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-${feature.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Button variant="minimal" size="lg">
            Request early access
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;