import { Button } from "@/components/ui/button";
import { Search, Home, Compass, User, Heart, Palette, LogOut, ShoppingCart } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import auraLogo from "/lovable-uploads/d0a28a13-92b0-4d4d-bbf1-82fbbd68ed03.png";
import { useState } from "react";

const AuraNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isLandingPage = location.pathname === '/';
  const [globalQuery, setGlobalQuery] = useState("");

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center w-full" data-full-width={true}>
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/feed" className="flex items-center gap-0.5">
              <img 
                src={auraLogo} 
                alt="Aura logo — mood-based art platform" 
                className="w-8 h-8 sm:w-10 sm:h-10 halo-float" 
              />
              <h1 className="text-lg sm:text-2xl font-bold">
                <span className="text-primary">AURA</span>
              </h1>
            </Link>
            {!isLandingPage && user && (
              <div className="relative flex-1 max-w-md ml-2 mr-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search by mood, artist, or vibe..."
                  aria-label="Global search"
                  className="pl-10 pr-4 py-2 w-full bg-surface-elevated border border-border rounded-lg focus:border-primary/50 focus:outline-none text-sm"
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
                <Link to="/checkout" className="hidden sm:block">
                  <Button variant="minimal" size="sm">
                    Checkout Demo
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
    </nav>
  );
};

export default AuraNavbar;