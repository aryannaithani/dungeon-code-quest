import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown } from "lucide-react";

const Leaderboard = () => {
  // Placeholder leaderboard data
  const players = [
    { rank: 1, username: "DragonSlayer", level: 50, xp: 25000, title: "Grandmaster" },
    { rank: 2, username: "CodeNinja", level: 45, xp: 22500, title: "Master" },
    { rank: 3, username: "BugHunter", level: 42, xp: 21000, title: "Expert" },
    { rank: 4, username: "AlgoWizard", level: 38, xp: 19000, title: "Veteran" },
    { rank: 5, username: "SyntaxKnight", level: 35, xp: 17500, title: "Veteran" },
    { rank: 6, username: "LoopMaster", level: 32, xp: 16000, title: "Adept" },
    { rank: 7, username: "CodeWarrior", level: 30, xp: 15000, title: "Adept" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-gold" />;
      case 2:
        return <Trophy className="w-6 h-6 text-muted-foreground" />;
      case 3:
        return <Medal className="w-6 h-6 text-emerald" />;
      default:
        return <span className="text-lg font-pixel text-muted-foreground">{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "pixel-border-gold glow-gold";
      case 2:
        return "pixel-border hover:glow-gold";
      case 3:
        return "pixel-border hover:glow-emerald";
      default:
        return "pixel-border";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-8 text-center leading-relaxed">
          Hall of Fame
        </h1>

        <div className="space-y-3">
          {players.map((player) => (
            <Card
              key={player.rank}
              className={`bg-card p-4 md:p-6 transition-all ${getRankClass(player.rank)}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 flex justify-center">
                  {getRankIcon(player.rank)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base md:text-lg font-pixel text-foreground">
                      {player.username}
                    </h3>
                    <Badge className="bg-emerald text-background font-pixel text-xs">
                      {player.title}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="font-pixel">Lvl {player.level}</span>
                    <span className="font-pixel">{player.xp.toLocaleString()} XP</span>
                  </div>
                </div>

                {player.rank <= 3 && (
                  <div className="hidden md:block">
                    <Badge
                      variant="outline"
                      className={`font-pixel text-xs ${
                        player.rank === 1
                          ? "border-gold text-gold"
                          : player.rank === 2
                          ? "border-muted-foreground text-muted-foreground"
                          : "border-emerald text-emerald"
                      }`}
                    >
                      Top {player.rank}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
