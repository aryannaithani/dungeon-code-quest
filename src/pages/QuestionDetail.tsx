import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, getUserId, type QuestionDetail as QuestionDetailType } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSkeleton";
import { codeSchema } from "@/lib/validation";

const DEFAULT_CODE = `def solve(*args):
    # Write your code here
    pass
`;

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

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<QuestionDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      
      try {
        const data = await api.getQuestion(id);
        setQuestion(data);
      } catch (err) {
        toast({
          title: "Quest Loading Failed",
          description: "Failed to load question. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const validateCode = useCallback(() => {
    const result = codeSchema.safeParse({ code, language: 'python' });
    if (!result.success) {
      toast({
        title: "Invalid Code",
        description: result.error.errors[0]?.message || "Please check your code.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [code]);

  const submitSolution = async () => {
    if (!id || !validateCode()) return;
    
    setIsSubmitting(true);
    
    try {
      const data = await api.submitQuestion(id, {
        user_id: getUserId(),
        code,
        language: "python",
      });

      // Format submission results
      if (data.results) {
        const resultText = data.results.map((result, idx) => 
          `Test Case ${idx + 1}: ${result.passed ? "✅ PASSED" : "❌ FAILED"}\n` +
          `Input: ${JSON.stringify(result.input)}\n` +
          `Expected: ${JSON.stringify(result.expected)}\n` +
          `Got: ${JSON.stringify(result.output)}\n`
        ).join("\n");
        setOutput(resultText);
      }

      if (data.success) {
        toast({
          title: "Quest Complete!",
          description: `${data.message} (+${data.xp_earned} XP)`,
          className: "bg-emerald/10 border-emerald text-foreground",
        });
      } else {
        // Log mistake for personalized learning
        const userId = getUserId();
        if (userId && question) {
          try {
            const mistakeResult = await api.logMistake({
              user_id: parseInt(userId),
              type: 'coding',
              question_id: question.id,
              question_title: question.title,
              category: question.category,
            });
            
            if (mistakeResult.trigger_generation) {
              toast({
                title: "Performance Logged",
                description: "A personalized dungeon is ready to be generated!",
              });
            }
          } catch (e) {
            // Silently fail - don't interrupt the main flow
          }
        }
        
        toast({
          title: "Not Quite!",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err?.data?.detail || "Submission failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const testCode = async () => {
    if (!id || !validateCode()) return;
    
    setIsRunning(true);
    setOutput("Running tests...");
    
    try {
      const data = await api.testQuestion(id, {
        code,
        language: "python",
      });

      // Format test results
      let resultText = "";
      if (data.results) {
        resultText = data.results.map((result, idx) => 
          `Test Case ${idx + 1}: ${result.passed ? "✅ PASSED" : "❌ FAILED"}\n` +
          `Input: ${JSON.stringify(result.input)}\n` +
          `Expected: ${JSON.stringify(result.expected)}\n` +
          `Got: ${JSON.stringify(result.output)}\n`
        ).join("\n");
      } else {
        resultText = data.output || "Tests completed successfully!";
      }

      setOutput(resultText);
      
      const allPassed = data.all_passed !== false;
      toast({
        title: allPassed ? "All Tests Passed!" : "Some Tests Failed",
        description: allPassed ? "Great work! Ready to submit?" : "Check the output for details.",
        className: allPassed ? "bg-emerald/10 border-emerald text-foreground" : undefined,
        variant: allPassed ? undefined : "destructive",
      });
    } catch (err: any) {
      setOutput(`❌ Error: ${err?.data?.detail || "Test execution failed. Please try again."}`);
      toast({
        title: "Test Error",
        description: "Failed to run tests.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Quest..." />;
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-pixel text-destructive mb-4">Quest not found</p>
          <Button
            onClick={() => navigate("/questions")}
            className="bg-gold text-background font-pixel"
          >
            Return to Quests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate("/questions")}
          className="mb-6 border-gold text-gold hover:bg-gold hover:text-background font-pixel"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quests
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Question Details */}
          <Card className="bg-card p-6 pixel-border h-fit">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h1 className="text-xl md:text-2xl font-pixel text-gold text-glow">{question.title}</h1>
              <Badge className={`${getDifficultyColor(question.difficulty)} font-pixel text-xs`}>
                {question.difficulty}
              </Badge>
              <Badge variant="outline" className="border-gold text-gold font-pixel text-xs">
                {question.xp} XP
              </Badge>
            </div>

            <div className="space-y-4 text-foreground">
              <div>
                <h2 className="text-lg font-pixel text-gold mb-2">Description</h2>
                <p className="text-sm leading-relaxed">{question.description}</p>
              </div>

              {question.examples?.length > 0 && (
                <div>
                  <h2 className="text-lg font-pixel text-gold mb-2">Examples</h2>
                  {question.examples.map((example, idx) => (
                    <div key={idx} className="bg-muted p-3 rounded mb-2 font-mono text-xs">
                      <div>
                        <strong className="text-emerald">Input:</strong> {JSON.stringify(example.input)}
                      </div>
                      <div>
                        <strong className="text-emerald">Output:</strong> {JSON.stringify(example.output)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Output Area */}
              <div className="mt-4">
                <h2 className="text-lg font-pixel text-gold mb-2">Output</h2>
                <ScrollArea className="h-[200px] w-full pixel-border bg-dungeon-stone p-4">
                  <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                    {output || "Run your code to see output here..."}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </Card>

          {/* Code Editor Area */}
          <Card className="bg-card p-6 pixel-border">
            <h2 className="text-lg font-pixel text-gold mb-4">Your Solution</h2>

            <div className="pixel-border overflow-hidden">
              <Editor
                height="400px"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                onClick={submitSolution}
                disabled={isRunning || isSubmitting}
                className="bg-gold hover:bg-gold-glow text-background font-pixel glow-gold flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>

              <Button
                onClick={testCode}
                disabled={isRunning || isSubmitting}
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-background font-pixel flex-1 sm:flex-none"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Test
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
