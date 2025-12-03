import { cn } from "@/lib/utils";

export interface AvatarConfig {
  body: number;
  hair: number;
  hairColor: number;
  outfit: number;
  outfitColor: number;
  accessory: number;
  background: number;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  body: 0,
  hair: 0,
  hairColor: 0,
  outfit: 0,
  outfitColor: 0,
  accessory: 0,
  background: 0,
};

// Pixel art color palettes
const HAIR_COLORS = [
  "#3d2817", // Brown
  "#1a1a2e", // Black
  "#d4a574", // Blonde
  "#8b0000", // Red
  "#4a4a8a", // Blue
  "#2d5a27", // Green
  "#6b4c9a", // Purple
  "#c0c0c0", // Silver
];

const OUTFIT_COLORS = [
  "#c9a227", // Gold
  "#2ecc71", // Emerald
  "#3498db", // Blue
  "#9b59b6", // Purple
  "#e74c3c", // Red
  "#1abc9c", // Teal
  "#f39c12", // Orange
  "#34495e", // Dark
];

const BACKGROUNDS = [
  "from-dungeon-stone to-background",
  "from-gold/20 to-background",
  "from-emerald/20 to-background",
  "from-purple-900/30 to-background",
  "from-blue-900/30 to-background",
  "from-red-900/30 to-background",
];

interface AvatarProps {
  config: AvatarConfig;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBackground?: boolean;
  animated?: boolean;
}

