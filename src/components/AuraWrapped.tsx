const AuraWrapped = () => {
  return (
    <section className="py-24 px-6 gradient-underground">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-mood-pink">Aura</span> Wrapped™
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            A seasonal moodboard summary of your aesthetic evolution — collectible and shareable
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-border/20">
            <div className="w-12 h-12 bg-vibe-purple/20 rounded-lg mb-4 mx-auto flex items-center justify-center">
              <div className="w-6 h-6 bg-vibe-purple rounded-sm animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your Vibe Evolution</h3>
            <p className="text-sm text-muted-foreground">Track how your taste changes through seasons</p>
          </div>
          
          <div className="p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-border/20">
            <div className="w-12 h-12 bg-mood-pink/20 rounded-lg mb-4 mx-auto flex items-center justify-center">
              <div className="w-6 h-6 bg-mood-pink rounded-sm animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Mood Metrics</h3>
            <p className="text-sm text-muted-foreground">See what emotions drive your collecting</p>
          </div>
          
          <div className="p-6 rounded-xl bg-card/30 backdrop-blur-sm border border-border/20">
            <div className="w-12 h-12 bg-ghost-blue/20 rounded-lg mb-4 mx-auto flex items-center justify-center">
              <div className="w-6 h-6 bg-ghost-blue rounded-sm animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Collectible Report</h3>
            <p className="text-sm text-muted-foreground">Your Wrapped becomes an NFT itself</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-8 rounded-2xl gradient-ghost border border-ghost-blue/20 backdrop-blur-sm">
            <h3 className="text-2xl font-semibold mb-4">Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              Join the waitlist to get your first Aura Wrapped when we launch. Early adopters get exclusive access to Genesis drops.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input 
                type="email" 
                placeholder="your.vibe@email.com"
                className="px-4 py-3 rounded-lg bg-background/50 border border-border/30 backdrop-blur-sm focus:border-ghost-blue/50 focus:outline-none"
              />
              <button className="px-6 py-3 bg-ghost-blue/20 text-ghost-blue border border-ghost-blue/50 rounded-lg hover:bg-ghost-blue/30 transition-colors">
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuraWrapped;