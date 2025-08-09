import { Button } from "@/components/ui/button";
import { Search, Home, Compass, User, Heart, Palette, LogOut } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import auraLogo from "@/assets/aura-logo-ring.png";

const AuraNavbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img src={auraLogo} alt="Aura logo" className="w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-lg sm:text-2xl font-bold">
                <span className="text-primary">AURA</span>
              </h1>
            </Link>
            {!isLandingPage && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by mood, artist, or vibe..."
                  className="pl-10 pr-4 py-2 w-64 bg-surface-elevated border border-border rounded-lg focus:border-primary/50 focus:outline-none text-sm"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {isLandingPage ? (
              <>
                <Link to="/vibe-matching" className="hidden sm:block">
                  <Button variant="minimal" size="sm">
                    Find Vibes
                  </Button>
                </Link>
                <Link to="/create" className="hidden sm:block">
                  <Button variant="minimal" size="sm">
                    Create & Earn
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="aura" size="sm" className="text-xs sm:text-sm px-3 sm:px-4">
                    Unlock My Invite
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/feed" className="hidden sm:block">
                  <Button variant={location.pathname === '/feed' ? 'aura' : 'minimal'} size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Feed
                  </Button>
                </Link>
                <Link to="/discover" className="hidden sm:block">
                  <Button variant={location.pathname === '/discover' ? 'aura' : 'minimal'} size="sm">
                    <Compass className="w-4 h-4 mr-2" />
                    Discover
                  </Button>
                </Link>
                <Link to="/vibe-matching" className="hidden sm:block">
                  <Button variant={location.pathname === '/vibe-matching' ? 'aura' : 'minimal'} size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    Match
                  </Button>
                </Link>
                 <Link to="/create" className="hidden sm:block">
                   <Button variant={location.pathname === '/create' ? 'aura' : 'minimal'} size="sm">
                     <Palette className="w-4 h-4 mr-2" />
                     Create
                   </Button>
                 </Link>
                 <Link to="/profile">
                   <Button variant={location.pathname === '/profile' ? 'aura' : 'minimal'} size="sm">
                     <User className="w-4 h-4 sm:mr-2" />
                     <span className="hidden sm:inline">Profile</span>
                   </Button>
                 </Link>
                 {user && (
                   <Button 
                     variant="minimal" 
                     size="sm" 
                     onClick={signOut}
                     className="text-muted-foreground hover:text-foreground"
                   >
                     <LogOut className="w-4 h-4 sm:mr-2" />
                     <span className="hidden sm:inline">Sign Out</span>
                   </Button>
                 )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuraNavbar;