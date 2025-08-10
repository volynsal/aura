import { Button } from "@/components/ui/button";
import { Search, Home, Compass, User, Heart, Palette, LogOut } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import auraLogo from "@/assets/aura-logo-ring.png";
import { useState } from "react";

const AuraNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isLandingPage = location.pathname === '/';
  const [globalQuery, setGlobalQuery] = useState("");

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-14 sm:h-12 flex items-center">
      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-between min-w-max px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-8 sm:gap-8 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <img src={auraLogo} alt="Aura logo — mood-based art platform" className="w-8 h-8 sm:w-10 sm:h-10" />
              <h1 className="text-xl sm:text-3xl font-bold pr-4 sm:pr-0">
                <span className="text-primary">AURA</span>
              </h1>
            </Link>
            {!isLandingPage && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by mood, artist, or vibe..."
                  aria-label="Global search"
                  className="pl-10 pr-4 py-2 w-64 bg-surface-elevated border border-border rounded-lg focus:border-primary/50 focus:outline-none text-sm"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const q = globalQuery.trim();
                      console.log('Navbar: search submit', { q });
                      if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {isLandingPage ? (
              <>
                <Link to="/vibe-matching">
                  <Button variant="minimal" size="sm" className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 whitespace-nowrap">
                    Find Vibes
                  </Button>
                </Link>
                <Link to="/create">
                  <Button variant="minimal" size="sm" className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 whitespace-nowrap">
                    Create & Earn
                  </Button>
                </Link>
                <Link to="/checkout">
                  <Button variant="minimal" size="sm" className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 whitespace-nowrap">
                    Checkout Demo
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="aura" size="sm" className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2 whitespace-nowrap">
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
                <Link to="/checkout" className="hidden sm:block">
                  <Button variant={location.pathname === '/checkout' ? 'aura' : 'minimal'} size="sm">
                    Checkout
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
                 <Link to={user ? "/profile" : "/login"}>
                   <Button variant={location.pathname === '/profile' ? 'aura' : 'minimal'} size="sm">
                     <User className="w-4 h-4 sm:mr-2" />
                     <span className="hidden sm:inline">Profile</span>
                   </Button>
                 </Link>
                  {user && (
                    <Button 
                      variant="minimal" 
                      size="sm" 
                      onClick={async () => {
                        console.log('🚪 Navbar logout clicked');
                        // Just call signOut - it handles everything including redirect
                        await signOut();
                      }}
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
      {!isLandingPage && (
        <div className="border-t border-border bg-background/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link to="/feed">
              <Button variant={location.pathname === '/feed' ? 'aura' : 'minimal'} size="sm" className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">
                Feed
              </Button>
            </Link>
            <Link to="/discover">
              <Button variant={location.pathname === '/discover' ? 'aura' : 'minimal'} size="sm" className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">
                Discover
              </Button>
            </Link>
            <Link to="/create">
              <Button variant={location.pathname === '/create' ? 'aura' : 'minimal'} size="sm" className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">
                Create & Earn
              </Button>
            </Link>
            <Link to="/checkout">
              <Button variant={location.pathname === '/checkout' ? 'aura' : 'minimal'} size="sm" className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2">
                Checkout Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AuraNavbar;