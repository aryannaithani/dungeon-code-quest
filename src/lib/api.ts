// Centralized API configuration and utilities

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { retries = 2, retryDelay = 1000, ...fetchOptions } = options;
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new APIError(
          errorData?.detail || `Request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }
      
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (attempt < retries) {
        await sleep(retryDelay * (attempt + 1));
      }
    }
  }
  
  throw lastError || new Error('Request failed');
}

// Auth helpers
export function getUserId(): string | null {
  return localStorage.getItem('user_id');
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearAuth(): void {
  localStorage.removeItem('user_id');
  localStorage.removeItem('token');
}

export function setAuth(userId: number | string, token: string): void {
  localStorage.setItem('user_id', userId.toString());
  localStorage.setItem('token', token);
}

// API endpoints
export const api = {
  // Auth
  login: (data: { username: string; password: string }) =>
    apiRequest<{ token: string; user_id: number }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  signup: (data: { username: string; email: string; password: string }) =>
    apiRequest<{ token: string; user_id: number }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Profile
  getProfile: (userId: string) =>
    apiRequest<{
      username: string;
      level: number;
      xp: number;
      xp_to_next: number;
      rank: string;
      quests_completed: number;
      total_quests: number;
      win_streak: number;
      completed_levels: number[];
      completed_questions: number[];
    }>(`/api/profile/${userId}`),

  // Dungeons
  getDungeons: () => apiRequest<Dungeon[]>('/api/dungeons'),
  getDungeon: (id: string) => apiRequest<Dungeon>(`/api/dungeons/${id}`),
  getDungeonLevels: (id: string) => apiRequest<Level[]>(`/api/dungeons/${id}/levels`),

  // Levels
  getLevel: (id: string) => apiRequest<LevelDetail>(`/api/levels/${id}`),
  submitLevel: (id: string, data: { user_id: number; answers: string[] }) =>
    apiRequest<{ success: boolean; message: string }>(`/api/levels/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Questions
  getQuestions: (userId?: string | null) =>
    apiRequest<Question[]>(userId ? `/api/questions?user_id=${userId}` : '/api/questions'),
  getQuestion: (id: string) => apiRequest<QuestionDetail>(`/api/questions/${id}`),
  testQuestion: (id: string, data: { code: string; language: string }) =>
    apiRequest<TestResult>(`/api/questions/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submitQuestion: (id: string, data: { user_id: string | null; code: string; language: string }) =>
    apiRequest<{ message: string; output?: string }>(`/api/questions/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Leaderboard
  getLeaderboard: () => apiRequest<LeaderboardEntry[]>('/api/leaderboard'),
};

// Types
export interface Dungeon {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  unlocks_at_xp: number;
  required_dungeon: number | null;
  icon: string;
  levels: number[];
}

export interface Level {
  id: number;
  dungeon_id: number;
  title: string;
  xp: number;
  difficulty: string;
  is_boss?: boolean;
}

export interface LevelDetail extends Level {
  lesson: string;
  quiz: {
    type: string;
    questions: QuizQuestion[];
  };
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: string;
}

export interface Question {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  xp: number;
  status: string;
  category: string;
  required_dungeon: number | null;
}

export interface QuestionDetail extends Question {
  examples: Array<{ input: unknown; output: unknown }>;
}

export interface TestResult {
  results?: Array<{
    passed: boolean;
    input: unknown;
    expected: unknown;
    output: unknown;
  }>;
  output?: string;
  all_passed?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  title: string;
  level: number;
  xp: number;
}
