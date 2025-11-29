import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Award, Target, LogOut, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, getUserId, clearAuth } from "@/lib/api";
import { ProfileSkeleton } from "@/components/LoadingSkeleton";

interface UserProfile {
  username: string;
  level: number;
  xp: number;
  xpToNext: number;
  rank: string;
  questsCompleted: number;
  totalQuests: number;
  winStreak: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = getUserId();
      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        const data = await api.getProfile(userId);
        setUser({
          username: data.username,
          level: data.level,
          xp: data.xp,
          xpToNext: data.xp_to_next,
          rank: data.rank,
          questsCompleted: data.quests_completed,
          totalQuests: data.total_quests,
          winStreak: data.win_streak,
        });
      } catch (err) {
        toast({
          title: "Profile Error",
          description: "Failed to load hero profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    setLoggingOut(true);
    clearAuth();
    toast({
      title: "Farewell Hero",
      description: "You have successfully logged out.",
      className: "bg-emerald/10 border-emerald text-foreground",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-pixel text-destructive mb-4">Failed to load profile</p>
          <Button
            onClick={() => navigate("/login")}
            className="bg-gold text-background font-pixel"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: Zap, label: "XP", value: user.xp.toLocaleString() },
    { icon: Shield, label: "Level", value: user.level },
    { icon: Award, label: "Rank", value: user.rank },
    { icon: Target, label: "Streak", value: user.winStreak },
  ];

  const xpProgress = Math.min((user.xp / user.xpToNext) * 100, 100);
  const questProgress = user.totalQuests > 0 
    ? Math.min((user.questsCompleted / user.totalQuests) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-pixel text-gold leading-relaxed text-glow">
            Hero Profile
          </h1>
          <Button
            onClick={handleLogout}
            disabled={loggingOut}
            variant="outline"
            className="bg-destructive/10 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-pixel transition-all"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </>
            )}
          </Button>
        </div>

        <Card className="bg-card p-6 md:p-8 pixel-border-gold glow-gold mb-8">
          <div className="text-center mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-dungeon-stone pixel-border-gold mx-auto mb-4 flex items-center justify-center relative overflow-hidden">
              <Shield className="w-12 h-12 md:w-16 md:h-16 text-gold" />
              <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent" />
            </div>
            <h2 className="text-xl md:text-2xl font-pixel text-gold mb-2 text-glow">
              {user.username}
            </h2>
            <Badge className="bg-emerald text-background font-pixel text-xs glow-emerald">
              {user.rank}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-pixel text-foreground mb-2">
                <span>Level {user.level}</span>
                <span>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
              </div>
              <Progress 
                value={xpProgress} 
                className="h-4 bg-dungeon-stone [&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:to-gold-glow" 
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-pixel text-foreground mb-2">
                <span>Quests Progress</span>
                <span>{user.questsCompleted} / {user.totalQuests}</span>
              </div>
              <Progress 
                value={questProgress} 
                className="h-4 bg-dungeon-stone [&>div]:bg-gradient-to-r [&>div]:from-emerald [&>div]:to-emerald-glow" 
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card 
              key={stat.label} 
              className="bg-card p-4 md:p-6 pixel-border hover:pixel-border-gold transition-all hover:glow-gold group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <stat.icon className="w-8 h-8 md:w-12 md:h-12 text-emerald mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-pixel text-muted-foreground text-center mb-2">{stat.label}</p>
              <p className="text-lg md:text-xl font-pixel text-gold text-center">{stat.value}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
