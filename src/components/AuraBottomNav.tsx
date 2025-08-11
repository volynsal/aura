import { Home, Compass, User, Heart, Palette, ShoppingCart } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AuraBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Only show bottom nav if user is logged in
  if (!user) {
    return null;
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