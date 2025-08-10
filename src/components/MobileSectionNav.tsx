import { Button } from "@/components/ui/button";
import { Home, Compass, ShoppingCart, Heart, Palette } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const MobileSectionNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { path: "/feed", label: "Feed", Icon: Home },
    { path: "/discover", label: "Discover", Icon: Compass },
    { path: "/checkout", label: "Checkout", Icon: ShoppingCart },
    { path: "/vibe-matching", label: "Match", Icon: Heart },
    { path: "/create", label: "Create", Icon: Palette },
  ];

  return (
    <div className="lg:hidden overflow-x-auto scrollbar-hide bg-surface/50 border-b border-border/30">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {items.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <Button
              key={path}
              variant="ghost"
              size="sm"
              aria-label={label}
              className={`whitespace-nowrap hover-scale ${active ? "bg-primary/20 text-primary" : ""}`}
              onClick={() => navigate(path)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileSectionNav;
