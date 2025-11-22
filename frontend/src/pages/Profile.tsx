import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Award, Target } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          navigate("/login");
          return;
        }

        const response = await fetch(`http://localhost:8000/api/profile/${user_id}`);

        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gold font-pixel text-2xl">
        Loading hero data...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-pixel text-2xl">
        Failed to load profile.
      </div>
    );
  }

  // Map backend snake_case to frontend camelCase
  const formattedUser = {
    username: user.username,
    level: user.level,
    xp: user.xp,
    xpToNext: user.xp_to_next,
    rank: user.rank,
    questsCompleted: user.quests_completed,
    totalQuests: user.total_quests,
    winStreak: user.win_streak,
  };

  const stats = [
    { icon: Zap, label: "XP", value: formattedUser.xp },
    { icon: Shield, label: "Level", value: formattedUser.level },
    { icon: Award, label: "Rank", value: formattedUser.rank },
    { icon: Target, label: "Streak", value: formattedUser.winStreak },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-8 text-center leading-relaxed">
          Hero Profile
        </h1>

        <Card className="bg-card p-6 md:p-8 pixel-border-gold glow-gold mb-8">
          <div className="text-center mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-dungeon-stone pixel-border-gold mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-12 h-12 md:w-16 md:h-16 text-gold" />
            </div>
            <h2 className="text-xl md:text-2xl font-pixel text-gold mb-2">{formattedUser.username}</h2>
            <Badge className="bg-emerald text-background font-pixel text-xs">
              {formattedUser.rank}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-pixel text-foreground mb-2">
                <span>Level {formattedUser.level}</span>
                <span>{formattedUser.xp} / {formattedUser.xpToNext} XP</span>
              </div>
              <Progress value={(formattedUser.xp / formattedUser.xpToNext) * 100} className="h-4 bg-dungeon-stone" />
            </div>

            <div>
              <div className="flex justify-between text-sm font-pixel text-foreground mb-2">
                <span>Quests Progress</span>
                <span>{formattedUser.questsCompleted} / {formattedUser.totalQuests}</span>
              </div>
              <Progress value={(formattedUser.questsCompleted / formattedUser.totalQuests) * 100} className="h-4 bg-dungeon-stone" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-card p-4 md:p-6 pixel-border hover:pixel-border-gold transition-all hover:glow-gold">
              <stat.icon className="w-8 h-8 md:w-12 md:h-12 text-emerald mx-auto mb-4" />
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
