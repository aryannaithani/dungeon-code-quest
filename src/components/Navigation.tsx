import { NavLink } from "./NavLink";
import { Sword, User, Scroll, Trophy, Map, Home, LogIn, UserPlus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Navigation = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  const authItems = [
    { to: "/login", icon: LogIn, label: "Login" },
    { to: "/signup", icon: UserPlus, label: "Sign Up" },
  ];

  const mainItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/questions", icon: Scroll, label: "Quests" },
    { to: "/learn", icon: Map, label: "Arena" },
    { to: "/leaderboard", icon: Trophy, label: "Hall of Fame" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const navItems = isLoggedIn ? mainItems : authItems;

  return (
    <nav className="bg-dungeon-stone pixel-border-gold sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sword className="w-6 h-6 text-gold" />
            <span className="text-gold text-sm md:text-base font-pixel">CodeDungeon</span>
          </div>
          
          <div className="flex gap-2 md:gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 px-2 md:px-4 py-2 text-xs md:text-sm text-foreground hover:text-gold transition-colors"
                activeClassName="text-gold glow-gold"
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
