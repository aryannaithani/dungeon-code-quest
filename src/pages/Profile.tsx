import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Award, Target } from "lucide-react";

const Profile = () => {
  // Placeholder static data
  const user = {
    username: "CodeWarrior",
    level: 12,
    xp: 3450,
    xpToNext: 5000,
    rank: "Silver Knight",
    questsCompleted: 47,
    totalQuests: 100,
    winStreak: 5,
  };

  const stats = [
    { icon: Zap, label: "XP", value: user.xp },
    { icon: Shield, label: "Level", value: user.level },
    { icon: Award, label: "Rank", value: user.rank },
    { icon: Target, label: "Streak", value: user.winStreak },
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
            <h2 className="text-xl md:text-2xl font-pixel text-gold mb-2">{user.username}</h2>
            <Badge className="bg-emerald text-background font-pixel text-xs">
              {user.rank}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-pixel text-foreground mb-2">
                <span>Level {user.level}</span>
                <span>{user.xp} / {user.xpToNext} XP</span>
              </div>
              <Progress 
                value={(user.xp / user.xpToNext) * 100} 
                className="h-4 bg-dungeon-stone"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-pixel text-foreground mb-2">
                <span>Quests Progress</span>
                <span>{user.questsCompleted} / {user.totalQuests}</span>
              </div>
              <Progress 
                value={(user.questsCompleted / user.totalQuests) * 100} 
                className="h-4 bg-dungeon-stone"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              className="bg-card p-4 md:p-6 pixel-border hover:pixel-border-gold transition-all hover:glow-gold"
            >
              <stat.icon className="w-8 h-8 md:w-12 md:h-12 text-emerald mx-auto mb-4" />
              <p className="text-xs font-pixel text-muted-foreground text-center mb-2">
                {stat.label}
              </p>
              <p className="text-lg md:text-xl font-pixel text-gold text-center">
                {stat.value}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
