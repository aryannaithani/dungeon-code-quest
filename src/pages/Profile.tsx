import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Award, LogOut, Loader2, Sword, Scroll, Flame, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, getUserId, clearAuth } from "@/lib/api";
import { ProfileSkeleton } from "@/components/LoadingSkeleton";
import { Avatar, AvatarConfig, DEFAULT_AVATAR, AvatarCustomizer } from "@/components/game";
import { AchievementGrid, Achievement, DEFAULT_ACHIEVEMENTS } from "@/components/game";

interface UserProfile {
  username: string;
  level: number;
  xp: number;
  xpToNext: number;
  xpInCurrentLevel: number;
  rank: string;
  questsCompleted: number;
  totalQuests: number;
  dungeonsCompleted: number;
  totalDungeons: number;
  winStreak: number;
  avatar?: AvatarConfig;
  achievements?: Achievement[];
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = getUserId();
      if (!userId) {
        navigate("/login");
        return;
      }

      try {
        const data = await api.getProfile(userId);
        
        const xpInCurrentLevel = data.xp_in_current_level ?? data.xp;
        
        // Parse avatar config if stored
        const avatar = data.avatar ? (typeof data.avatar === 'string' ? JSON.parse(data.avatar) : data.avatar) : DEFAULT_AVATAR;
        setAvatarConfig(avatar);
        
        // Build achievements from user data
        const achievements = buildAchievements(data);
        
        setUser({
          username: data.username,
          level: data.level,
          xp: data.xp,
          xpToNext: data.xp_to_next,
          xpInCurrentLevel: xpInCurrentLevel,
          rank: data.rank,
          questsCompleted: data.quests_completed,
          totalQuests: data.total_quests,
          dungeonsCompleted: data.dungeons_completed ?? 0,
          totalDungeons: data.total_dungeons ?? 0,
          winStreak: data.win_streak,
          avatar: avatar,
          achievements: achievements,
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

  const buildAchievements = (data: any): Achievement[] => {
    const achievements = [...DEFAULT_ACHIEVEMENTS];
    
    // Update achievements based on user data
    achievements.forEach((a) => {
      switch (a.id) {
        case "first_quest":
          a.unlocked = data.quests_completed > 0;
          break;
        case "dungeon_master":
          a.unlocked = data.dungeons_completed > 0;
          break;
        case "streak_7":
          a.progress = Math.min(data.win_streak, 7);
          a.unlocked = data.win_streak >= 7;
          break;
        case "streak_30":
          a.progress = Math.min(data.win_streak, 30);
          a.unlocked = data.win_streak >= 30;
          break;
        case "level_10":
          a.unlocked = data.level >= 10;
          break;
        case "level_25":
          a.unlocked = data.level >= 25;
          break;
        case "level_50":
          a.unlocked = data.level >= 50;
          break;
        case "quests_10":
          a.progress = Math.min(data.quests_completed, 10);
          a.unlocked = data.quests_completed >= 10;
          break;
        case "quests_50":
          a.progress = Math.min(data.quests_completed, 50);
          a.unlocked = data.quests_completed >= 50;
          break;
      }
    });
    
    return achievements;
  };

  const handleAvatarSave = async (newConfig: AvatarConfig) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      await api.updateAvatar(userId, newConfig);
      setAvatarConfig(newConfig);
      toast({
        title: "Character Updated!",
        description: "Your hero's appearance has been saved.",
        className: "bg-emerald/10 border-emerald text-foreground",
      });
    } catch (err) {
      toast({
        title: "Save Failed",
        description: "Could not save character. Try again.",
        variant: "destructive",
      });
    }
  };

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
    { icon: Zap, label: "Total XP", value: user.xp.toLocaleString(), color: "text-gold" },
    { icon: Award, label: "Rank", value: user.rank, color: "text-gold" },
    { icon: Flame, label: "Streak", value: `${user.winStreak} 🔥`, color: "text-destructive" },
    { icon: Sword, label: "Dungeons", value: user.dungeonsCompleted, color: "text-emerald" },
  ];

