import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarConfig, HAIR_COLORS, OUTFIT_COLORS, DEFAULT_AVATAR } from "./Avatar";
import { ChevronLeft, ChevronRight, Save, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const HAIR_STYLES = ["Warrior", "Long", "Short", "Wild"];
const OUTFIT_STYLES = ["Knight", "Mage", "Rogue", "Warrior"];
const ACCESSORIES = ["None", "Crown", "Wizard Hat", "Horned Helm", "Eye Patch", "Scarf"];

interface AvatarCustomizerProps {
  currentConfig: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  trigger?: React.ReactNode;
  userLevel?: number;
}

export const AvatarCustomizer = ({
  currentConfig,
  onSave,
  trigger,
  userLevel = 1,
}: AvatarCustomizerProps) => {
  const [config, setConfig] = useState<AvatarConfig>(currentConfig);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"hair" | "outfit" | "accessory" | "colors">("hair");

  const updateConfig = (key: keyof AvatarConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const cycleOption = (key: keyof AvatarConfig, max: number, direction: 1 | -1) => {
    setConfig((prev) => {
      const current = prev[key];
      let next = current + direction;
      if (next < 0) next = max - 1;
      if (next >= max) next = 0;
      return { ...prev, [key]: next };
    });
  };

  const handleSave = () => {
    onSave(config);
    setOpen(false);
  };

  // Unlock items based on level
  const unlockedHairs = Math.min(HAIR_STYLES.length, 2 + Math.floor(userLevel / 5));
  const unlockedOutfits = Math.min(OUTFIT_STYLES.length, 2 + Math.floor(userLevel / 5));
  const unlockedAccessories = Math.min(ACCESSORIES.length, 2 + Math.floor(userLevel / 3));
  const unlockedHairColors = Math.min(HAIR_COLORS.length, 3 + Math.floor(userLevel / 3));
  const unlockedOutfitColors = Math.min(OUTFIT_COLORS.length, 3 + Math.floor(userLevel / 3));

  const tabs = [
    { id: "hair", label: "Hair" },
    { id: "outfit", label: "Outfit" },
    { id: "accessory", label: "Gear" },
    { id: "colors", label: "Colors" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="font-pixel text-xs border-gold text-gold hover:bg-gold hover:text-background">
            <Sparkles className="w-4 h-4 mr-2" />
            Customize
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-gold max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-pixel text-gold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Character Forge
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Preview */}
          <div className="flex justify-center">
            <Avatar config={config} size="xl" animated showBackground />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-dungeon-stone p-1 pixel-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-2 px-3 font-pixel text-xs transition-all",
                  activeTab === tab.id
                    ? "bg-gold text-background"
                    : "text-foreground hover:text-gold"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <Card className="bg-dungeon-stone p-4 pixel-border min-h-[140px]">
            {activeTab === "hair" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs text-foreground">Style</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => cycleOption("hair", unlockedHairs, -1)}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-pixel text-xs text-gold min-w-[80px] text-center">
                      {HAIR_STYLES[config.hair]}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => cycleOption("hair", unlockedHairs, 1)}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {config.hair >= unlockedHairs && (
                  <p className="text-xs text-muted-foreground font-pixel">
                    Unlock at level {5 * (Math.floor(config.hair / 1) + 1)}
                  </p>
                )}
              </div>
            )}

            {activeTab === "outfit" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs text-foreground">Class</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => cycleOption("outfit", unlockedOutfits, -1)}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-pixel text-xs text-gold min-w-[80px] text-center">
                      {OUTFIT_STYLES[config.outfit]}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => cycleOption("outfit", unlockedOutfits, 1)}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "accessory" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs text-foreground">Headgear</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => cycleOption("accessory", unlockedAccessories, -1)}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="font-pixel text-xs text-gold min-w-[80px] text-center">
                      {ACCESSORIES[config.accessory]}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => cycleOption("accessory", unlockedAccessories, 1)}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {config.accessory >= unlockedAccessories && (
                  <p className="text-xs text-destructive font-pixel">
                    🔒 Locked - Reach level {3 * (config.accessory)}
                  </p>
                )}
              </div>
            )}

            {activeTab === "colors" && (
              <div className="space-y-4">
                <div>
                  <span className="font-pixel text-xs text-foreground block mb-2">Hair Color</span>
                  <div className="flex gap-2 flex-wrap">
                    {HAIR_COLORS.slice(0, unlockedHairColors).map((color, i) => (
                      <button
                        key={i}
                        onClick={() => updateConfig("hairColor", i)}
                        className={cn(
                          "w-8 h-8 pixel-border transition-transform hover:scale-110",
                          config.hairColor === i && "ring-2 ring-gold scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {HAIR_COLORS.slice(unlockedHairColors).map((color, i) => (
                      <button
                        key={i + unlockedHairColors}
                        disabled
                        className="w-8 h-8 pixel-border opacity-30 cursor-not-allowed"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-pixel text-xs text-foreground block mb-2">Outfit Color</span>
                  <div className="flex gap-2 flex-wrap">
                    {OUTFIT_COLORS.slice(0, unlockedOutfitColors).map((color, i) => (
                      <button
                        key={i}
                        onClick={() => updateConfig("outfitColor", i)}
                        className={cn(
                          "w-8 h-8 pixel-border transition-transform hover:scale-110",
                          config.outfitColor === i && "ring-2 ring-gold scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {OUTFIT_COLORS.slice(unlockedOutfitColors).map((color, i) => (
                      <button
                        key={i + unlockedOutfitColors}
                        disabled
                        className="w-8 h-8 pixel-border opacity-30 cursor-not-allowed"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="bg-gold hover:bg-gold-glow text-background font-pixel glow-gold"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Character
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
