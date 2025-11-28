import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle2, Sword, GitBranch, Box, Sparkles, Layers, Contact, Repeat, Cpu, Network, Blocks, Skull } from "lucide-react";
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
  easy: "border-emerald bg-emerald/20 text-emerald",
  medium: "border-gold bg-gold/20 text-gold",
  hard: "border-destructive bg-destructive/20 text-destructive",
  expert: "border-purple-500 bg-purple-500/20 text-purple-400",
};

const iconMap: Record<string, React.ReactNode> = {
  sword: <Sword className="w-6 h-6 md:w-8 md:h-8" />,
  "git-branch": <GitBranch className="w-6 h-6 md:w-8 md:h-8" />,
  box: <Box className="w-6 h-6 md:w-8 md:h-8" />,
  layers: <Layers className="w-6 h-6 md:w-8 md:h-8" />,
  contact: <Contact className="w-6 h-6 md:w-8 md:h-8" />,
  repeat: <Repeat className="w-6 h-6 md:w-8 md:h-8" />,
  cpu: <Cpu className="w-6 h-6 md:w-8 md:h-8" />,
  network: <Network className="w-6 h-6 md:w-8 md:h-8" />,
  blocks: <Blocks className="w-6 h-6 md:w-8 md:h-8" />,
  skull: <Skull className="w-6 h-6 md:w-8 md:h-8" />,
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
        const dungeonsRes = await fetch("http://localhost:8000/api/dungeons");
        const dungeonsData = await dungeonsRes.json();
        setDungeons(dungeonsData);

        const userId = localStorage.getItem("user_id");
        if (userId) {
          const profileRes = await fetch(`http://localhost:8000/api/profile/${userId}`);
          const profileData = await profileRes.json();
          
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
    const unlocked: number[] = [1];
    
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

  // Get position offset for winding path effect
  const getPositionStyle = (index: number) => {
    const positions = [
      "ml-0", "ml-[15%]", "ml-[30%]", "ml-[20%]", "ml-[5%]",
      "ml-[25%]", "ml-[40%]", "ml-[30%]", "ml-[15%]", "ml-[25%]"
    ];
    return positions[index % positions.length];
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
    <div className="min-h-screen p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-4 leading-relaxed">
            Dungeon Arena
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Conquer each dungeon to unlock the next. Complete all levels to become a master!
          </p>
        </div>

        {/* Dungeon Path Map */}
        <div className="relative pb-8">
          {/* Central vertical line */}
          <div className="absolute left-8 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/50 via-gold/30 to-muted z-0" />
          
          {/* Dungeon Nodes */}
          <div className="relative z-10 space-y-6">
            {dungeons.map((dungeon, index) => {
              const status = getDungeonStatus(dungeon);
              const progress = getDungeonProgress(dungeon);
              const isLocked = status === "locked";
              const isCompleted = status === "completed";
              const isUnlocked = status === "unlocked";
              const nextDungeon = dungeons[index + 1];
              const isNextUnlocked = nextDungeon && getDungeonStatus(nextDungeon) !== "locked";

              return (
                <div key={dungeon.id} className="relative flex items-start gap-4 md:gap-6">
                  {/* Node Circle with connecting line */}
                  <div className="relative flex flex-col items-center">
                    {/* Dungeon Node */}
                    <div
                      onClick={() => handleDungeonClick(dungeon)}
                      className={`
                        relative w-16 h-16 md:w-24 md:h-24 rounded-2xl flex items-center justify-center
                        transition-all duration-300 border-3 z-10
                        ${isLocked 
                          ? "bg-muted/50 border-muted-foreground/30 cursor-not-allowed" 
                          : "cursor-pointer"
                        }
                        ${isCompleted 
                          ? "bg-emerald/20 border-emerald shadow-[0_0_30px_rgba(16,185,129,0.4)]" 
                          : ""
                        }
                        ${isUnlocked 
                          ? "bg-gold/20 border-gold shadow-[0_0_30px_rgba(245,158,11,0.4)]" 
                          : ""
                        }
                      `}
                      style={{
                        animation: isUnlocked ? "pulse 2s ease-in-out infinite" : undefined
                      }}
                    >
                      {/* Dungeon Number */}
                      <div 
                        className={`
                          absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center
                          text-[10px] md:text-xs font-pixel border-2
                          ${isLocked 
                            ? "bg-muted border-muted-foreground/30 text-muted-foreground" 
                            : isCompleted 
                              ? "bg-emerald border-emerald text-white" 
                              : "bg-gold border-gold text-primary-foreground"
                          }
                        `}
                      >
                        {dungeon.id}
                      </div>

                      {/* Icon */}
                      <div className={`
                        ${isLocked ? "text-muted-foreground" : ""}
                        ${isCompleted ? "text-emerald" : ""}
                        ${isUnlocked ? "text-gold" : ""}
                      `}>
                        {isLocked ? (
                          <Lock className="w-6 h-6 md:w-8 md:h-8" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />
                        ) : (
                          iconMap[dungeon.icon] || <Sword className="w-6 h-6 md:w-8 md:h-8" />
                        )}
                      </div>
                    </div>

                    {/* Connecting line to next */}
                    {index < dungeons.length - 1 && (
                      <div 
                        className={`
                          w-0.5 h-6 mt-2
                          ${isNextUnlocked ? "bg-emerald/60" : "bg-muted-foreground/20"}
                        `}
                      />
                    )}
                  </div>

                  {/* Dungeon Info Card */}
                  <div
                    onClick={() => handleDungeonClick(dungeon)}
                    className={`
                      flex-1 p-4 md:p-5 rounded-xl transition-all duration-300 border
                      ${isLocked 
                        ? "opacity-60 cursor-not-allowed bg-muted/20 border-muted-foreground/20" 
                        : "cursor-pointer hover:scale-[1.01]"
                      }
                      ${isCompleted 
                        ? "bg-emerald/5 border-emerald/30 hover:border-emerald/50" 
                        : ""
                      }
                      ${isUnlocked 
                        ? "bg-gold/5 border-gold/30 hover:border-gold/50" 
                        : ""
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className={`
                        text-sm md:text-base font-pixel leading-relaxed
                        ${isLocked ? "text-muted-foreground" : ""}
                        ${isCompleted ? "text-emerald" : ""}
                        ${isUnlocked ? "text-gold" : ""}
                      `}>
                        {dungeon.title}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${difficultyColors[dungeon.difficulty]}`}
                      >
                        {dungeon.difficulty.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-[10px] md:text-xs text-muted-foreground mb-3 line-clamp-2">
                      {dungeon.description}
                    </p>

                    {/* Progress Section */}
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={progress} 
                        className={`h-2 flex-1 ${isCompleted ? "[&>div]:bg-emerald" : "[&>div]:bg-gold"}`}
                      />
                      <span className={`
                        text-xs font-pixel min-w-[3rem] text-right
                        ${isCompleted ? "text-emerald" : isUnlocked ? "text-gold" : "text-muted-foreground"}
                      `}>
                        {progress}%
                      </span>
                    </div>

                    {/* Level count */}
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {dungeon.levels.filter(l => userProgress.completed_levels.includes(l)).length} / {dungeon.levels.length} levels
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* End marker */}
          <div className="flex items-center gap-4 md:gap-6 mt-6">
            <div className="w-16 md:w-24 flex justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gold to-gold-glow flex items-center justify-center">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
            </div>
            <p className="text-xs font-pixel text-muted-foreground">Master all dungeons to achieve greatness!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