  const xpProgress = user.xpToNext > 0 
    ? Math.min((user.xpInCurrentLevel / user.xpToNext) * 100, 100)
    : 0;
    
  const questProgress = user.totalQuests > 0 
    ? Math.min((user.questsCompleted / user.totalQuests) * 100, 100)
    : 0;
    
  const dungeonProgress = user.totalDungeons > 0
    ? Math.min((user.dungeonsCompleted / user.totalDungeons) * 100, 100)
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
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <Avatar config={avatarConfig} size="xl" animated showBackground />
              <AvatarCustomizer
                currentConfig={avatarConfig}
                onSave={handleAvatarSave}
                userLevel={user.level}
                trigger={
                  <Button variant="outline" size="sm" className="font-pixel text-xs border-gold text-gold hover:bg-gold hover:text-background">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Customize
                  </Button>
                }
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-pixel text-gold mb-2 text-glow">
                {user.username}
              </h2>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <Badge className="bg-emerald text-background font-pixel text-xs glow-emerald">
                  Level {user.level}
                </Badge>
                <Badge className="bg-gold/20 text-gold font-pixel text-xs border border-gold">
                  {user.rank}
                </Badge>
              </div>
              
              {/* Streak Display */}
              {user.winStreak > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <Flame className="w-5 h-5 text-destructive animate-pulse" />
                  <span className="font-pixel text-sm text-destructive">
                    {user.winStreak} Day Streak!
                  </span>
                  <Flame className="w-5 h-5 text-destructive animate-pulse" />
                </div>
              )}

              {/* XP Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-pixel text-muted-foreground mb-2">
                  <span>{user.xpInCurrentLevel.toLocaleString()} XP</span>
                  <span>{user.xpToNext.toLocaleString()} XP to Level {user.level + 1}</span>
                </div>
                <Progress 
                  value={xpProgress} 
                  className="h-4 bg-dungeon-stone [&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:to-gold-glow" 
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Bars */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-card p-4 pixel-border hover:pixel-border-emerald transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Sword className="w-4 h-4 text-emerald" />
              <span className="text-sm font-pixel text-foreground">Dungeon Conquest</span>
            </div>
            <div className="flex justify-between text-xs font-pixel text-muted-foreground mb-2">
              <span>{user.dungeonsCompleted} Cleared</span>
              <span>{user.totalDungeons} Total</span>
            </div>
            <Progress 
              value={dungeonProgress} 
              className="h-3 bg-dungeon-stone [&>div]:bg-gradient-to-r [&>div]:from-emerald [&>div]:to-emerald-glow" 
            />
          </Card>

          <Card className="bg-card p-4 pixel-border hover:pixel-border-gold transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Scroll className="w-4 h-4 text-gold" />
              <span className="text-sm font-pixel text-foreground">Quest Mastery</span>
            </div>
            <div className="flex justify-between text-xs font-pixel text-muted-foreground mb-2">
              <span>{user.questsCompleted} Completed</span>
              <span>{user.totalQuests} Total</span>
            </div>
            <Progress 
              value={questProgress} 
              className="h-3 bg-dungeon-stone [&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:to-emerald" 
            />
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <Card 
              key={stat.label} 
              className="bg-card p-4 md:p-6 pixel-border hover:pixel-border-gold transition-all hover:glow-gold group"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <stat.icon className={`w-8 h-8 md:w-12 md:h-12 ${stat.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
              <p className="text-xs font-pixel text-muted-foreground text-center mb-2">{stat.label}</p>
              <p className="text-lg md:text-xl font-pixel text-gold text-center">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        {user.achievements && (
          <Card className="bg-card p-6 pixel-border">
            <AchievementGrid achievements={user.achievements} columns={5} />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
