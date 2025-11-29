import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sword, Scroll, Trophy, Zap, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/api";

const Landing = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const features = [
    { icon: Sword, title: "Battle Bugs", desc: "Fight coding challenges" },
    { icon: Scroll, title: "Learn Skills", desc: "Master new techniques" },
    { icon: Trophy, title: "Earn Glory", desc: "Top the leaderboard" },
    { icon: Zap, title: "Level Up", desc: "Gain XP and ranks" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8 animate-fade-in">
            <div className="relative inline-block mb-6">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-pixel text-gold text-glow leading-relaxed">
                CodeDungeon
              </h1>
              <div className="absolute -inset-4 bg-gold/5 blur-3xl rounded-full -z-10" />
            </div>
            <p className="text-base md:text-xl text-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Embark on an epic quest to master the ancient arts of code.
              <br className="hidden md:block" />
              Battle monsters, level up, and become a legendary developer.
            </p>
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" 
            style={{ animationDelay: "0.2s" }}
          >
            {isLoggedIn ? (
              <>
                <Button
                  onClick={() => navigate("/learn")}
                  className="bg-gold hover:bg-gold-glow text-background font-pixel text-sm md:text-base px-8 py-6 glow-gold hover:scale-105 transition-all group"
                >
                  Continue Adventure
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => navigate("/profile")}
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold hover:text-background font-pixel text-sm md:text-base px-8 py-6 hover:glow-gold transition-all"
                >
                  View Profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-gold hover:bg-gold-glow text-background font-pixel text-sm md:text-base px-8 py-6 glow-gold hover:scale-105 transition-all group"
                >
                  Enter the Dungeon
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold hover:text-background font-pixel text-sm md:text-base px-8 py-6 hover:glow-gold transition-all"
                >
                  Return Hero
                </Button>
              </>
            )}
          </div>

          {/* Features Grid */}
          <div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 animate-fade-in" 
            style={{ animationDelay: "0.4s" }}
          >
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="bg-card p-4 md:p-6 pixel-border hover:pixel-border-gold transition-all hover:glow-gold group cursor-default"
                style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
              >
                <feature.icon className="w-8 h-8 md:w-12 md:h-12 text-emerald mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xs md:text-sm font-pixel text-gold mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground font-pixel">
        <p>Begin your coding journey today</p>
      </footer>
    </div>
  );
};

export default Landing;
