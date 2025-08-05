import { Button } from "@/components/ui/button";
import { Search, Home, Compass, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import auraLogo from "@/assets/aura-logo.png";

const AuraNavbar = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img src={auraLogo} alt="Aura Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold">
                <span className="text-primary">AURA</span>
              </h1>
            </Link>
            {!isLandingPage && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by mood, artist, or vibe..."
                  className="pl-10 pr-4 py-2 w-64 bg-surface-elevated border border-border rounded-lg focus:border-primary/50 focus:outline-none text-sm"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isLandingPage ? (
              <>
                <Button variant="minimal" size="sm">
                  Explore
                </Button>
                <Button variant="minimal" size="sm">
                  Create
                </Button>
                <Button variant="aura" size="sm">
                  Join Aura
                </Button>
              </>
            ) : (
              <>
                <Link to="/feed">
                  <Button variant={location.pathname === '/feed' ? 'aura' : 'minimal'} size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Feed
                  </Button>
                </Link>
                <Link to="/discover">
                  <Button variant={location.pathname === '/discover' ? 'aura' : 'minimal'} size="sm">
                    <Compass className="w-4 h-4 mr-2" />
                    Discover
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant={location.pathname === '/profile' ? 'aura' : 'minimal'} size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuraNavbar;