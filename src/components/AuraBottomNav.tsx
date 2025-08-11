import { Home, Compass, User, Heart, Palette, ShoppingCart, LogOut } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import auraLogo from "/lovable-uploads/d0a28a13-92b0-4d4d-bbf1-82fbbd68ed03.png";

const AuraBottomNav = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isLandingPage = location.pathname === '/';

  // Landing page gets top nav, other pages get bottom nav
  if (isLandingPage) {
    return (
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border h-14 flex items-center w-full">
        <div className="w-full px-3 sm:px-6">
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center gap-2 sm:gap-4">
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
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navItems = [
    { path: '/feed', icon: Home, label: 'Feed' },
    { path: '/discover', icon: Compass, label: 'Discover' },
    { path: '/vibe-matching', icon: Heart, label: 'Match' },
    { path: '/create', icon: Palette, label: 'Create' },
    { path: '/checkout', icon: ShoppingCart, label: 'Cart' },
    { path: user ? '/profile' : '/login', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default AuraBottomNav;