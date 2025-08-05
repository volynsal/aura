const AuraFooter = () => {
  return (
    <footer className="py-16 px-6 bg-underground border-t border-border/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-3xl font-bold mb-4">
              <span className="text-vibe-purple">A</span>
              <span className="text-mood-pink">U</span>
              <span className="text-ghost-blue">R</span>
              <span className="text-flicker-yellow">A</span>
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              The underground Instagram for NFTs. A secret layer of the internet where digital art, emotion, and exclusive drops collide.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-vibe-purple/20 rounded-lg flex items-center justify-center hover:bg-vibe-purple/30 transition-colors cursor-pointer">
                <div className="w-4 h-4 bg-vibe-purple rounded-sm" />
              </div>
              <div className="w-8 h-8 bg-mood-pink/20 rounded-lg flex items-center justify-center hover:bg-mood-pink/30 transition-colors cursor-pointer">
                <div className="w-4 h-4 bg-mood-pink rounded-sm" />
              </div>
              <div className="w-8 h-8 bg-ghost-blue/20 rounded-lg flex items-center justify-center hover:bg-ghost-blue/30 transition-colors cursor-pointer">
                <div className="w-4 h-4 bg-ghost-blue rounded-sm" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-vibe-purple">Features</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">Mood Feeds</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Vibe Matching</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Ghost Drops</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Unlockables</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Curation-to-Earn</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-mood-pink">Community</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="hover:text-foreground transition-colors cursor-pointer">Early Access</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Discord</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Twitter</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Instagram</li>
              <li className="hover:text-foreground transition-colors cursor-pointer">Telegram</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Aura. Scrolling through feelings since the underground.
          </p>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
            Not for clout. For feeling.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AuraFooter;