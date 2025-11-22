from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import csv
import os
import bcrypt
import json

CSV_PATH = "database/users.csv"

def read_questions():
    questions = []
    path = "database/questions.csv"
    if not os.path.exists(path):
        return questions
    
    with open(path, mode="r", newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            row["id"] = int(row["id"])
            row["xp"] = int(row["xp"])

            # Parse JSON examples
            if row.get("examples"):
                row["examples"] = json.loads(row["examples"])
            else:
                row["examples"] = []

            questions.append(row)

    return questions

def get_leaderboard_users(limit=100):
    users = read_users()

    # Convert xp and level to int so sorting works properly
    for u in users:
        u["xp"] = int(u["xp"])
        u["level"] = int(u["level"])

    # Sort by XP descending (highest XP first)
    users_sorted = sorted(users, key=lambda u: u["xp"], reverse=True)

    # Apply limit
    return users_sorted[:limit]

def find_user_by_id(user_id: int):
    users = read_users()
    for u in users:
        if int(u["id"]) == user_id:
            return u
    return None

def find_user_by_username(username: str):
    users = read_users()
    for u in users:
        if u["username"].lower() == username.lower():
            return u
    return None

def read_users():
    users = []
    if not os.path.exists(CSV_PATH):
        return users

    with open(CSV_PATH, mode="r", newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            users.append(row)
    return users

def write_user(user_data: dict):
    file_exists = os.path.exists(CSV_PATH)

    with open(CSV_PATH, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=[
            "id",
            "username",
            "email",
            "password_hash",
            "created_at",
            "level",
            "xp",
            "xp_to_next",
            "rank",
            "quests_completed",
            "total_quests",
            "win_streak"
        ])

        if not file_exists or os.stat(CSV_PATH).st_size == 0:
            writer.writeheader()

        writer.writerow(user_data)


app = FastAPI(title="CodeDungeon API", version="1.0.0")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== MODELS ==============

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    level: int
    xp: int
    xp_to_next: int
    rank: str
    quests_completed: int
    total_quests: int
    win_streak: int
    created_at: datetime

class Question(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    xp: int
    status: str
    category: str

class QuestionSubmit(BaseModel):
    question_id: int
    code: str
    language: str

class SubmissionResult(BaseModel):
    success: bool
    passed: int
    total: int
    xp_earned: int
    message: str

class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    level: int
    xp: int
    title: str

class Achievement(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: Optional[datetime]

class GameMode(BaseModel):
    id: int
    name: str
    description: str
    available: bool

# ============== PLACEHOLDER DATA ==============


PLACEHOLDER_ACHIEVEMENTS = [
    Achievement(id=1, name="First Blood", description="Complete your first quest", icon="sword", unlocked=True, unlocked_at=datetime.now()),
    Achievement(id=2, name="Streak Master", description="Achieve a 5-day streak", icon="fire", unlocked=True, unlocked_at=datetime.now()),
    Achievement(id=3, name="Bug Slayer", description="Complete 10 quests", icon="bug", unlocked=False, unlocked_at=None),
    Achievement(id=4, name="Speed Demon", description="Complete a quest in under 5 minutes", icon="zap", unlocked=False, unlocked_at=None),
    Achievement(id=5, name="Perfectionist", description="Get 100% on a hard quest", icon="star", unlocked=False, unlocked_at=None),
]

PLACEHOLDER_GAME_MODES = [
    GameMode(id=1, name="Combat Training", description="Practice with timed challenges", available=True),
    GameMode(id=2, name="Puzzle Solving", description="Logic and algorithm puzzles", available=True),
    GameMode(id=3, name="Speed Challenges", description="Race against the clock", available=False),
]

# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/signup", tags=["Auth"])
async def signup(user: UserCreate):
    users = read_users()

    # Check duplicates
    for u in users:
        if u["username"].lower() == user.username.lower():
            raise HTTPException(400, "Username already exists")
        if u["email"].lower() == user.email.lower():
            raise HTTPException(400, "Email already exists")

    # Create new user ID
    new_id = 1 if not users else int(users[-1]["id"]) + 1

    # Hash password
    password_hash = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    # Default values
    new_user = {
        "id": new_id,
        "username": user.username,
        "email": user.email,
        "password_hash": password_hash,
        "created_at": datetime.now().isoformat(),
        "level": 1,
        "xp": 0,
        "xp_to_next": 100,
        "rank": "Novice",
        "quests_completed": 0,
        "total_quests": 100,
        "win_streak": 0
    }

    write_user(new_user)

    return {
        "success": True,
        "message": "Hero created successfully",
        "user_id": new_id,
        "token": "placeholder_jwt_token"
    }

@app.post("/api/auth/login", tags=["Auth"])
async def login(credentials: UserLogin):
    user = find_user_by_username(credentials.username)

    if not user:
        raise HTTPException(400, "User not found")

    # Compare password hash
    if not bcrypt.checkpw(credentials.password.encode(), user["password_hash"].encode()):
        raise HTTPException(400, "Incorrect password")

    return {
        "success": True,
        "message": "Welcome back, hero!",
        "user_id": int(user["id"]),
        "token": "placeholder_jwt_token"
    }

@app.post("/api/auth/logout", tags=["Auth"])
async def logout():
    """Logout current hero"""
    return {"success": True, "message": "Farewell, hero!"}

@app.get("/api/auth/me", tags=["Auth"])
async def get_current_user():
    """Get current authenticated user"""
    return PLACEHOLDER_USER

# ============== PROFILE ENDPOINTS ==============

@app.get("/api/profile/{user_id}", tags=["Profile"])
async def get_profile(user_id: int):
    user = find_user_by_id(user_id)

    if not user:
        raise HTTPException(404, "User not found")

    # Convert values from CSV (they’re strings) to correct types
    return {
        "id": int(user["id"]),
        "username": user["username"],
        "email": user["email"],
        "level": int(user["level"]),
        "xp": int(user["xp"]),
        "xp_to_next": int(user["xp_to_next"]),
        "rank": user["rank"],
        "quests_completed": int(user["quests_completed"]),
        "total_quests": int(user["total_quests"]),
        "win_streak": int(user["win_streak"]),
        "created_at": user["created_at"]
    }

@app.put("/api/profile/{user_id}", tags=["Profile"])
async def update_profile(user_id: int, username: Optional[str] = None, email: Optional[str] = None):
    """Update user profile"""
    return {"success": True, "message": "Profile updated"}

@app.get("/api/profile/{user_id}/stats", tags=["Profile"])
async def get_user_stats(user_id: int):
    """Get detailed user statistics"""
    return {
        "total_xp": 3450,
        "level": 12,
        "rank": "Silver Knight",
        "quests_completed": 47,
        "quests_failed": 3,
        "win_streak": 5,
        "best_streak": 12,
        "total_time_spent": 14400,
        "avg_completion_time": 306,
        "favorite_category": "Arrays",
        "accuracy": 94.0
    }

@app.get("/api/profile/{user_id}/achievements", response_model=list[Achievement], tags=["Profile"])
async def get_user_achievements(user_id: int):
    """Get user achievements"""
    return PLACEHOLDER_ACHIEVEMENTS

# ============== QUESTIONS/QUESTS ENDPOINTS ==============

@app.get("/api/questions", tags=["Questions"])
async def get_questions(difficulty: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None):
    questions = read_questions()

    if difficulty:
        questions = [q for q in questions if q["difficulty"].lower() == difficulty.lower()]

    if category:
        questions = [q for q in questions if q["category"].lower() == category.lower()]

    if status:
        questions = [q for q in questions if q["status"].lower() == status.lower()]

    return questions


@app.get("/api/questions/{question_id}", tags=["Questions"])
async def get_question(question_id: int):
    questions = read_questions()

    for q in questions:
        if q["id"] == question_id:
            return q

    raise HTTPException(404, "Question not found")


@app.get("/api/questions/{question_id}/hints", tags=["Questions"])
async def get_question_hints(question_id: int):
    """Get hints for a question"""
    return {
        "hints": [
            "Think about using a hash map for O(n) solution",
            "Consider edge cases with negative numbers",
            "What if there are duplicate values?"
        ],
        "hints_used": 1,
        "max_hints": 3
    }

@app.post("/api/questions/{question_id}/submit", response_model=SubmissionResult, tags=["Questions"])
async def submit_solution(question_id: int, submission: QuestionSubmit):
    """Submit solution for a question"""
    return SubmissionResult(
        success=True,
        passed=5,
        total=5,
        xp_earned=100,
        message="All test cases passed! Quest completed!"
    )

@app.get("/api/questions/{question_id}/submissions", tags=["Questions"])
async def get_submissions(question_id: int):
    """Get user's past submissions for a question"""
    return {
        "submissions": [
            {"id": 1, "status": "passed", "runtime": 45, "memory": 16.2, "submitted_at": datetime.now().isoformat()},
            {"id": 2, "status": "failed", "runtime": 0, "memory": 0, "submitted_at": datetime.now().isoformat()},
        ]
    }

@app.get("/api/questions/categories", tags=["Questions"])
async def get_categories():
    """Get all question categories"""
    return {
        "categories": ["Arrays", "Strings", "Search", "Sorting", "DP", "Graphs", "Trees", "Math"]
    }

# ============== LEADERBOARD ENDPOINTS ==============

@app.get("/api/leaderboard", tags=["Leaderboard"])
async def get_leaderboard(limit: int = 10):
    users = get_leaderboard_users(limit)

    # Convert to what your frontend expects
    leaderboard = []
    rank_counter = 1

    for u in users:
        leaderboard.append({
            "rank": rank_counter,
            "username": u["username"],
            "level": u["level"],
            "xp": u["xp"],
            "title": u["rank"],   # your frontend calls this "title"
        })
        rank_counter += 1

    return leaderboard


@app.get("/api/leaderboard/weekly", response_model=list[LeaderboardEntry], tags=["Leaderboard"])
async def get_weekly_leaderboard(limit: int = 10):
    """Get weekly leaderboard"""
    return PLACEHOLDER_LEADERBOARD[:limit]

@app.get("/api/leaderboard/user/{user_id}", tags=["Leaderboard"])
async def get_user_rank(user_id: int):
    """Get specific user's rank"""
    return {"rank": 7, "total_players": 1250, "percentile": 99.4}

# ============== LEARN/ARENA ENDPOINTS ==============

@app.get("/api/arena/modes", response_model=list[GameMode], tags=["Arena"])
async def get_game_modes():
    """Get available game modes"""
    return PLACEHOLDER_GAME_MODES

@app.post("/api/arena/start", tags=["Arena"])
async def start_game_session(mode_id: int):
    """Start a new game session"""
    return {
        "session_id": "session_abc123",
        "mode": "Combat Training",
        "started_at": datetime.now().isoformat(),
        "time_limit": 300
    }

@app.post("/api/arena/end", tags=["Arena"])
async def end_game_session(session_id: str, score: int):
    """End game session and record score"""
    return {
        "session_id": session_id,
        "final_score": score,
        "xp_earned": 150,
        "new_high_score": True
    }

@app.get("/api/arena/history", tags=["Arena"])
async def get_game_history(user_id: int = 1):
    """Get user's game history"""
    return {
        "sessions": [
            {"id": "s1", "mode": "Combat Training", "score": 1500, "played_at": datetime.now().isoformat()},
            {"id": "s2", "mode": "Puzzle Solving", "score": 2200, "played_at": datetime.now().isoformat()},
        ]
    }

# ============== XP & PROGRESSION ENDPOINTS ==============

@app.get("/api/progression/ranks", tags=["Progression"])
async def get_all_ranks():
    """Get all available ranks"""
    return {
        "ranks": [
            {"name": "Novice", "min_level": 1, "color": "gray"},
            {"name": "Apprentice", "min_level": 5, "color": "green"},
            {"name": "Adept", "min_level": 10, "color": "blue"},
            {"name": "Veteran", "min_level": 20, "color": "purple"},
            {"name": "Expert", "min_level": 30, "color": "orange"},
            {"name": "Master", "min_level": 40, "color": "red"},
            {"name": "Grandmaster", "min_level": 50, "color": "gold"},
        ]
    }

@app.get("/api/progression/xp-table", tags=["Progression"])
async def get_xp_table():
    """Get XP requirements for each level"""
    return {
        "levels": [
            {"level": i, "xp_required": i * 500} for i in range(1, 51)
        ]
    }

# ============== DAILY/STREAK ENDPOINTS ==============

@app.get("/api/daily/challenge", tags=["Daily"])
async def get_daily_challenge():
    """Get today's daily challenge"""
    return {
        "question_id": 3,
        "title": "Binary Search",
        "bonus_xp": 50,
        "expires_at": datetime.now().isoformat(),
        "completed": False
    }

@app.get("/api/daily/streak", tags=["Daily"])
async def get_streak_info(user_id: int = 1):
    """Get user's streak information"""
    return {
        "current_streak": 5,
        "longest_streak": 12,
        "last_activity": datetime.now().isoformat(),
        "streak_bonus": 1.25
    }

# ============== HEALTH CHECK ==============

@app.get("/api/health", tags=["System"])
async def health_check():
    """API health check"""
    return {"status": "healthy", "version": "1.0.0", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)