import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle2, Sword, GitBranch, Box, Sparkles, Layers, Contact, Repeat, Cpu, Network, Blocks, Skull } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

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
  sword: <Sword className="w-5 h-5 md:w-6 md:h-6" />,
  "git-branch": <GitBranch className="w-5 h-5 md:w-6 md:h-6" />,
  box: <Box className="w-5 h-5 md:w-6 md:h-6" />,
  layers: <Layers className="w-5 h-5 md:w-6 md:h-6" />,
  contact: <Contact className="w-5 h-5 md:w-6 md:h-6" />,
  repeat: <Repeat className="w-5 h-5 md:w-6 md:h-6" />,
  cpu: <Cpu className="w-5 h-5 md:w-6 md:h-6" />,
  network: <Network className="w-5 h-5 md:w-6 md:h-6" />,
  blocks: <Blocks className="w-5 h-5 md:w-6 md:h-6" />,
  skull: <Skull className="w-5 h-5 md:w-6 md:h-6" />,
};

// X positions for winding path (percentage from left)
const pathPositions = [15, 50, 85, 60, 25, 70, 40, 80, 30, 55];

const Learn = () => {
  const navigate = useNavigate();
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completed_levels: [],
    unlocked_dungeons: [1],
    xp: 0,
  });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Generate curved SVG path between two points
  const generateCurvedPath = (x1: number, y1: number, x2: number, y2: number) => {
    const midY = (y1 + y2) / 2;
    const controlOffset = Math.abs(x2 - x1) * 0.5;
    
    return `M ${x1} ${y1} C ${x1} ${midY - controlOffset}, ${x2} ${midY + controlOffset}, ${x2} ${y2}`;
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

  const nodeSpacing = 140;
  const svgHeight = dungeons.length * nodeSpacing + 100;

  return (
    <div className="min-h-screen p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-4 leading-relaxed">
            Dungeon Arena
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Conquer each dungeon to unlock the next. Complete all levels to become a master!
          </p>
        </div>

        {/* Dungeon Path Map */}
        <div ref={containerRef} className="relative" style={{ minHeight: svgHeight }}>
          {/* SVG Curved Paths */}
          <svg 
            className="absolute inset-0 w-full pointer-events-none"
            style={{ height: svgHeight }}
            viewBox={`0 0 100 ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pathGradientLocked" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="pathGradientActive" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="pathGradientCompleted" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--emerald))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--emerald))" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Draw paths between dungeons */}
            {dungeons.slice(0, -1).map((dungeon, index) => {
              const nextDungeon = dungeons[index + 1];
              const currentStatus = getDungeonStatus(dungeon);
              const nextStatus = getDungeonStatus(nextDungeon);
              
              const x1 = pathPositions[index % pathPositions.length];
              const y1 = index * nodeSpacing + 70;
              const x2 = pathPositions[(index + 1) % pathPositions.length];
              const y2 = (index + 1) * nodeSpacing + 70;
              
              const isCompleted = currentStatus === "completed";
              const isActive = nextStatus !== "locked";
              
              const gradientId = isCompleted ? "pathGradientCompleted" : isActive ? "pathGradientActive" : "pathGradientLocked";
              
              return (
                <g key={`path-${index}`}>
                  {/* Background glow for active paths */}
                  {isActive && (
                    <path
                      d={generateCurvedPath(x1, y1, x2, y2)}
                      fill="none"
                      stroke={isCompleted ? "hsl(var(--emerald))" : "hsl(var(--gold))"}
                      strokeWidth="4"
                      strokeOpacity="0.2"
                      filter="url(#glow)"
                    />
                  )}
                  {/* Main path */}
                  <path
                    d={generateCurvedPath(x1, y1, x2, y2)}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={isActive ? "none" : "4 4"}
                  />
                </g>
              );
            })}
          </svg>

          {/* Dungeon Nodes */}
          {dungeons.map((dungeon, index) => {
            const status = getDungeonStatus(dungeon);
            const progress = getDungeonProgress(dungeon);
            const isLocked = status === "locked";
            const isCompleted = status === "completed";
            const isUnlocked = status === "unlocked";

            const xPos = pathPositions[index % pathPositions.length];
            const yPos = index * nodeSpacing;

            return (
              <div
                key={dungeon.id}
                className="absolute transition-all duration-300"
                style={{
                  left: `${xPos}%`,
                  top: yPos,
                  transform: "translateX(-50%)",
                }}
              >
                {/* Node */}
                <div
                  onClick={() => handleDungeonClick(dungeon)}
                  className={`
                    relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center
                    transition-all duration-300 border-2 group
                    ${isLocked 
                      ? "bg-muted/50 border-muted-foreground/30 cursor-not-allowed" 
                      : "cursor-pointer hover:scale-110"
                    }
                    ${isCompleted 
                      ? "bg-emerald/20 border-emerald shadow-[0_0_25px_rgba(16,185,129,0.5)]" 
                      : ""
                    }
                    ${isUnlocked 
                      ? "bg-gold/20 border-gold shadow-[0_0_25px_rgba(245,158,11,0.5)]" 
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
                      absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center
                      text-[9px] md:text-[10px] font-pixel border-2
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
                      <Lock className="w-5 h-5 md:w-6 md:h-6" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      iconMap[dungeon.icon] || <Sword className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </div>
                </div>

                {/* Info Card (appears on hover or always visible on mobile) */}
                <div
                  className={`
                    absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 md:w-56 p-3 rounded-lg
                    transition-all duration-300 border z-20
                    opacity-100 md:opacity-0 md:group-hover:opacity-100 md:pointer-events-none md:group-hover:pointer-events-auto
                    ${isLocked 
                      ? "bg-card/95 border-muted-foreground/20" 
                      : isCompleted 
                        ? "bg-card/95 border-emerald/30" 
                        : "bg-card/95 border-gold/30"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className={`
                      text-xs md:text-sm font-pixel leading-relaxed
                      ${isLocked ? "text-muted-foreground" : ""}
                      ${isCompleted ? "text-emerald" : ""}
                      ${isUnlocked ? "text-gold" : ""}
                    `}>
                      {dungeon.title}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`text-[8px] ${difficultyColors[dungeon.difficulty]}`}
                    >
                      {dungeon.difficulty.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-[9px] md:text-[10px] text-muted-foreground mb-2 line-clamp-2">
                    {dungeon.description}
                  </p>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={progress} 
                      className={`h-1.5 flex-1 ${isCompleted ? "[&>div]:bg-emerald" : "[&>div]:bg-gold"}`}
                    />
                    <span className="text-[9px] font-pixel text-muted-foreground">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* End marker */}
          <div 
            className="absolute"
            style={{
              left: `${pathPositions[dungeons.length % pathPositions.length]}%`,
              top: dungeons.length * nodeSpacing,
              transform: "translateX(-50%)",
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-glow flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;
