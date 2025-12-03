import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#c9a227",
    primaryTextColor: "#f5e6c3",
    primaryBorderColor: "#c9a227",
    lineColor: "#2ecc71",
    secondaryColor: "#1a1a2e",
    tertiaryColor: "#2a2a40",
    background: "#141420",
    mainBkg: "#1a1a2e",
    nodeBorder: "#c9a227",
    clusterBkg: "#2a2a40",
    clusterBorder: "#c9a227",
    titleColor: "#c9a227",
    edgeLabelBackground: "#1a1a2e",
  },
  flowchart: {
    curve: "basis",
    padding: 20,
  },
});

interface InteractiveDiagramProps {
  chart: string;
  title?: string;
  className?: string;
}

export const InteractiveDiagram = ({ chart, title, className }: InteractiveDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        // Clear previous content
        containerRef.current.innerHTML = "";
        setError(null);

        // Generate unique ID
        const id = `mermaid-${Date.now()}`;

        // Render the diagram
        const { svg } = await mermaid.render(id, chart);
        containerRef.current.innerHTML = svg;
        setRendered(true);

        // Add click handlers to nodes
        const nodes = containerRef.current.querySelectorAll(".node");
        nodes.forEach((node) => {
          node.classList.add("cursor-pointer", "transition-all", "hover:opacity-80");
          node.addEventListener("click", () => {
            node.classList.toggle("ring-2");
            node.classList.toggle("ring-gold");
          });
        });
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Failed to render diagram");
      }
    };

    renderDiagram();
  }, [chart]);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleReset = () => setScale(1);

  return (
    <Card className={cn("bg-dungeon-stone p-4 pixel-border overflow-hidden", className)}>
      {title && (
        <h4 className="font-pixel text-sm text-gold mb-4">{title}</h4>
      )}

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleZoomOut}
          className="h-8 w-8 text-foreground hover:text-gold"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleReset}
          className="h-8 w-8 text-foreground hover:text-gold"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleZoomIn}
          className="h-8 w-8 text-foreground hover:text-gold"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <span className="text-xs font-pixel text-muted-foreground self-center ml-2">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Diagram container */}
      <div className="overflow-auto max-h-[400px] bg-background/50 rounded p-4">
        {error ? (
          <p className="text-destructive font-pixel text-xs">{error}</p>
        ) : (
          <div
            ref={containerRef}
            className="transition-transform origin-top-left"
            style={{ transform: `scale(${scale})` }}
          />
        )}
      </div>

      {rendered && (
        <p className="text-xs text-muted-foreground mt-3 font-pixel">
          💡 Click on nodes to highlight them
        </p>
      )}
    </Card>
  );
};

// Pre-built diagram templates for common coding concepts
export const DIAGRAM_TEMPLATES = {
  forLoop: `flowchart TD
    A[Start] --> B{Initialize counter}
    B --> C{Check condition}
    C -->|True| D[Execute body]
    D --> E[Update counter]
    E --> C
    C -->|False| F[End]`,

  ifElse: `flowchart TD
    A[Start] --> B{Condition?}
    B -->|True| C[Execute if block]
    B -->|False| D[Execute else block]
    C --> E[Continue]
    D --> E`,

  whileLoop: `flowchart TD
    A[Start] --> B{Check condition}
    B -->|True| C[Execute body]
    C --> B
    B -->|False| D[End]`,

  function: `flowchart TD
    A[Call function] --> B[Pass arguments]
    B --> C[Execute function body]
    C --> D[Return value]
    D --> E[Continue program]`,

  array: `flowchart LR
    subgraph Array
    A[0] --> B[1]
    B --> C[2]
    C --> D[3]
    D --> E[...]
    end`,

  recursion: `flowchart TD
    A[Call function] --> B{Base case?}
    B -->|Yes| C[Return result]
    B -->|No| D[Process]
    D --> E[Recursive call]
    E --> A`,

  sorting: `flowchart TD
    A[Unsorted Array] --> B{Compare elements}
    B --> C[Swap if needed]
    C --> D{More comparisons?}
    D -->|Yes| B
    D -->|No| E[Sorted Array]`,

  binarySearch: `flowchart TD
    A[Start] --> B[Find middle]
    B --> C{Target = Middle?}
    C -->|Yes| D[Found!]
    C -->|No| E{Target < Middle?}
    E -->|Yes| F[Search left half]
    E -->|No| G[Search right half]
    F --> B
    G --> B`,
};

// Helper to detect diagram type from lesson content
export const detectDiagramType = (lessonContent: string): string | null => {
  const content = lessonContent.toLowerCase();
  
  if (content.includes("for loop") || content.includes("for-loop")) {
    return "forLoop";
  }
  if (content.includes("if") && content.includes("else")) {
    return "ifElse";
  }
  if (content.includes("while loop") || content.includes("while-loop")) {
    return "whileLoop";
  }
  if (content.includes("function") || content.includes("def ")) {
    return "function";
  }
  if (content.includes("array") || content.includes("list")) {
    return "array";
  }
  if (content.includes("recursion") || content.includes("recursive")) {
    return "recursion";
  }
  if (content.includes("sort") || content.includes("sorting")) {
    return "sorting";
  }
  if (content.includes("binary search")) {
    return "binarySearch";
  }
  
  return null;
};
