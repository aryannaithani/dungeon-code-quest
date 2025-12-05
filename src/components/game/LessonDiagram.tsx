import { useMemo } from "react";
import { InteractiveDiagram, DIAGRAM_TEMPLATES, detectDiagramType } from "./InteractiveDiagram";

interface LessonDiagramProps {
  lessonContent: string;
  lessonTitle?: string;
  className?: string;
}

/**
 * Automatically detects coding concepts in lesson content
 * and renders an appropriate interactive diagram
 */
export const LessonDiagram = ({ lessonContent, lessonTitle, className }: LessonDiagramProps) => {
  const diagram = useMemo(() => {
    // First try to detect from content
    const detectedType = detectDiagramType(lessonContent);
    
    if (detectedType && DIAGRAM_TEMPLATES[detectedType as keyof typeof DIAGRAM_TEMPLATES]) {
      return {
        chart: DIAGRAM_TEMPLATES[detectedType as keyof typeof DIAGRAM_TEMPLATES],
        title: getDiagramTitle(detectedType),
      };
    }

    // Also check title for hints
    if (lessonTitle) {
      const titleType = detectDiagramType(lessonTitle);
      if (titleType && DIAGRAM_TEMPLATES[titleType as keyof typeof DIAGRAM_TEMPLATES]) {
        return {
          chart: DIAGRAM_TEMPLATES[titleType as keyof typeof DIAGRAM_TEMPLATES],
          title: getDiagramTitle(titleType),
        };
      }
    }

    // Try keyword matching for additional concepts
    const additionalDiagram = detectAdditionalConcepts(lessonContent);
    if (additionalDiagram) {
      return additionalDiagram;
    }

    return null;
  }, [lessonContent, lessonTitle]);

  if (!diagram) return null;

  return (
    <InteractiveDiagram
      chart={diagram.chart}
      title={diagram.title}
      className={className}
    />
  );
};

function getDiagramTitle(type: string): string {
  const titles: Record<string, string> = {
    forLoop: "📊 For Loop Flow",
    ifElse: "📊 If-Else Decision Flow",
    whileLoop: "📊 While Loop Flow",
    function: "📊 Function Execution",
    array: "📊 Array Structure",
    recursion: "📊 Recursion Flow",
    sorting: "📊 Sorting Algorithm",
    binarySearch: "📊 Binary Search Flow",
  };
  return titles[type] || "📊 Concept Diagram";
}

function detectAdditionalConcepts(content: string): { chart: string; title: string } | null {
  const lowerContent = content.toLowerCase();

  // Stack concept
  if (lowerContent.includes("stack") || lowerContent.includes("push") && lowerContent.includes("pop")) {
    return {
      title: "📊 Stack Operations",
      chart: `flowchart TD
    A[Empty Stack] --> B[Push Element]
    B --> C[Element on Top]
    C --> D{Pop?}
    D -->|Yes| E[Remove Top]
    E --> F[Return Element]
    D -->|No| G[Peek Top]
    G --> C`,
    };
  }

  // Queue concept
  if (lowerContent.includes("queue") || (lowerContent.includes("enqueue") && lowerContent.includes("dequeue"))) {
    return {
      title: "📊 Queue Operations",
      chart: `flowchart LR
    A[Enqueue] --> B[Back of Queue]
    B --> C[...]
    C --> D[Front of Queue]
    D --> E[Dequeue]`,
    };
  }

  // Linked list
  if (lowerContent.includes("linked list") || lowerContent.includes("node") && lowerContent.includes("next")) {
    return {
      title: "📊 Linked List Structure",
      chart: `flowchart LR
    A[Head] --> B[Node 1]
    B --> C[Node 2]
    C --> D[Node 3]
    D --> E[null]`,
    };
  }

  // Tree / Binary Tree
  if (lowerContent.includes("tree") || lowerContent.includes("root") && lowerContent.includes("child")) {
    return {
      title: "📊 Binary Tree Structure",
      chart: `flowchart TD
    A[Root] --> B[Left Child]
    A --> C[Right Child]
    B --> D[Left]
    B --> E[Right]
    C --> F[Left]
    C --> G[Right]`,
    };
  }

  // Variables / Assignment
  if (lowerContent.includes("variable") || lowerContent.includes("assignment") || lowerContent.includes("declare")) {
    return {
      title: "📊 Variable Assignment",
      chart: `flowchart TD
    A[Declare Variable] --> B[Assign Value]
    B --> C[Memory Location]
    C --> D[Store Data]
    D --> E[Access by Name]`,
    };
  }

  // Conditional / Boolean
  if (lowerContent.includes("boolean") || lowerContent.includes("true") && lowerContent.includes("false")) {
    return {
      title: "📊 Boolean Logic",
      chart: `flowchart TD
    A[Expression] --> B{Evaluate}
    B -->|True| C[Execute if block]
    B -->|False| D[Skip or else block]`,
    };
  }

  // Input/Output
  if (lowerContent.includes("input") && lowerContent.includes("output") || lowerContent.includes("print")) {
    return {
      title: "📊 Input/Output Flow",
      chart: `flowchart LR
    A[User Input] --> B[Process]
    B --> C[Computation]
    C --> D[Output/Display]`,
    };
  }

  // Try-catch / Error handling
  if (lowerContent.includes("try") && lowerContent.includes("except") || lowerContent.includes("error")) {
    return {
      title: "📊 Error Handling",
      chart: `flowchart TD
    A[Try Block] --> B{Error?}
    B -->|Yes| C[Except Block]
    B -->|No| D[Continue]
    C --> E[Handle Error]
    E --> D`,
    };
  }

  // Loop general
  if (lowerContent.includes("loop") || lowerContent.includes("iterate") || lowerContent.includes("repeat")) {
    return {
      title: "📊 Loop Pattern",
      chart: `flowchart TD
    A[Start] --> B[Initialize]
    B --> C{Condition}
    C -->|True| D[Execute Body]
    D --> E[Update]
    E --> C
    C -->|False| F[Exit Loop]`,
    };
  }

  return null;
}

export default LessonDiagram;
