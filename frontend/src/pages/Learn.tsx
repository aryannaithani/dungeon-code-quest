import { Card } from "@/components/ui/card";
import { Gamepad2, Info } from "lucide-react";

const Learn = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-8 text-center leading-relaxed">
          Training Arena
        </h1>

        <Card className="bg-card p-6 md:p-8 pixel-border-gold glow-gold mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-emerald" />
            <p className="text-sm font-pixel text-foreground leading-relaxed">
              Game Area - Coming Soon
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This is where the interactive Phaser game will be embedded.
            Practice your skills in a gamified environment!
          </p>
        </Card>

        <div className="aspect-video bg-dungeon-stone pixel-border flex items-center justify-center">
          <div className="text-center">
            <Gamepad2 className="w-16 h-16 md:w-24 md:h-24 text-gold mx-auto mb-4 animate-pulse" />
            <p className="text-lg md:text-xl font-pixel text-gold">Game Loading...</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              Placeholder for Phaser integration
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {["Combat Training", "Puzzle Solving", "Speed Challenges"].map((mode, idx) => (
            <Card
              key={idx}
              className="bg-card p-4 pixel-border hover:pixel-border-gold hover:glow-gold transition-all cursor-pointer"
            >
              <h3 className="text-sm font-pixel text-emerald mb-2">{mode}</h3>
              <p className="text-xs text-muted-foreground">Mode {idx + 1}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Learn;
