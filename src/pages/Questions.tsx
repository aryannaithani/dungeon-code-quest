import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scroll, Lock, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Questions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch questions
        const questionsResponse = await fetch("http://localhost:8000/api/questions");
        if (!questionsResponse.ok) throw new Error("Failed to fetch questions");
        const questionsData = await questionsResponse.json();

        // Fetch user profile to get completed questions
        const userId = localStorage.getItem("user_id");
        if (userId) {
          const profileResponse = await fetch(`http://localhost:8000/api/profile/${userId}`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setCompletedQuestions(profileData.completed_questions || []);
            
            // Update question statuses based on completion
            const updatedQuestions = questionsData.map((q: any) => ({
              ...q,
              status: profileData.completed_questions?.includes(q.id) ? "completed" : q.status
            }));
            setQuestions(updatedQuestions);
          } else {
            setQuestions(questionsData);
          }
        } else {
          setQuestions(questionsData);
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "📜 Quest Board Error",
          description: "Failed to load questions.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gold font-pixel text-2xl">
        Loading quests...
      </div>
    );
  }

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
                  : quest.status === "completed"
                  ? "pixel-border-emerald"
                  : "hover:pixel-border-gold hover:glow-gold"
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

                {quest.status !== "locked" && (
                  <Button
                    onClick={() => navigate(`/questions/${quest.id}`)}
                    className={`font-pixel text-xs ${
                      quest.status === "completed"
                        ? "bg-emerald hover:bg-emerald/80 text-background"
                        : "bg-gold hover:bg-gold-glow text-background glow-gold"
                    }`}
                  >
                    {quest.status === "completed" ? "Review" : "Attempt"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Questions;
