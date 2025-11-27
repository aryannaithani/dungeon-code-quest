import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { ScrollArea } from "@/components/ui/scroll-area";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(
    `def solve(*args):
        # Write your code here
        pass
    `
  );
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
    

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/questions/${id}`);
        if (!response.ok) throw new Error("Failed to fetch question");

        const data = await response.json();
        setQuestion(data);
      } catch (err) {
        console.error(err);
        toast({
          title: "📜 Quest Loading Failed",
          description: "Failed to load question.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const submitSolution = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/questions/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: localStorage.getItem("user_id"),
          code,
          language: "python",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "⚔️ Submission Failed",
          description: data.detail || "Submission failed.",
          variant: "destructive",
        });
        return;
      }

      // Display output if available
      if (data.output) {
        setOutput(data.output);
      }

      toast({
        title: "✨ Quest Complete!",
        description: data.message,
        className: "bg-emerald/10 border-emerald text-foreground",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "⚔️ Submission Error",
        description: "Submission failed.",
        variant: "destructive",
      });
    }
  };

  const testCode = async () => {
    setIsRunning(true);
    setOutput("Running tests...");
    
    try {
      const response = await fetch(`http://localhost:8000/api/questions/${id}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language: "python",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOutput(`❌ Test Failed\n\n${data.detail || "Test execution failed."}`);
        toast({
          title: "⚠️ Test Failed",
          description: "Your code has errors. Check the output below.",
          variant: "destructive",
        });
        return;
      }

      // Format test results
      let resultText = "";
      if (data.results) {
        resultText = data.results.map((result: any, idx: number) => 
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
        title: allPassed ? "✅ All Tests Passed!" : "⚠️ Some Tests Failed",
        description: allPassed ? "Great work! Ready to submit?" : "Check the output for details.",
        className: allPassed ? "bg-emerald/10 border-emerald text-foreground" : undefined,
        variant: allPassed ? undefined : "destructive",
      });
    } catch (err) {
      console.error(err);
      setOutput("❌ Error running tests. Please try again.");
      toast({
        title: "⚔️ Test Error",
        description: "Failed to run tests.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gold font-pixel text-2xl">
        Loading quest...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-pixel text-2xl">
        Quest not found.
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
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-pixel text-gold">{question.title}</h1>
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
                  {question.examples.map((example: any, idx: number) => (
                    <div key={idx} className="bg-muted p-3 rounded mb-2 font-mono text-xs">
                      <div>
                        <strong>Input:</strong> {JSON.stringify(example.input)}
                      </div>
                      <div>
                        <strong>Output:</strong> {JSON.stringify(example.output)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Code Editor Area */}
          <div className="space-y-4">
            <Card className="bg-card p-6 pixel-border">
              <h2 className="text-lg font-pixel text-gold mb-4">Your Solution</h2>

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
                }}
              />

              <div className="flex gap-4 mt-4">
                <Button
                  onClick={submitSolution}
                  disabled={isRunning}
                  className="bg-gold hover:bg-gold-glow text-background font-pixel glow-gold"
                >
                  Submit
                </Button>

                <Button
                  onClick={testCode}
                  disabled={isRunning}
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold hover:text-background font-pixel"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? "Running..." : "Test"}
                </Button>
              </div>
            </Card>

            {/* Output Area */}
            {output && (
              <Card className="bg-card p-6 pixel-border">
                <h2 className="text-lg font-pixel text-gold mb-4">Output</h2>
                <ScrollArea className="h-[200px] w-full pixel-border bg-dungeon-stone p-4">
                  <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                    {output}
                  </pre>
                </ScrollArea>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
