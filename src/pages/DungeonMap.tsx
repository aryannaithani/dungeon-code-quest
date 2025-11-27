import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, Star, ChevronLeft, Sparkles, Crown } from "lucide-react";

interface Level {
  id: number;
  dungeon_id: number;
  title: string;
  xp: number;
  difficulty: string;
  is_boss?: boolean;
}

interface Dungeon {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  levels: number[];
}

const difficultyColors: Record<string, string> = {
  easy: "border-emerald bg-emerald/20",
  medium: "border-gold bg-gold/20",
  hard: "border-destructive bg-destructive/20",
};

const DungeonMap = () => {
  const { dungeonId } = useParams();
  const navigate = useNavigate();
  const [dungeon, setDungeon] = useState<Dungeon | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dungeon details
        const dungeonRes = await fetch(`http://localhost:8000/api/dungeons/${dungeonId}`);
        const dungeonData = await dungeonRes.json();
        setDungeon(dungeonData);

        // Fetch levels for this dungeon
        const levelsRes = await fetch(`http://localhost:8000/api/dungeons/${dungeonId}/levels`);
        const levelsData = await levelsRes.json();
        setLevels(levelsData);

        // Fetch user progress
        const userId = localStorage.getItem("user_id");
        if (userId) {
          const profileRes = await fetch(`http://localhost:8000/api/profile/${userId}`);
          const profileData = await profileRes.json();
          setCompletedLevels(profileData.completed_levels || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dungeonId]);

  const getLevelStatus = (level: Level, index: number): "locked" | "unlocked" | "completed" => {
    if (completedLevels.includes(level.id)) return "completed";
    
    // First level is always unlocked
    if (index === 0) return "unlocked";
    
    // Level is unlocked if previous level is completed
    const previousLevel = levels[index - 1];
    if (previousLevel && completedLevels.includes(previousLevel.id)) {
      return "unlocked";
    }
    
    return "locked";
  };

  const handleLevelClick = (level: Level, status: string) => {
    if (status !== "locked") {
      navigate(`/level/${level.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-gold mx-auto animate-pulse" />
          <p className="text-sm font-pixel text-gold mt-4">Loading Map...</p>
        </div>
      </div>
    );
  }

  if (!dungeon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm font-pixel text-destructive">Dungeon not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/learn")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dungeons
          </Button>
          
          <div className="text-center">
            <Badge 
              variant="outline" 
              className={`${difficultyColors[dungeon.difficulty]} mb-4`}
            >
              {dungeon.difficulty.toUpperCase()}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-pixel text-gold mb-2 leading-relaxed">
              {dungeon.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {dungeon.description}
            </p>
          </div>
        </div>

        {/* Level Path */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border -translate-x-1/2 z-0" />
          
          {/* Level Nodes */}
          <div className="relative z-10 space-y-8">
            {levels.map((level, index) => {
              const status = getLevelStatus(level, index);
              const isLocked = status === "locked";
              const isCompleted = status === "completed";
              const isUnlocked = status === "unlocked";
              const isBoss = level.is_boss;
              
              // Alternate left/right for zig-zag effect
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={level.id}
                  className={`flex items-center gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Spacer */}
                  <div className="flex-1" />
                  
                  {/* Level Node */}
                  <div
                    onClick={() => handleLevelClick(level, status)}
                    className={`
                      relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center
                      transition-all duration-300 border-4
                      ${isLocked 
                        ? "bg-muted border-muted-foreground/30 cursor-not-allowed" 
                        : "cursor-pointer"
                      }
                      ${isCompleted 
                        ? "bg-emerald/20 border-emerald glow-emerald" 
                        : ""
                      }
                      ${isUnlocked 
                        ? "bg-gold/20 border-gold glow-gold animate-pulse" 
                        : ""
                      }
                      ${isBoss && !isLocked 
                        ? "w-24 h-24 md:w-28 md:h-28 border-destructive bg-destructive/20" 
                        : ""
                      }
                    `}
                  >
                    {isLocked && <Lock className="w-6 h-6 text-muted-foreground" />}
                    {isCompleted && <CheckCircle2 className="w-8 h-8 text-emerald" />}
                    {isUnlocked && !isBoss && (
                      <span className="text-xl font-pixel text-gold">{index + 1}</span>
                    )}
                    {isUnlocked && isBoss && (
                      <Crown className="w-8 h-8 text-gold" />
                    )}
                    {isCompleted && isBoss && (
                      <Crown className="w-8 h-8 text-emerald" />
                    )}
                    
                    {/* XP Badge */}
                    {!isLocked && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] bg-card border border-gold/50"
                        >
                          <Star className="w-3 h-3 mr-1 text-gold" />
                          {level.xp} XP
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Level Info Card */}
                  <Card
                    className={`
                      flex-1 max-w-xs p-4 transition-all duration-300
                      ${isLocked 
                        ? "opacity-50 bg-muted pixel-border" 
                        : "bg-card pixel-border hover:pixel-border-gold"
                      }
                      ${isCompleted ? "pixel-border-emerald" : ""}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {isBoss && (
                        <Crown className={`w-4 h-4 ${isCompleted ? "text-emerald" : "text-gold"}`} />
                      )}
                      <h3 className={`
                        text-sm font-pixel leading-relaxed
                        ${isLocked ? "text-muted-foreground" : "text-foreground"}
                        ${isCompleted ? "text-emerald" : ""}
                      `}>
                        {level.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${difficultyColors[level.difficulty]}`}
                      >
                        {level.difficulty.toUpperCase()}
                      </Badge>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald font-pixel">COMPLETED</span>
                      )}
                    </div>
                  </Card>
                  
                  {/* Spacer */}
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DungeonMap;
