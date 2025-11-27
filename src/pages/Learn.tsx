import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle2, Sword, GitBranch, Box, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface Dungeon {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  unlocks_at_xp: number;
  required_dungeon: number | null;
  icon: string;
  levels: number[];
}

interface UserProgress {
  completed_levels: number[];
  unlocked_dungeons: number[];
  xp: number;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald/20 text-emerald border-emerald",
  medium: "bg-gold/20 text-gold border-gold",
  hard: "bg-destructive/20 text-destructive border-destructive",
};

const iconMap: Record<string, React.ReactNode> = {
  sword: <Sword className="w-8 h-8" />,
  "git-branch": <GitBranch className="w-8 h-8" />,
  box: <Box className="w-8 h-8" />,
};

const Learn = () => {
  const navigate = useNavigate();
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completed_levels: [],
    unlocked_dungeons: [1],
    xp: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dungeons
        const dungeonsRes = await fetch("http://localhost:8000/api/dungeons");
        const dungeonsData = await dungeonsRes.json();
        setDungeons(dungeonsData);

        // Fetch user progress
        const userId = localStorage.getItem("user_id");
        if (userId) {
          const profileRes = await fetch(`http://localhost:8000/api/profile/${userId}`);
          const profileData = await profileRes.json();
          
          // Calculate unlocked dungeons based on completed levels
          const completedLevels = profileData.completed_levels || [];
          const unlockedDungeons = calculateUnlockedDungeons(dungeonsData, completedLevels);
          
          setUserProgress({
            completed_levels: completedLevels,
            unlocked_dungeons: unlockedDungeons,
            xp: profileData.xp || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateUnlockedDungeons = (dungeons: Dungeon[], completedLevels: number[]): number[] => {
    const unlocked: number[] = [1]; // First dungeon always unlocked
    
    for (const dungeon of dungeons) {
      if (dungeon.required_dungeon) {
        const requiredDungeon = dungeons.find(d => d.id === dungeon.required_dungeon);
        if (requiredDungeon) {
          const allLevelsCompleted = requiredDungeon.levels.every(
            levelId => completedLevels.includes(levelId)
          );
          if (allLevelsCompleted && !unlocked.includes(dungeon.id)) {
            unlocked.push(dungeon.id);
          }
        }
      }
    }
    
    return unlocked;
  };

  const getDungeonProgress = (dungeon: Dungeon): number => {
    const completed = dungeon.levels.filter(
      levelId => userProgress.completed_levels.includes(levelId)
    ).length;
    return Math.round((completed / dungeon.levels.length) * 100);
  };

  const getDungeonStatus = (dungeon: Dungeon): "locked" | "unlocked" | "completed" => {
    const progress = getDungeonProgress(dungeon);
    if (progress === 100) return "completed";
    if (userProgress.unlocked_dungeons.includes(dungeon.id)) return "unlocked";
    return "locked";
  };

  const handleDungeonClick = (dungeon: Dungeon) => {
    const status = getDungeonStatus(dungeon);
    if (status !== "locked") {
      navigate(`/dungeon/${dungeon.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gold mx-auto animate-pulse" />
          <p className="text-sm font-pixel text-gold mt-4">Loading Dungeons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-4 leading-relaxed">
            Dungeon Arena
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Conquer each dungeon to unlock the next. Complete all levels to become a master!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dungeons.map((dungeon) => {
            const status = getDungeonStatus(dungeon);
            const progress = getDungeonProgress(dungeon);
            const isLocked = status === "locked";
            const isCompleted = status === "completed";

            return (
              <Card
                key={dungeon.id}
                onClick={() => handleDungeonClick(dungeon)}
                className={`
                  relative overflow-hidden bg-card p-6 transition-all duration-300
                  ${isLocked 
                    ? "opacity-60 cursor-not-allowed grayscale pixel-border" 
                    : "cursor-pointer pixel-border hover:pixel-border-gold hover:glow-gold"
                  }
                  ${isCompleted ? "pixel-border-emerald glow-emerald" : ""}
                `}
              >
                {/* Status Icon */}
                <div className="absolute top-4 right-4">
                  {isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                  {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald" />}
                </div>

                {/* Dungeon Icon */}
                <div className={`
                  w-16 h-16 rounded-lg flex items-center justify-center mb-4
                  ${isLocked ? "bg-muted text-muted-foreground" : "bg-gold/20 text-gold"}
                  ${isCompleted ? "bg-emerald/20 text-emerald" : ""}
                `}>
                  {iconMap[dungeon.icon] || <Sword className="w-8 h-8" />}
                </div>

                {/* Title & Description */}
                <h3 className={`
                  text-lg font-pixel mb-2 leading-relaxed
                  ${isLocked ? "text-muted-foreground" : "text-foreground"}
                  ${isCompleted ? "text-emerald" : ""}
                `}>
                  {dungeon.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  {dungeon.description}
                </p>

                {/* Difficulty Badge */}
                <Badge 
                  variant="outline" 
                  className={`${difficultyColors[dungeon.difficulty]} mb-4`}
                >
                  {dungeon.difficulty.toUpperCase()}
                </Badge>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-2 ${isCompleted ? "[&>div]:bg-emerald" : "[&>div]:bg-gold"}`}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {dungeon.levels.filter(l => userProgress.completed_levels.includes(l)).length} / {dungeon.levels.length} levels
                  </p>
                </div>

                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs font-pixel text-muted-foreground">
                        Complete previous dungeon
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Learn;
