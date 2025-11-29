import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  Crown,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, getUserId, type LevelDetail as LevelDetailType } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSkeleton";
import { parseLesson } from "@/lib/sanitize";

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald/20 text-emerald border-emerald",
  medium: "bg-gold/20 text-gold border-gold",
  hard: "bg-destructive/20 text-destructive border-destructive",
};

const LevelDetail = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [level, setLevel] = useState<LevelDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"lesson" | "quiz" | "results">("lesson");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<{ correct: number; total: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchLevel = async () => {
      if (!levelId) return;
      
      try {
        const data = await api.getLevel(levelId);
        setLevel(data);
      } catch (error) {
        toast({
          title: "Failed to Load",
          description: "Could not load level data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [levelId, toast]);

  // Safely parse lesson content
  const parsedLesson = useMemo(() => {
    if (!level?.lesson) return "";
    return parseLesson(level.lesson);
  }, [level?.lesson]);

  const handleStartQuiz = () => {
    setPhase("quiz");
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
  };

  const handleNextQuestion = () => {
    if (level && currentQuestion < level.quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!level || !levelId) return;
    
    setSubmitting(true);
    
    try {
      const userId = getUserId();
      
      // Calculate results locally
      let correct = 0;
      level.quiz.questions.forEach((q, index) => {
        if (answers[index] === q.answer) {
          correct++;
        }
      });
      
      const total = level.quiz.questions.length;
      const passed = correct === total;
      
      // Submit to backend
      await api.submitLevel(levelId, {
        user_id: userId ? parseInt(userId) : 0,
        answers: Object.values(answers),
      });
      
      setResults({ correct, total });
      setPhase("results");
      
      if (passed) {
        toast({
          title: "Level Complete!",
          description: `You earned ${level.xp} XP!`,
          className: "bg-emerald/10 border-emerald text-foreground",
        });
      } else {
        toast({
          title: "Not quite!",
          description: "Review the lesson and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setPhase("lesson");
    setAnswers({});
    setResults(null);
    setCurrentQuestion(0);
  };

  if (loading) {
    return <LoadingSpinner message="Loading Level..." />;
  }

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-pixel text-destructive mb-4">Level not found</p>
          <Button
            onClick={() => navigate("/learn")}
            className="bg-gold text-background font-pixel"
          >
            Return to Arena
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/dungeon/${level.dungeon_id}`)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Map
          </Button>
          
          <div className="flex items-center gap-4 flex-wrap">
            {level.is_boss && <Crown className="w-6 h-6 text-gold" />}
            <h1 className="text-xl md:text-2xl font-pixel text-gold leading-relaxed text-glow">
              {level.title}
            </h1>
            <Badge variant="outline" className={difficultyColors[level.difficulty]}>
              {level.difficulty.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className="bg-card border border-gold/50">
              <Star className="w-3 h-3 mr-1 text-gold" />
              {level.xp} XP
            </Badge>
          </div>
        </div>

        {/* Phase Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-2 rounded transition-colors ${phase === "lesson" ? "bg-gold" : "bg-emerald"}`} />
          <div className={`flex-1 h-2 rounded transition-colors ${phase === "quiz" ? "bg-gold" : phase === "results" ? "bg-emerald" : "bg-muted"}`} />
          <div className={`flex-1 h-2 rounded transition-colors ${phase === "results" ? "bg-emerald" : "bg-muted"}`} />
        </div>

        {/* Lesson Phase */}
        {phase === "lesson" && (
          <Card className="bg-card p-6 md:p-8 pixel-border">
            <h2 className="text-lg font-pixel text-emerald mb-6">Lesson</h2>
            
            <div className="prose prose-invert max-w-none mb-8">
              <div 
                className="text-sm text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parsedLesson }}
              />
            </div>
            
            <Button 
              onClick={handleStartQuiz}
              className="w-full bg-gold text-primary-foreground hover:bg-gold-glow font-pixel"
            >
              Start Quiz
            </Button>
          </Card>
        )}

        {/* Quiz Phase */}
        {phase === "quiz" && level.quiz.questions.length > 0 && (
          <Card className="bg-card p-6 md:p-8 pixel-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-pixel text-emerald">Quiz</h2>
              <span className="text-sm text-muted-foreground font-pixel">
                {currentQuestion + 1} / {level.quiz.questions.length}
              </span>
            </div>
            
            <Progress 
              value={((currentQuestion + 1) / level.quiz.questions.length) * 100} 
              className="h-2 mb-6 [&>div]:bg-gold"
            />
            
            <div className="mb-8">
              <p className="text-sm font-pixel text-foreground mb-6 leading-relaxed">
                {level.quiz.questions[currentQuestion].q}
              </p>
              
              <RadioGroup
                value={answers[currentQuestion] || ""}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {level.quiz.questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center space-x-3 p-4 rounded pixel-border cursor-pointer
                      transition-all duration-200
                      ${answers[currentQuestion] === option 
                        ? "pixel-border-gold bg-gold/10" 
                        : "hover:bg-muted"
                      }
                    `}
                    onClick={() => handleAnswer(option)}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="text-sm text-foreground cursor-pointer flex-1"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className="flex-1"
              >
                Previous
              </Button>
              
              {currentQuestion < level.quiz.questions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!answers[currentQuestion]}
                  className="flex-1 bg-gold text-primary-foreground hover:bg-gold-glow"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(answers).length < level.quiz.questions.length || submitting}
                  className="flex-1 bg-emerald text-primary-foreground hover:bg-emerald-glow"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Results Phase */}
        {phase === "results" && results && (
          <Card className="bg-card p-6 md:p-8 pixel-border text-center">
            {results.correct === results.total ? (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald/20 flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-emerald" />
                </div>
                <h2 className="text-2xl font-pixel text-emerald mb-4 text-glow">Victory!</h2>
                <p className="text-sm text-foreground mb-2">
                  You answered all questions correctly!
                </p>
                <p className="text-lg font-pixel text-gold mb-8">
                  +{level.xp} XP Earned
                </p>
                
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/dungeon/${level.dungeon_id}`)}
                    className="flex-1"
                  >
                    Back to Map
                  </Button>
                  <Button
                    onClick={() => navigate(`/dungeon/${level.dungeon_id}`)}
                    className="flex-1 bg-emerald text-primary-foreground hover:bg-emerald-glow"
                  >
                    Continue
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-pixel text-destructive mb-4">Not Quite!</h2>
                <p className="text-sm text-foreground mb-2">
                  You got {results.correct} out of {results.total} correct.
                </p>
                <p className="text-xs text-muted-foreground mb-8">
                  Review the lesson and try again to earn XP.
                </p>
                
                {/* Show answers */}
                <div className="text-left mb-8 space-y-4">
                  {level.quiz.questions.map((q, index) => {
                    const isCorrect = answers[index] === q.answer;
                    return (
                      <div 
                        key={index}
                        className={`p-4 rounded pixel-border ${isCorrect ? "border-emerald" : "border-destructive"}`}
                      >
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald mt-1 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive mt-1 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-foreground mb-2">{q.q}</p>
                            <p className="text-xs text-muted-foreground">
                              Your answer: <span className={isCorrect ? "text-emerald" : "text-destructive"}>{answers[index]}</span>
                            </p>
                            {!isCorrect && (
                              <p className="text-xs text-emerald">
                                Correct: {q.answer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/dungeon/${level.dungeon_id}`)}
                    className="flex-1"
                  >
                    Back to Map
                  </Button>
                  <Button
                    onClick={handleRetry}
                    className="flex-1 bg-gold text-primary-foreground hover:bg-gold-glow"
                  >
                    Try Again
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default LevelDetail;
