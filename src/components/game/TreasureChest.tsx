import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TreasureChestProps {
  xp: number;
  onClaim: () => void;
  isOpen?: boolean;
}

export const TreasureChest = ({ xp, onClaim, isOpen = true }: TreasureChestProps) => {
  const [opened, setOpened] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const handleOpen = () => {
    setOpened(true);
    setTimeout(() => setShowReward(true), 800);
  };

  const handleClaim = () => {
    onClaim();
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-transparent border-none shadow-none max-w-sm [&>button]:hidden">
        <div className="flex flex-col items-center gap-6">
          {/* Treasure Chest SVG */}
          <div
            className={cn(
              "relative cursor-pointer transition-transform hover:scale-105",
              opened && "animate-chest-shake"
            )}
            onClick={!opened ? handleOpen : undefined}
          >
            <svg
              viewBox="0 0 64 64"
              className="w-48 h-48"
              style={{ imageRendering: "pixelated" }}
            >
              {/* Chest Base */}
              <rect x="8" y="32" width="48" height="24" fill="#8B4513" />
              <rect x="8" y="32" width="48" height="4" fill="#A0522D" />
              <rect x="8" y="52" width="48" height="4" fill="#654321" />
              
              {/* Metal bands */}
              <rect x="8" y="36" width="48" height="4" fill="#C9A227" />
              <rect x="8" y="48" width="48" height="4" fill="#C9A227" />
              
              {/* Lock */}
              <rect x="28" y="40" width="8" height="12" fill="#C9A227" />
              <rect x="30" y="44" width="4" height="4" fill="#1a1a1a" />
              
              {/* Lid */}
              <g className={cn(opened ? "animate-chest-open" : "")}>
                <rect x="8" y="16" width="48" height="20" fill="#8B4513" />
                <rect x="8" y="16" width="48" height="4" fill="#A0522D" />
                <rect x="8" y="32" width="48" height="4" fill="#654321" />
                <rect x="8" y="20" width="48" height="4" fill="#C9A227" />
                <rect x="8" y="28" width="48" height="4" fill="#C9A227" />
                {/* Top curve */}
                <rect x="12" y="12" width="40" height="6" fill="#8B4513" />
                <rect x="16" y="8" width="32" height="6" fill="#8B4513" />
              </g>

              {/* Glow when opened */}
              {opened && (
                <ellipse
                  cx="32"
                  cy="32"
                  rx="16"
                  ry="8"
                  fill="#FFD700"
                  className="animate-pulse"
                  opacity="0.8"
                />
              )}
            </svg>

            {/* Sparkles around chest */}
            {!opened && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-gold animate-sparkle"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${10 + Math.random() * 40}%`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Instructions or Reward */}
          {!opened ? (
            <p className="font-pixel text-sm text-gold text-glow animate-pulse">
              Click to open!
            </p>
          ) : showReward ? (
            <div className="text-center animate-reward-appear">
              <div className="mb-4">
                <p className="font-pixel text-xs text-emerald mb-2">TREASURE FOUND!</p>
                <p className="font-pixel text-4xl text-gold text-glow">+{xp} XP</p>
              </div>
              <Button
                onClick={handleClaim}
                className="bg-gold hover:bg-gold-glow text-background font-pixel glow-gold"
              >
                Claim Reward
              </Button>
            </div>
          ) : (
            <div className="font-pixel text-sm text-gold animate-pulse">
              Opening...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Mini chest for inline rewards
interface MiniChestProps {
  collected?: boolean;
  onClick?: () => void;
}

export const MiniChest = ({ collected = false, onClick }: MiniChestProps) => {
  return (
    <button
      onClick={onClick}
      disabled={collected}
      className={cn(
        "relative w-10 h-10 transition-transform",
        !collected && "hover:scale-110 cursor-pointer animate-bounce",
        collected && "opacity-50 cursor-default"
      )}
    >
      <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
        <rect x="4" y="16" width="24" height="12" fill={collected ? "#666" : "#8B4513"} />
        <rect x="4" y="8" width="24" height="10" fill={collected ? "#555" : "#A0522D"} />
        <rect x="4" y="12" width="24" height="2" fill={collected ? "#888" : "#C9A227"} />
        <rect x="14" y="18" width="4" height="6" fill={collected ? "#888" : "#C9A227"} />
      </svg>
      {!collected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold animate-ping rounded-full" />
      )}
    </button>
  );
};
