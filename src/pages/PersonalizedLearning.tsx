import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, Lock, CheckCircle2, ChevronRight, Loader2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, getUserId, type PersonalizedDungeonResponse } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSkeleton";

const PersonalizedLearning = () => {
  const navigate = useNavigate();
  const [dungeons, setDungeons] = useState<PersonalizedDungeonResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);

  const userId = getUserId();

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [userId, navigate]);

  const fetchData = async () => {
    if (!userId) return;
    
    try {
      const [dungeonsData, countData] = await Promise.all([
        api.getPersonalizedDungeons(userId),
        api.getMistakeCount(userId),
      ]);
      
      setDungeons(dungeonsData);
      setMistakeCount(countData.count);
    } catch (error) {
      toast({
        title: "Failed to Load",
        description: "Could not load personalized dungeons.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDungeon = async () => {
    if (!userId || mistakeCount < 5) return;
    
    setGenerating(true);
    try {
      const result = await api.generatePersonalizedDungeon(parseInt(userId));
      
      toast({
        title: "New Dungeon Created!",
        description: "A personalized dungeon has been added to your learning path!",
      });
      
      // Refresh data
      await fetchData();
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate dungeon.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDungeonClick = (dungeon: PersonalizedDungeonResponse) => {
    navigate(`/personalized/${dungeon._id || dungeon.id}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading Personalized Learning..." />;
  }

  const completedDungeons = dungeons.filter(d => d.is_completed);
  const activeDungeons = dungeons.filter(d => !d.is_completed);

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl md:text-4xl font-pixel text-purple-400 leading-relaxed">
              Personalized Learning
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            AI-generated dungeons tailored to strengthen your weak areas based on your mistakes.
          </p>
        </div>

        {/* Mistake Progress Card */}
        <Card className="p-6 mb-8 bg-card/80 pixel-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-gold" />
              <span className="font-pixel text-sm">Mistake Analysis</span>
            </div>
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              {mistakeCount}/5 mistakes logged
            </Badge>
          </div>
          
          <Progress 
            value={(mistakeCount / 5) * 100} 
            className="h-2 mb-4 [&>div]:bg-purple-500"
          />
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {mistakeCount >= 5 
                ? "Ready to generate a personalized dungeon!" 
                : `${5 - mistakeCount} more mistakes needed for analysis`
              }
            </p>
            
            <Button
              onClick={handleGenerateDungeon}
              disabled={mistakeCount < 5 || generating}
              className="bg-purple-600 hover:bg-purple-700 text-white font-pixel text-xs"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Dungeon
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Active Dungeons */}
        {activeDungeons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-pixel text-gold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Active Dungeons
            </h2>
            <div className="grid gap-4">
              {activeDungeons.map((dungeon) => (
                <Card
                  key={dungeon._id || dungeon.id}
                  onClick={() => handleDungeonClick(dungeon)}
                  className="p-4 bg-card/80 pixel-border hover:pixel-border-gold cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <h3 className="font-pixel text-sm text-foreground">
                          {dungeon.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className="border-purple-500 bg-purple-500/20 text-purple-400 text-[10px]"
                        >
                          AI GENERATED
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {dungeon.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <Progress 
                            value={(dungeon.levels_completed / dungeon.total_levels) * 100} 
                            className="h-1.5 flex-1 max-w-32 [&>div]:bg-purple-500"
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {dungeon.levels_completed}/{dungeon.total_levels} levels
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(dungeon.generated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-4" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Dungeons */}
        {completedDungeons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-pixel text-emerald mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Completed Dungeons
            </h2>
            <div className="grid gap-4">
              {completedDungeons.map((dungeon) => (
                <Card
                  key={dungeon._id || dungeon.id}
                  onClick={() => handleDungeonClick(dungeon)}
                  className="p-4 bg-card/80 pixel-border-emerald cursor-pointer transition-all hover:scale-[1.02] opacity-80"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald" />
                        <h3 className="font-pixel text-sm text-emerald">
                          {dungeon.title}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className="border-emerald bg-emerald/20 text-emerald text-[10px]"
                        >
                          MASTERED
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {dungeon.description}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        Completed on {new Date(dungeon.generated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-4" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {dungeons.length === 0 && (
          <Card className="p-8 text-center bg-card/50 pixel-border">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="font-pixel text-sm text-muted-foreground mb-2">
              No Personalized Dungeons Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Keep practicing! When you make mistakes in dungeons or coding quests, 
              our AI will analyze your weak areas and create personalized training for you.
            </p>
          </Card>
        )}

        {/* Info Section */}
        <Card className="p-6 bg-purple-500/10 border-purple-500/30 mt-8">
          <h3 className="font-pixel text-sm text-purple-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            How It Works
          </h3>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-purple-400">1.</span>
              Practice in the Arena and tackle Coding Quests
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">2.</span>
              Your mistakes are automatically logged for analysis
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">3.</span>
              After 5 mistakes, AI generates a personalized dungeon
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400">4.</span>
              Complete these dungeons to strengthen your weak areas
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default PersonalizedLearning;
