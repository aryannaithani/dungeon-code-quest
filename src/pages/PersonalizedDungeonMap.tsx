import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, Star, ChevronLeft, Brain, Sparkles } from "lucide-react";
import { api, getUserId } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSkeleton";

interface PersonalizedLevel {
  title: string;
  lesson: string;
  quiz: {
    questions: Array<{
      q: string;
      options: string[];
      answer: string;
    }>;
  };
  xp: number;
}

interface PersonalizedDungeon {
  _id: string;
  id: number;
  user_id: number;
  title: string;
  description: string;
  difficulty: string;
  levels: PersonalizedLevel[];
  generated_at: string;
}

const PersonalizedDungeonMap = () => {
  const { dungeonId } = useParams<{ dungeonId: string }>();
  const navigate = useNavigate();
  const [dungeon, setDungeon] = useState<PersonalizedDungeon | null>(null);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = getUserId();

  useEffect(() => {
    const fetchData = async () => {
      if (!dungeonId || !userId) return;
      
      try {
        const dungeonData = await api.getPersonalizedDungeon(dungeonId);
        setDungeon(dungeonData);

        // Fetch user progress
        const profileData = await api.getProfile(userId);
        setCompletedLevels(profileData.completed_personalized_levels || []);
      } catch (error) {
        toast({
          title: "Failed to Load",
          description: "Could not load dungeon data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dungeonId, userId]);

  const getLevelStatus = (levelIndex: number): "locked" | "unlocked" | "completed" => {
    if (!dungeon) return "locked";
    
    const levelKey = `${dungeon._id || dungeon.id}_${levelIndex}`;
    if (completedLevels.includes(levelKey)) return "completed";
    
    // First level is always unlocked
    if (levelIndex === 0) return "unlocked";
    
    // Level is unlocked if previous level is completed
    const prevLevelKey = `${dungeon._id || dungeon.id}_${levelIndex - 1}`;
    if (completedLevels.includes(prevLevelKey)) {
      return "unlocked";
    }
    
    return "locked";
  };

  const handleLevelClick = (levelIndex: number, status: string) => {
    if (status !== "locked" && dungeon) {
      navigate(`/personalized/${dungeon._id || dungeon.id}/level/${levelIndex}`);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Personalized Dungeon..." />;
  }

  if (!dungeon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-pixel text-destructive mb-4">Dungeon not found</p>
          <Button
            onClick={() => navigate("/personalized")}
            className="bg-purple-600 text-white font-pixel"
          >
            Return to Personalized Learning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/personalized")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Personalized Learning
          </Button>
          
          <div className="text-center">
            <Badge 
              variant="outline" 
              className="border-purple-500 bg-purple-500/20 text-purple-400 mb-4"
            >
              AI GENERATED
            </Badge>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Brain className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl md:text-3xl font-pixel text-purple-400 leading-relaxed">
                {dungeon.title}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {dungeon.description}
            </p>
          </div>
        </div>

        {/* Level Path */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-purple-500/30 -translate-x-1/2 z-0" />
          
          {/* Level Nodes */}
          <div className="relative z-10 space-y-8">
            {dungeon.levels.map((level, index) => {
              const status = getLevelStatus(index);
              const isLocked = status === "locked";
              const isCompleted = status === "completed";
              const isUnlocked = status === "unlocked";
              
              // Alternate left/right for zig-zag effect
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Spacer */}
                  <div className="flex-1" />
                  
                  {/* Level Node */}
                  <div
                    onClick={() => handleLevelClick(index, status)}
                    className={`
                      relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center
                      transition-all duration-300 border-4
                      ${isLocked 
                        ? "bg-muted border-muted-foreground/30 cursor-not-allowed" 
                        : "cursor-pointer hover:scale-110"
                      }
                      ${isCompleted 
                        ? "bg-emerald/20 border-emerald glow-emerald" 
                        : ""
                      }
                      ${isUnlocked 
                        ? "bg-purple-500/20 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse" 
                        : ""
                      }
                    `}
                  >
                    {isLocked && <Lock className="w-6 h-6 text-muted-foreground" />}
                    {isCompleted && <CheckCircle2 className="w-8 h-8 text-emerald" />}
                    {isUnlocked && (
                      <span className="text-xl font-pixel text-purple-400">{index + 1}</span>
                    )}
                    
                    {/* XP Badge */}
                    {!isLocked && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <Badge 
                          variant="secondary" 
                          className="text-[10px] bg-card border border-purple-500/50"
                        >
                          <Star className="w-3 h-3 mr-1 text-purple-400" />
                          {level.xp} XP
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Level Info Card */}
                  <Card
                    className={`
                      flex-1 max-w-xs p-4 transition-all duration-300
                      ${isLocked 
                        ? "opacity-50 bg-muted pixel-border" 
                        : "bg-card pixel-border hover:border-purple-500"
                      }
                      ${isCompleted ? "pixel-border-emerald" : ""}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className={`w-4 h-4 ${isCompleted ? "text-emerald" : "text-purple-400"}`} />
                      <h3 className={`
                        text-sm font-pixel leading-relaxed truncate
                        ${isLocked ? "text-muted-foreground" : "text-foreground"}
                        ${isCompleted ? "text-emerald" : ""}
                      `}>
                        {level.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] border-purple-500 bg-purple-500/20 text-purple-400"
                      >
                        {level.quiz.questions.length} QUESTIONS
                      </Badge>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald font-pixel">COMPLETED</span>
                      )}
                    </div>
                  </Card>
                  
                  {/* Spacer */}
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Message */}
        {dungeon.levels.every((_, i) => getLevelStatus(i) === "completed") && (
          <Card className="mt-8 p-6 text-center bg-emerald/10 border-emerald/30">
            <CheckCircle2 className="w-12 h-12 text-emerald mx-auto mb-4" />
            <h3 className="font-pixel text-emerald mb-2">Dungeon Mastered!</h3>
            <p className="text-sm text-muted-foreground">
              You've conquered this personalized dungeon and strengthened your weak areas!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalizedDungeonMap;
