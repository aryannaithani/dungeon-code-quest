import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface XPAnimationProps {
  xp: number;
  onComplete?: () => void;
}

export const XPAnimation = ({ xp, onComplete }: XPAnimationProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none",
        "animate-xp-float"
      )}
    >
      <div className="flex items-center gap-2 bg-gold/90 px-6 py-3 pixel-border glow-gold">
        <span className="font-pixel text-2xl text-background">+{xp} XP</span>
      </div>
    </div>
  );
};

// Multiple floating XP particles
interface XPParticleProps {
  xp: number;
  x: number;
  y: number;
  onComplete?: () => void;
}

export const XPParticle = ({ xp, x, y, onComplete }: XPParticleProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none animate-xp-particle"
      style={{ left: x, top: y }}
    >
      <span className="font-pixel text-lg text-gold text-glow">+{xp}</span>
    </div>
  );
};

// Level up celebration
interface LevelUpAnimationProps {
  newLevel: number;
  onComplete?: () => void;
}

export const LevelUpAnimation = ({ newLevel, onComplete }: LevelUpAnimationProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background flash */}
      <div className="absolute inset-0 bg-gold/20 animate-pulse" />
      
      {/* Particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-4 h-4 bg-gold animate-level-up-particle"
          style={{
            left: "50%",
            top: "50%",
            animationDelay: `${i * 0.1}s`,
            transform: `rotate(${i * 30}deg) translateY(-100px)`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative animate-level-up-scale">
        <div className="bg-card pixel-border-gold p-8 glow-gold text-center">
          <div className="font-pixel text-sm text-emerald mb-2">LEVEL UP!</div>
          <div className="font-pixel text-6xl text-gold text-glow mb-2">{newLevel}</div>
          <div className="font-pixel text-xs text-foreground">New abilities unlocked!</div>
        </div>
      </div>
    </div>
  );
};
