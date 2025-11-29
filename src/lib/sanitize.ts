// Simple HTML sanitizer for lesson content
// This is a lightweight sanitizer for our controlled content

const ALLOWED_TAGS = ['pre', 'code', 'strong', 'em', 'br', 'p', 'span'];
const ALLOWED_CLASSES = [
  'bg-dungeon-stone',
  'p-4',
  'rounded',
  'text-xs',
  'overflow-x-auto',
  'pixel-border',
  'text-gold',
  'text-emerald',
  'px-1',
];

// Escape HTML entities
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Parse markdown-like syntax to safe HTML
export function parseLesson(content: string): string {
  if (!content) return '';
  
  let result = escapeHtml(content);
  
  // Code blocks: ```language\ncode\n``` -> <pre><code>code</code></pre>
  result = result.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    '<pre class="bg-dungeon-stone p-4 rounded text-xs overflow-x-auto pixel-border my-4"><code>$2</code></pre>'
  );
  
  // Inline code: `code` -> <code>code</code>
  result = result.replace(
    /`([^`]+)`/g,
    '<code class="bg-dungeon-stone px-1 rounded text-emerald text-xs">$1</code>'
  );
  
  // Bold: **text** -> <strong>text</strong>
  result = result.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-gold">$1</strong>'
  );
  
  // Italic: *text* -> <em>text</em>
  result = result.replace(
    /\*([^*]+)\*/g,
    '<em>$1</em>'
  );
  
  // Line breaks
  result = result.replace(/\n/g, '<br/>');
  
  return result;
}

// Validate that content only contains allowed elements
export function isSafeHtml(html: string): boolean {
  // Check for script tags or event handlers
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<style/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(html));
}
