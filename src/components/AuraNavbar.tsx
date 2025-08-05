import { Button } from "@/components/ui/button";
import { Search, Heart, MessageCircle, Bookmark } from "lucide-react";
import auraLogo from "@/assets/aura-logo.png";

const AuraNavbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img src={auraLogo} alt="Aura Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold">
                <span className="text-primary">AURA</span>
              </h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by mood, artist, or vibe..."
                className="pl-10 pr-4 py-2 w-64 bg-surface-elevated border border-border rounded-lg focus:border-primary/50 focus:outline-none text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="minimal" size="sm">
              Explore
            </Button>
            <Button variant="minimal" size="sm">
              Create
            </Button>
            <Button variant="aura" size="sm">
              Join Aura
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuraNavbar;