import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ChevronLeft, CheckCircle2, XCircle, Star, Brain, Loader2 } from "lucide-react";
import { api, getUserId } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSkeleton";
import { parseLesson } from "@/lib/sanitize";

interface QuizQuestion {
  q: string;
  options: string[];
  answer: string;
}

interface PersonalizedLevel {
  title: string;
  lesson: string;
  quiz: {
    questions: QuizQuestion[];
  };
  xp: number;
}

interface PersonalizedDungeon {
  _id: string;
  id: number;
  title: string;
  levels: PersonalizedLevel[];
}

const PersonalizedLevelDetail = () => {
  const { dungeonId, levelIndex } = useParams<{ dungeonId: string; levelIndex: string }>();
  const navigate = useNavigate();
  const [dungeon, setDungeon] = useState<PersonalizedDungeon | null>(null);
  const [level, setLevel] = useState<PersonalizedLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number; xp: number } | null>(null);

  const userId = getUserId();
  const levelIdx = parseInt(levelIndex || "0");

  useEffect(() => {
    const fetchData = async () => {
      if (!dungeonId) return;
      
      try {
        const dungeonData = await api.getPersonalizedDungeon(dungeonId);
        setDungeon(dungeonData);
        
        if (dungeonData.levels && dungeonData.levels[levelIdx]) {
          setLevel(dungeonData.levels[levelIdx]);
          setAnswers(new Array(dungeonData.levels[levelIdx].quiz.questions.length).fill(""));
        }
      } catch (error) {
        toast({
          title: "Failed to Load",
          description: "Could not load level data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dungeonId, levelIdx]);

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!dungeonId || !userId || !level) return;
    
    const unanswered = answers.filter(a => !a).length;
    if (unanswered > 0) {
      toast({
        title: "Incomplete",
        description: `Please answer all ${unanswered} remaining question(s).`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.submitPersonalizedLevel(dungeonId, levelIdx, {
        user_id: parseInt(userId),
        answers,
      });
      
      setResult({
        correct: response.correct,
        total: response.total,
        xp: response.xp_earned,
      });
      setSubmitted(true);
      
      if (response.success) {
        toast({
          title: "Level Complete!",
          description: `You earned ${response.xp_earned} XP!`,
        });
      } else {
        toast({
          title: "Not Quite!",
          description: `You got ${response.correct}/${response.total} correct. Try again!`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Could not submit your answers.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers(new Array(level?.quiz.questions.length || 0).fill(""));
    setSubmitted(false);
    setResult(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading Level..." />;
  }

  if (!dungeon || !level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-pixel text-destructive mb-4">Level not found</p>
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

  const allCorrect = result?.correct === result?.total;

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/personalized/${dungeonId}`)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dungeon
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              PERSONALIZED
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-pixel text-purple-400 leading-relaxed mb-2">
            {level.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dungeon.title} • Level {levelIdx + 1}
          </p>
        </div>

        {/* Lesson Content */}
        {!showQuiz && (
          <Card className="p-6 mb-6 bg-card pixel-border">
            <h2 className="font-pixel text-gold text-sm mb-4">Lesson</h2>
            <div 
              className="prose prose-sm prose-invert max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: parseLesson(level.lesson) }}
            />
            <Button
              onClick={() => setShowQuiz(true)}
              className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-pixel"
            >
              Start Quiz
            </Button>
          </Card>
        )}

        {/* Quiz */}
        {showQuiz && !submitted && (
          <Card className="p-6 bg-card pixel-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-pixel text-gold text-sm">Quiz</h2>
              <Badge variant="outline" className="border-purple-500">
                <Star className="w-3 h-3 mr-1 text-purple-400" />
                {level.xp} XP
              </Badge>
            </div>

            <div className="space-y-8">
              {level.quiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="space-y-4">
                  <p className="text-sm font-medium">
                    <span className="text-purple-400 mr-2">{qIndex + 1}.</span>
                    {question.q}
                  </p>
                  <RadioGroup
                    value={answers[qIndex]}
                    onValueChange={(value) => handleAnswerChange(qIndex, value)}
                    className="space-y-2"
                  >
                    {question.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-purple-500/50 transition-colors"
                      >
                        <RadioGroupItem value={option} id={`q${qIndex}-o${oIndex}`} />
                        <Label
                          htmlFor={`q${qIndex}-o${oIndex}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-pixel"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Answers"
              )}
            </Button>
          </Card>
        )}

        {/* Results */}
        {submitted && result && (
          <Card className={`p-6 text-center ${allCorrect ? "bg-emerald/10 border-emerald/30" : "bg-destructive/10 border-destructive/30"}`}>
            {allCorrect ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-emerald mx-auto mb-4" />
                <h2 className="font-pixel text-emerald text-lg mb-2">Level Complete!</h2>
                <p className="text-muted-foreground mb-2">
                  You got {result.correct}/{result.total} correct
                </p>
                <Badge className="bg-emerald text-white mb-6">
                  <Star className="w-3 h-3 mr-1" />
                  +{result.xp} XP
                </Badge>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/personalized/${dungeonId}`)}
                  >
                    Back to Dungeon
                  </Button>
                  {dungeon.levels[levelIdx + 1] && (
                    <Button
                      onClick={() => navigate(`/personalized/${dungeonId}/level/${levelIdx + 1}`)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Next Level
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h2 className="font-pixel text-destructive text-lg mb-2">Not Quite!</h2>
                <p className="text-muted-foreground mb-6">
                  You got {result.correct}/{result.total} correct. Review the lesson and try again!
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQuiz(false);
                      handleRetry();
                    }}
                  >
                    Review Lesson
                  </Button>
                  <Button
                    onClick={handleRetry}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
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

export default PersonalizedLevelDetail;
