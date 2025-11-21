import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scroll, Lock, CheckCircle } from "lucide-react";

const Questions = () => {
  // Placeholder questions data
  const questions = [
    { id: 1, title: "Two Sum", difficulty: "Easy", xp: 100, status: "completed" },
    { id: 2, title: "Reverse String", difficulty: "Easy", xp: 100, status: "completed" },
    { id: 3, title: "Binary Search", difficulty: "Medium", xp: 250, status: "available" },
    { id: 4, title: "Merge Sort", difficulty: "Medium", xp: 300, status: "available" },
    { id: 5, title: "Dynamic Programming", difficulty: "Hard", xp: 500, status: "locked" },
    { id: 6, title: "Graph Traversal", difficulty: "Hard", xp: 500, status: "locked" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald text-background";
      case "Medium":
        return "bg-gold text-background";
      case "Hard":
        return "bg-destructive text-foreground";
      default:
        return "bg-muted text-foreground";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-8 text-center leading-relaxed">
          Quest Board
        </h1>

        <div className="grid gap-4">
          {questions.map((quest) => (
            <Card
              key={quest.id}
              className={`bg-card p-4 md:p-6 pixel-border transition-all ${
                quest.status === "locked"
                  ? "opacity-50"
                  : "hover:pixel-border-gold hover:glow-gold cursor-pointer"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {quest.status === "completed" && (
                      <CheckCircle className="w-5 h-5 text-emerald" />
                    )}
                    {quest.status === "locked" && (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                    {quest.status === "available" && (
                      <Scroll className="w-5 h-5 text-gold" />
                    )}
                    <h3 className="text-base md:text-lg font-pixel text-foreground">
                      {quest.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getDifficultyColor(quest.difficulty)} font-pixel text-xs`}>
                      {quest.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-gold text-gold font-pixel text-xs">
                      {quest.xp} XP
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Questions;
