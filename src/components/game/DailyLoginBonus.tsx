import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Flame, Sparkles } from "lucide-react";
import { TreasureChest } from "./TreasureChest";
import { XPAnimation } from "./XPAnimation";
import { cn } from "@/lib/utils";

interface DailyLoginBonusProps {
  streak: number;
  xpReward: number;
  onClaim: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const DailyLoginBonus = ({
  streak,
  xpReward,
  onClaim,
  isOpen,
  onClose,
}: DailyLoginBonusProps) => {
  const [showChest, setShowChest] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    setShowChest(true);
  };

  const handleChestComplete = () => {
    setShowChest(false);
    setShowXP(true);
    setClaimed(true);
    onClaim();
  };

  const handleClose = () => {
    setClaimed(false);
    setShowXP(false);
    onClose();
  };

  // Calculate streak bonus
  const streakBonus = Math.min(streak, 7) * 5; // +5 XP per day, max +35
  const totalXP = xpReward + streakBonus;

  // Weekly streak indicators
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      <Dialog open={isOpen && !showChest} onOpenChange={handleClose}>
        <DialogContent className="bg-card border-gold/30 max-w-md">
          <DialogTitle className="sr-only">Daily Login Bonus</DialogTitle>
          
          <div className="text-center py-4">
            {/* Animated Header */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-gold/20 rounded-full animate-pulse" />
              </div>
              <Gift className="w-16 h-16 mx-auto text-gold relative animate-bounce" />
            </div>

            <h2 className="text-xl font-pixel text-gold mb-2 text-glow">
              Daily Login Bonus!
            </h2>
            
            <p className="text-sm text-muted-foreground mb-6">
              Welcome back, hero! Claim your daily reward.
            </p>

            {/* Streak Display */}
            <div className="bg-background/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-destructive animate-pulse" />
                <span className="font-pixel text-lg text-foreground">
                  {streak} Day Streak
                </span>
                <Flame className="w-5 h-5 text-destructive animate-pulse" />
              </div>

              {/* Week Progress */}
              <div className="flex justify-center gap-2 mb-3">
                {weekDays.map((day, idx) => (
                  <div
                    key={day}
                    className={cn(
                      "w-8 h-8 rounded flex items-center justify-center text-xs font-pixel",
                      idx < (streak % 7 || (streak > 0 ? 7 : 0))
                        ? "bg-gold text-background"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {idx < (streak % 7 || (streak > 0 ? 7 : 0)) ? (
                      <Star className="w-4 h-4" />
                    ) : (
                      day[0]
                    )}
                  </div>
                ))}
              </div>

              {streak >= 7 && (
                <Badge className="bg-gold/20 text-gold border border-gold animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  7-Day Streak Bonus Active!
                </Badge>
              )}
            </div>

            {/* Reward Preview */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Base Reward</span>
                <span className="font-pixel text-gold">+{xpReward} XP</span>
              </div>
              {streakBonus > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Streak Bonus</span>
                  <span className="font-pixel text-emerald">+{streakBonus} XP</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="font-pixel text-foreground">Total</span>
                <span className="font-pixel text-lg text-gold">+{totalXP} XP</span>
              </div>
            </div>

            {/* Claim Button */}
            {!claimed ? (
              <Button
                onClick={handleClaim}
                className="w-full bg-gold hover:bg-gold-glow text-background font-pixel text-lg py-6 animate-pulse"
              >
                <Gift className="w-5 h-5 mr-2" />
                Claim Reward!
              </Button>
            ) : (
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full font-pixel"
              >
                Continue Adventure
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Treasure Chest Animation */}
      {showChest && (
        <TreasureChest
          xp={totalXP}
          onClaim={handleChestComplete}
          isOpen={showChest}
        />
      )}

      {/* XP Animation */}
      {showXP && (
        <XPAnimation
          xp={totalXP}
          onComplete={() => setShowXP(false)}
        />
      )}
    </>
  );
};

// Hook to check and manage daily login
export const useDailyLogin = (userId: string | null) => {
  const [showBonus, setShowBonus] = useState(false);
  const [bonusData, setBonusData] = useState<{
    streak: number;
    xp: number;
  } | null>(null);

  const checkDailyLogin = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/daily-login/${userId}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.show_bonus) {
          setBonusData({
            streak: data.streak,
            xp: data.xp_reward,
          });
          setShowBonus(true);
        }
      }
    } catch (error) {
      console.error("Daily login check failed:", error);
    }
  };

  const claimBonus = async () => {
    if (!userId) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/daily-login/${userId}/claim`,
        { method: 'POST' }
      );
    } catch (error) {
      console.error("Claim bonus failed:", error);
    }
  };

  const closeBonus = () => {
    setShowBonus(false);
    setBonusData(null);
  };

  return {
    showBonus,
    bonusData,
    checkDailyLogin,
    claimBonus,
    closeBonus,
  };
};
