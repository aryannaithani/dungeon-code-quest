import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scroll, Lock, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, getUserId, type Question } from "@/lib/api";
import { QuestListSkeleton } from "@/components/LoadingSkeleton";

const DUNGEON_NAMES: Record<number, string> = {
  1: "Basics Dungeon",
  2: "Control Flow Dungeon",
  3: "Functions Dungeon",
  4: "Data Structures Dungeon",
  5: "OOP Dungeon",
  6: "Recursion Dungeon",
  7: "Algorithms Dungeon",
  8: "Advanced Data Structures",
  9: "Dynamic Programming",
  10: "Final Boss Dungeon",
};

const Questions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = getUserId();
        const questionsData = await api.getQuestions(userId);
        setQuestions(questionsData);
      } catch (err) {
        toast({
          title: "Quest Board Error",
          description: "Failed to load questions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-4 leading-relaxed text-glow">
              Quest Board
            </h1>
          </div>
          <QuestListSkeleton />
        </div>
      </div>
    );
  }

  const availableCount = questions.filter(q => q.status === "available").length;
  const completedCount = questions.filter(q => q.status === "completed").length;
  const lockedCount = questions.filter(q => q.status === "locked").length;

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-4 leading-relaxed text-glow">
            Quest Board
          </h1>
          <p className="text-sm text-muted-foreground mb-4">
            Complete dungeons in the Learn section to unlock more quests!
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="border-emerald text-emerald">
              <CheckCircle className="w-3 h-3 mr-1" />
              {completedCount} Completed
            </Badge>
            <Badge variant="outline" className="border-gold text-gold">
              <Scroll className="w-3 h-3 mr-1" />
              {availableCount} Available
            </Badge>
            <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
              <Lock className="w-3 h-3 mr-1" />
              {lockedCount} Locked
            </Badge>
          </div>
        </div>

        <div className="grid gap-4">
          {questions.map((quest) => (
            <Card
              key={quest.id}
              className={`bg-card p-4 md:p-6 pixel-border transition-all ${
                quest.status === "locked"
                  ? "opacity-50 grayscale"
                  : quest.status === "completed"
                  ? "pixel-border-emerald"
                  : "hover:pixel-border-gold hover:glow-gold"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {quest.status === "completed" && (
                      <CheckCircle className="w-5 h-5 text-emerald shrink-0" />
                    )}
                    {quest.status === "locked" && (
                      <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    {quest.status === "available" && (
                      <Scroll className="w-5 h-5 text-gold shrink-0" />
                    )}
                    <h3 className="text-base md:text-lg font-pixel text-foreground">
                      {quest.title}
                    </h3>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    {quest.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getDifficultyColor(quest.difficulty)} font-pixel text-xs`}>
                      {quest.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-gold text-gold font-pixel text-xs">
                      {quest.xp} XP
                    </Badge>
                    <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground text-xs">
                      {quest.category}
                    </Badge>
                  </div>
                  
                  {/* Show required dungeon for locked quests */}
                  {quest.status === "locked" && quest.required_dungeon && (
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Requires: {DUNGEON_NAMES[quest.required_dungeon] || `Dungeon ${quest.required_dungeon}`}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => quest.status !== "locked" && navigate(`/questions/${quest.id}`)}
                  disabled={quest.status === "locked"}
                  className={`font-pixel text-xs ${
                    quest.status === "completed"
                      ? "bg-emerald hover:bg-emerald/80 text-background"
                      : quest.status === "locked"
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-gold hover:bg-gold-glow text-background glow-gold"
                  }`}
                >
                  {quest.status === "completed" ? "Review" : quest.status === "locked" ? "Locked" : "Attempt"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        {questions.length === 0 && (
          <div className="text-center py-12">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-pixel">
              No quests available yet. Complete dungeons to unlock quests!
            </p>
            <Button 
              onClick={() => navigate("/learn")}
              className="mt-4 bg-gold text-background hover:bg-gold-glow font-pixel"
            >
              Go to Learn
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;
