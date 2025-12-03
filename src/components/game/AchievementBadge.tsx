import { cn } from "@/lib/utils";
import { Trophy, Flame, Star, Zap, Crown, Shield, Sword, Target, BookOpen, Medal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  progress?: number;
  maxProgress?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  zap: Zap,
  crown: Crown,
  shield: Shield,
  sword: Sword,
  target: Target,
  book: BookOpen,
  medal: Medal,
};

const RARITY_COLORS: Record<string, string> = {
  common: "from-slate-400 to-slate-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-gold to-gold-glow",
};

const RARITY_BORDER: Record<string, string> = {
  common: "border-slate-500",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-gold",
};

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export const AchievementBadge = ({
  achievement,
  size = "md",
  showTooltip = true,
}: AchievementBadgeProps) => {
  const Icon = ICON_MAP[achievement.icon] || Trophy;
  
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  const badge = (
    <div
      className={cn(
        sizeClasses[size],
        "relative flex items-center justify-center rounded-lg border-2 transition-all",
        achievement.unlocked
          ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} ${RARITY_BORDER[achievement.rarity]}`
          : "bg-dungeon-stone border-muted opacity-40",
        achievement.unlocked && achievement.rarity === "legendary" && "animate-pulse shadow-lg shadow-gold/50"
      )}
    >
      <Icon
        className={cn(
          iconSizes[size],
          achievement.unlocked ? "text-white drop-shadow-lg" : "text-muted-foreground"
        )}
      />
      
      {/* Lock overlay for locked achievements */}
      {!achievement.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
          <span className="text-lg">🔒</span>
        </div>
      )}

      {/* Progress indicator */}
      {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
        <div className="absolute -bottom-1 left-1 right-1 h-1 bg-dungeon-stone rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all"
            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
          />
        </div>
      )}

      {/* Shine effect for unlocked */}
      {achievement.unlocked && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 rounded-lg" />
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="bg-card border-gold pixel-border max-w-xs">
        <div className="space-y-1">
          <p className="font-pixel text-xs text-gold">{achievement.name}</p>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-xs text-emerald">
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
          {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
            <p className="text-xs text-muted-foreground">
              Progress: {achievement.progress}/{achievement.maxProgress}
            </p>
          )}
          <p className={cn(
            "text-xs font-pixel capitalize",
            achievement.rarity === "legendary" && "text-gold",
            achievement.rarity === "epic" && "text-purple-400",
            achievement.rarity === "rare" && "text-blue-400",
            achievement.rarity === "common" && "text-slate-400"
          )}>
            {achievement.rarity}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// Grid display for multiple achievements
interface AchievementGridProps {
  achievements: Achievement[];
  columns?: number;
}

export const AchievementGrid = ({ achievements, columns = 5 }: AchievementGridProps) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-pixel text-sm text-foreground">Achievements</h3>
        <span className="font-pixel text-xs text-muted-foreground">
          {unlockedCount}/{achievements.length}
        </span>
      </div>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};

// Default achievements list
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_quest",
    name: "First Steps",
    description: "Complete your first coding quest",
    icon: "star",
    unlocked: false,
    rarity: "common",
  },
  {
    id: "dungeon_master",
    name: "Dungeon Master",
    description: "Complete all levels in a dungeon",
    icon: "sword",
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "flame",
    unlocked: false,
    rarity: "rare",
    progress: 0,
    maxProgress: 7,
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    icon: "flame",
    unlocked: false,
    rarity: "epic",
    progress: 0,
    maxProgress: 30,
  },
  {
    id: "level_10",
    name: "Rising Hero",
    description: "Reach level 10",
    icon: "shield",
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "level_25",
    name: "Veteran",
    description: "Reach level 25",
    icon: "medal",
    unlocked: false,
    rarity: "epic",
  },
  {
    id: "level_50",
    name: "Legend",
    description: "Reach level 50",
    icon: "crown",
    unlocked: false,
    rarity: "legendary",
  },
  {
    id: "quests_10",
    name: "Quest Hunter",
    description: "Complete 10 coding quests",
    icon: "target",
    unlocked: false,
    rarity: "common",
    progress: 0,
    maxProgress: 10,
  },
  {
    id: "quests_50",
    name: "Quest Master",
    description: "Complete 50 coding quests",
    icon: "trophy",
    unlocked: false,
    rarity: "epic",
    progress: 0,
    maxProgress: 50,
  },
  {
    id: "perfect_dungeon",
    name: "Flawless",
    description: "Complete a dungeon with 100% accuracy",
    icon: "zap",
    unlocked: false,
    rarity: "legendary",
  },
];
