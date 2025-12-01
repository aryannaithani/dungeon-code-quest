import { NavLink } from "./NavLink";
import { Sword, User, Scroll, Trophy, Map, Home, LogIn, UserPlus, Brain } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { isAuthenticated } from "@/lib/api";

const Navigation = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [location.pathname]);

  const navItems = useMemo(() => {
    if (isLoggedIn) {
      return [
        { to: "/", icon: Home, label: "Home" },
        { to: "/questions", icon: Scroll, label: "Quests" },
        { to: "/learn", icon: Map, label: "Dungeons" },
        { to: "/personalized", icon: Brain, label: "AI Learning" },
        { to: "/leaderboard", icon: Trophy, label: "Hall of Fame" },
        { to: "/profile", icon: User, label: "Profile" },
      ];
    }
    return [
      { to: "/login", icon: LogIn, label: "Login" },
      { to: "/signup", icon: UserPlus, label: "Sign Up" },
    ];
  }, [isLoggedIn]);

  return (
    <nav className="bg-dungeon-stone pixel-border-gold sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <NavLink 
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Sword className="w-6 h-6 text-gold" />
            <span className="text-gold text-sm md:text-base font-pixel text-glow">CodeDungeon</span>
          </NavLink>
          
          <div className="flex gap-1 md:gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-2 md:px-4 py-2 text-xs md:text-sm text-foreground hover:text-gold transition-all hover:bg-gold/5 rounded"
                activeClassName="text-gold bg-gold/10"
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