export const Avatar = ({
  config,
  size = "md",
  className,
  showBackground = true,
  animated = false,
}: AvatarProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const pixelSizes = {
    sm: 2,
    md: 3,
    lg: 5,
    xl: 8,
  };

  const ps = pixelSizes[size];
  const hairColor = HAIR_COLORS[config.hairColor];
  const outfitColor = OUTFIT_COLORS[config.outfitColor];
  const bgClass = BACKGROUNDS[config.background];

  return (
    <div
      className={cn(
        sizeClasses[size],
        "relative overflow-hidden pixel-border",
        showBackground && `bg-gradient-to-b ${bgClass}`,
        animated && "hover:scale-105 transition-transform",
        className
      )}
    >
      {/* Base Body */}
      <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full">
        {/* Body shadow */}
        <rect x="10" y="20" width="12" height="10" fill="#2a2a40" opacity="0.5" />
        
        {/* Face/Skin */}
        <rect x="11" y="8" width="10" height="10" fill="#f5c99a" />
        <rect x="10" y="9" width="1" height="8" fill="#f5c99a" />
        <rect x="21" y="9" width="1" height="8" fill="#f5c99a" />
        
        {/* Eyes */}
        <rect x="13" y="11" width="2" height="3" fill="#1a1a2e" />
        <rect x="17" y="11" width="2" height="3" fill="#1a1a2e" />
        <rect x="13" y="11" width="1" height="1" fill="#fff" />
        <rect x="17" y="11" width="1" height="1" fill="#fff" />
        
        {/* Mouth */}
        <rect x="14" y="15" width="4" height="1" fill="#c9846a" />
        
        {/* Hair based on style */}
        {config.hair === 0 && (
          <>
            <rect x="10" y="6" width="12" height="4" fill={hairColor} />
            <rect x="9" y="7" width="2" height="6" fill={hairColor} />
            <rect x="21" y="7" width="2" height="6" fill={hairColor} />
          </>
        )}
        {config.hair === 1 && (
          <>
            <rect x="10" y="5" width="12" height="5" fill={hairColor} />
            <rect x="9" y="6" width="2" height="10" fill={hairColor} />
            <rect x="21" y="6" width="2" height="10" fill={hairColor} />
            <rect x="8" y="14" width="2" height="4" fill={hairColor} />
            <rect x="22" y="14" width="2" height="4" fill={hairColor} />
          </>
        )}
        {config.hair === 2 && (
          <>
            <rect x="11" y="6" width="10" height="3" fill={hairColor} />
            <rect x="10" y="7" width="2" height="4" fill={hairColor} />
            <rect x="20" y="7" width="2" height="4" fill={hairColor} />
          </>
        )}
        {config.hair === 3 && (
          <>
            <rect x="9" y="4" width="14" height="6" fill={hairColor} />
            <rect x="8" y="6" width="3" height="12" fill={hairColor} />
            <rect x="21" y="6" width="3" height="12" fill={hairColor} />
          </>
        )}
        
        {/* Outfit based on style */}
        {config.outfit === 0 && (
          <>
            {/* Knight Armor */}
            <rect x="10" y="18" width="12" height="12" fill={outfitColor} />
            <rect x="8" y="20" width="4" height="8" fill={outfitColor} />
            <rect x="20" y="20" width="4" height="8" fill={outfitColor} />
            <rect x="13" y="20" width="6" height="2" fill="#fff" opacity="0.3" />
          </>
        )}
        {config.outfit === 1 && (
          <>
            {/* Mage Robe */}
            <rect x="9" y="18" width="14" height="14" fill={outfitColor} />
            <rect x="12" y="18" width="8" height="3" fill={outfitColor} />
            <rect x="14" y="18" width="4" height="2" fill="#fff" opacity="0.2" />
            {/* Stars on robe */}
            <rect x="11" y="24" width="2" height="2" fill="#ffd700" />
            <rect x="19" y="22" width="2" height="2" fill="#ffd700" />
          </>
        )}
        {config.outfit === 2 && (
          <>
            {/* Rogue Cloak */}
            <rect x="10" y="18" width="12" height="10" fill={outfitColor} />
            <rect x="8" y="19" width="4" height="9" fill={outfitColor} />
            <rect x="20" y="19" width="4" height="9" fill={outfitColor} />
            <rect x="10" y="18" width="12" height="2" fill="#1a1a1a" />
          </>
        )}
        {config.outfit === 3 && (
          <>
            {/* Warrior Plate */}
            <rect x="9" y="18" width="14" height="12" fill={outfitColor} />
            <rect x="7" y="20" width="5" height="8" fill={outfitColor} />
            <rect x="20" y="20" width="5" height="8" fill={outfitColor} />
            {/* Shoulder pads */}
            <rect x="7" y="18" width="4" height="3" fill={outfitColor} />
            <rect x="21" y="18" width="4" height="3" fill={outfitColor} />
            <rect x="13" y="21" width="6" height="4" fill="#c0c0c0" opacity="0.5" />
          </>
        )}
        
        {/* Accessories */}
        {config.accessory === 1 && (
          /* Crown */
          <>
            <rect x="11" y="3" width="10" height="4" fill="#ffd700" />
            <rect x="12" y="1" width="2" height="3" fill="#ffd700" />
            <rect x="15" y="0" width="2" height="4" fill="#ffd700" />
            <rect x="18" y="1" width="2" height="3" fill="#ffd700" />
            <rect x="15" y="1" width="2" height="1" fill="#e74c3c" />
          </>
        )}
        {config.accessory === 2 && (
          /* Wizard Hat */
          <>
            <rect x="8" y="4" width="16" height="3" fill="#4a4a8a" />
            <rect x="12" y="1" width="8" height="4" fill="#4a4a8a" />
            <rect x="14" y="-2" width="4" height="4" fill="#4a4a8a" />
            <rect x="15" y="-3" width="2" height="2" fill="#ffd700" />
          </>
        )}
        {config.accessory === 3 && (
          /* Horned Helmet */
          <>
            <rect x="9" y="5" width="14" height="4" fill="#555" />
            <rect x="8" y="3" width="3" height="6" fill="#555" />
            <rect x="21" y="3" width="3" height="6" fill="#555" />
            <rect x="6" y="0" width="3" height="5" fill="#c0c0c0" />
            <rect x="23" y="0" width="3" height="5" fill="#c0c0c0" />
          </>
        )}
        {config.accessory === 4 && (
          /* Eye Patch */
          <>
            <rect x="12" y="10" width="4" height="4" fill="#1a1a1a" />
            <rect x="10" y="11" width="12" height="1" fill="#1a1a1a" />
          </>
        )}
        {config.accessory === 5 && (
          /* Scarf */
          <>
            <rect x="9" y="17" width="14" height="3" fill="#e74c3c" />
            <rect x="20" y="19" width="3" height="8" fill="#e74c3c" />
          </>
        )}
      </svg>
      
      {/* Animated shine effect */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-50" />
      )}
    </div>
  );
};

export { HAIR_COLORS, OUTFIT_COLORS, BACKGROUNDS };
