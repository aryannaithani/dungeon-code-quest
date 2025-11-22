import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Placeholder question data - will be fetched from backend later
  const question = {
    id,
    title: `Quest #${id}`,
    difficulty: "Medium",
    xp: 100,
    description: "Write a function that solves this epic coding challenge...",
    examples: [
      { input: "example input", output: "example output" }
    ]
  };

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

              <div>
                <h2 className="text-lg font-pixel text-gold mb-2">Examples</h2>
                {question.examples.map((example, idx) => (
                  <div key={idx} className="bg-muted p-3 rounded mb-2 font-mono text-xs">
                    <div><strong>Input:</strong> {example.input}</div>
                    <div><strong>Output:</strong> {example.output}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Code Editor Area */}
          <Card className="bg-card p-6 pixel-border">
            <h2 className="text-lg font-pixel text-gold mb-4">Your Solution</h2>
            <Textarea
              placeholder="// Write your code here..."
              className="font-mono text-sm min-h-[400px] bg-muted border-gold/30 text-foreground"
            />
            <div className="flex gap-4 mt-4">
              <Button className="bg-gold hover:bg-gold-glow text-background font-pixel glow-gold">
                Submit
              </Button>
              <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-background font-pixel">
                Test
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
