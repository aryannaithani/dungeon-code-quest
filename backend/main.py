# main.py
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
import bcrypt
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB", "codedungeon")

app = FastAPI(title="CodeDungeon API", version="1.0.0")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dungeon-code-quest.vercel.app/"],
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
    status: Optional[str] = "available"
    category: Optional[str] = None
    required_dungeon: Optional[int] = None
    examples: Optional[List[Any]] = []
    tests: Optional[List[Any]] = []
    function_name: Optional[str] = "solve"

class QuestionSubmit(BaseModel):
    user_id: int
    code: str
    language: str

class TestSubmit(BaseModel):
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

class LevelSubmit(BaseModel):
    user_id: int
    answers: List[str]

# ============== DB STARTUP / HELPERS ==============

@app.on_event("startup")
async def startup_db_client():
    app.state.mongo_client = AsyncIOMotorClient(MONGODB_URI)
    app.state.db = app.state.mongo_client[DB_NAME]

@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.mongo_client.close()

def to_jsonable(value):
    """
    Recursively convert Mongo types (ObjectId) into JSON-serializable values.
    """
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, dict):
        return {k: to_jsonable(v) for k, v in value.items()}
    if isinstance(value, list):
        return [to_jsonable(v) for v in value]
    # primitives (int/str/etc) are JSON safe
    return value

def clean_doc(doc: Optional[dict]) -> Optional[dict]:
    """Return JSON-safe copy of a document (or None)."""
    if doc is None:
        return None
    return to_jsonable(doc)

def clean_docs(docs: List[dict]) -> List[dict]:
    """Convert list of docs to JSON-safe versions."""
    return [clean_doc(d) for d in docs]

def _user_public(user_doc: dict):
    # Convert DB user doc to API-friendly dict (and ensure JSONable)
    user_doc = to_jsonable(user_doc or {})
    return {
        "id": int(user_doc.get("id")),
        "username": user_doc.get("username"),
        "email": user_doc.get("email"),
        "level": int(user_doc.get("level", 1)),
        "xp": int(user_doc.get("xp", 0)),
        "xp_to_next": int(user_doc.get("xp_to_next", 100)),
        "rank": user_doc.get("rank", "Novice"),
        "quests_completed": int(user_doc.get("quests_completed", 0)),
        "total_quests": int(user_doc.get("total_quests", 0)),
        "win_streak": int(user_doc.get("win_streak", 0)),
        "created_at": user_doc.get("created_at"),
        "completed_questions": user_doc.get("completed_questions", []),
        "completed_levels": user_doc.get("completed_levels", [])
    }

async def get_user_by_username(username: str):
    db = app.state.db
    doc = await db.users.find_one({"username": {"$regex": f"^{username}$", "$options": "i"}})
    return clean_doc(doc)

async def get_user_by_id(user_id: int):
    db = app.state.db
    doc = await db.users.find_one({"id": user_id})
    return clean_doc(doc)

async def create_user(user_data: dict):
    db = app.state.db
    await db.users.insert_one(user_data)
    return clean_doc(user_data)

async def update_user_by_id(user_id: int, update: dict):
    db = app.state.db
    await db.users.update_one({"id": user_id}, {"$set": update})
    return await get_user_by_id(user_id)

async def get_questions_from_db(filters: dict = None):
    db = app.state.db
    filters = filters or {}
    cursor = db.questions.find(filters)
    docs = [d async for d in cursor]
    return clean_docs(docs)

async def get_question_by_id(question_id: int):
    db = app.state.db
    doc = await db.questions.find_one({"id": question_id})
    return clean_doc(doc)

async def get_dungeons_from_db():
    db = app.state.db
    docs = [d async for d in db.dungeons.find({})]
    return clean_docs(docs)

async def get_levels_from_db():
    db = app.state.db
    docs = [l async for l in app.state.db.levels.find({})]
    return clean_docs(docs)

async def get_dungeon_by_id(dungeon_id: int):
    db = app.state.db
    doc = await db.dungeons.find_one({"id": dungeon_id})
    return clean_doc(doc)

async def get_level_by_id(level_id: int):
    doc = await app.state.db.levels.find_one({"id": level_id})
    return clean_doc(doc)

async def get_completed_dungeons_from_levels(completed_levels: List[int]) -> List[int]:
    """
    Determine which dungeons are completed given a list of completed level IDs.
    A dungeon is considered completed if all of its levels are present in completed_levels.
    """
    dungeons = await get_dungeons_from_db()
    completed = []
    for d in dungeons:
        levels = d.get("levels", [])
        if levels and all(l in completed_levels for l in levels):
            completed.append(int(d["id"]))
    return completed

# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/signup", tags=["Auth"])
async def signup(user: UserCreate):
    # duplicate check
    existing = await get_user_by_username(user.username)
    if existing:
        raise HTTPException(400, "Username already exists")
    db = app.state.db

    # create numeric incremental id (simple approach)
    last = await db.users.find_one(sort=[("id", -1)])
    new_id = 1 if not last else int(last["id"]) + 1

    password_hash = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()
    now = datetime.utcnow().isoformat()
    new_user = {
        "id": new_id,
        "username": user.username,
        "email": user.email,
        "password_hash": password_hash,
        "created_at": now,
        "level": 1,
        "xp": 0,
        "xp_to_next": 100,
        "rank": "Novice",
        "quests_completed": 0,
        "total_quests": 0,
        "win_streak": 0,
        "completed_questions": [],
        "completed_levels": []
    }

    await create_user(new_user)
    return {"success": True, "message": "Hero created successfully", "user_id": new_id, "token": "placeholder_jwt_token"}

@app.post("/api/auth/login", tags=["Auth"])
async def login(credentials: UserLogin):
    user = await get_user_by_username(credentials.username)
    if not user:
        raise HTTPException(400, "User not found")
    # user doc returned from helper is already cleaned
    if not bcrypt.checkpw(credentials.password.encode(), user["password_hash"].encode()):
        raise HTTPException(400, "Incorrect password")
    return {"success": True, "message": "Welcome back, hero!", "user_id": int(user["id"]), "token": "placeholder_jwt_token"}

# ============== PROFILE ENDPOINTS ==============

@app.get("/api/profile/{user_id}", tags=["Profile"])
async def get_profile(user_id: int):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return _user_public(user)

@app.get("/api/profile/{user_id}/stats", tags=["Profile"])
async def get_user_stats(user_id: int):
    # You can implement real stats gathering from submissions/levels collection
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

# ============== QUESTIONS/QUESTS ENDPOINTS ==============

@app.get("/api/questions", tags=["Questions"])
async def get_questions(
    difficulty: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[int] = None
):
    # Pull all questions
    questions = await get_questions_from_db()

    # Load user progress if requested
    completed_levels = []
    completed_questions = []
    completed_dungeons = []
    if user_id:
        user = await get_user_by_id(user_id)
        if user:
            completed_levels = user.get("completed_levels", []) or []
            completed_questions = user.get("completed_questions", []) or []
            completed_dungeons = await get_completed_dungeons_from_levels(completed_levels)

    # Determine status per user
    for q in questions:
        q.setdefault("status", "available")
        q_id = int(q.get("id"))
        req_d = q.get("required_dungeon")
        if q_id in completed_questions:
            q["status"] = "completed"
        elif req_d is not None:
            # ensure types
            try:
                req_d_int = int(req_d)
            except:
                req_d_int = None
            if req_d_int is not None and req_d_int in completed_dungeons:
                q["status"] = "available"
            else:
                q["status"] = "locked"
        else:
            q["status"] = q.get("status", "available")

    # Apply filters
    if difficulty:
        questions = [q for q in questions if str(q.get("difficulty", "")).lower() == difficulty.lower()]
    if category:
        questions = [q for q in questions if str(q.get("category", "")).lower() == category.lower()]
    if status:
        questions = [q for q in questions if str(q.get("status", "")).lower() == status.lower()]

    return questions

@app.get("/api/questions/{question_id}", tags=["Questions"])
async def get_question(question_id: int):
    q = await get_question_by_id(question_id)
    if not q:
        raise HTTPException(404, "Question not found")
    return q

@app.post("/api/questions/{question_id}/submit", tags=["Questions"])
async def submit_solution(question_id: int, submission: QuestionSubmit):
    # Find question
    question = await get_question_by_id(question_id)
    if not question:
        raise HTTPException(404, "Question not found")

    # Load user
    user = await get_user_by_id(submission.user_id)
    if not user:
        raise HTTPException(404, "User not found")

    # Ensure completed_questions list
    completed_questions = user.get("completed_questions", []) or []
    if question_id in completed_questions:
        return {"success": False, "passed": 0, "total": len(question.get("tests", [])), "xp_earned": 0, "message": "You have already completed this quest. No XP rewarded."}

    # run code in restricted environment (still same risk as before)
    tests = question.get("tests", [])
    function_name = question.get("function_name") or "solve"

    if not function_name:
        raise HTTPException(500, "Question missing function_name")

    restricted_globals = {
        "__builtins__": {
            "range": range,
            "len": len,
            "print": print,
            "abs": abs,
            "min": min,
            "max": max,
            "enumerate": enumerate,
            "list": list,
            "dict": dict,
            "set": set,
            "tuple": tuple,
        }
    }
    restricted_locals = {}

    try:
        exec(submission.code, restricted_globals, restricted_locals)
    except Exception as e:
        return {"success": False, "passed": 0, "total": len(tests), "xp_earned": 0, "message": f"Code error: {str(e)}"}

    if function_name not in restricted_locals:
        return {"success": False, "passed": 0, "total": len(tests), "xp_earned": 0, "message": f"Function '{function_name}' not found in submitted code."}

    user_function = restricted_locals[function_name]
    passed = 0
    results = []

    for test in tests:
        test_input = test.get("input")
        expected_output = test.get("output")
        try:
            if isinstance(test_input, list):
                result = user_function(*test_input)
            else:
                result = user_function(test_input)
        except Exception as e:
            results.append({"input": test_input, "expected": expected_output, "output": str(e), "passed": False})
            continue

        ok = result == expected_output
        if ok:
            passed += 1
        results.append({"input": test_input, "expected": expected_output, "output": result, "passed": ok})

    success = passed == len(tests)
    xp_earned = 0

    if success:
        xp_earned = int(question.get("xp", 0))
        # update user document
        new_xp = int(user.get("xp", 0)) + xp_earned
        new_quests_completed = int(user.get("quests_completed", 0)) + 1
        completed_questions.append(question_id)

        # level up logic
        level = int(user.get("level", 1))
        xp_to_next = int(user.get("xp_to_next", 100))
        while new_xp >= xp_to_next:
            level += 1
            xp_to_next = level * 500

        await app.state.db.users.update_one(
            {"id": submission.user_id},
            {"$set": {
                "xp": new_xp,
                "level": level,
                "xp_to_next": xp_to_next,
                "quests_completed": new_quests_completed,
                "completed_questions": completed_questions
            }}
        )

    return {"success": success, "passed": passed, "total": len(tests), "xp_earned": xp_earned, "message": "All test cases passed!" if success else "Some test cases failed.", "results": results}

@app.post("/api/questions/{question_id}/test")
async def test_solution(question_id: int, submission: TestSubmit):
    # Find question
    question = await get_question_by_id(question_id)
    if not question:
        raise HTTPException(404, "Question not found")

    tests = question.get("tests", [])
    function_name = question.get("function_name") or "solve"

    if not function_name:
        raise HTTPException(500, "Question missing function_name")

    restricted_globals = {
        "__builtins__": {
            "range": range,
            "len": len,
            "print": print,
            "abs": abs,
            "min": min,
            "max": max,
            "enumerate": enumerate,
            "list": list,
            "dict": dict,
            "set": set,
            "tuple": tuple,
        }
    }
    restricted_locals = {}

    try:
        exec(submission.code, restricted_globals, restricted_locals)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Code error: {str(e)}")

    if function_name not in restricted_locals:
        raise HTTPException(status_code=400, detail=f"Function '{function_name}' not found in submitted code.")

    user_function = restricted_locals[function_name]
    results = []
    all_passed = True

    for test in tests:
        test_input = test.get("input")
        expected = test.get("output")
        try:
            if isinstance(test_input, list):
                output = user_function(*test_input)
            else:
                output = user_function(test_input)
        except Exception as e:
            results.append({"input": test_input, "expected": expected, "output": str(e), "passed": False})
            all_passed = False
            continue

        passed = output == expected
        if not passed:
            all_passed = False
        results.append({"input": test_input, "expected": expected, "output": output, "passed": passed})

    return {"success": True, "all_passed": all_passed, "results": results}

# ============== LEADERBOARD ENDPOINTS ==============

@app.get("/api/leaderboard", tags=["Leaderboard"])
async def get_leaderboard(limit: int = 10):
    cursor = app.state.db.users.find({}).sort("xp", -1).limit(limit)
    users = [to_jsonable(u) for u in [u async for u in cursor]]
    leaderboard = []
    rank_counter = 1
    for u in users:
        leaderboard.append({"rank": rank_counter, "username": u["username"], "level": int(u.get("level", 1)), "xp": int(u.get("xp", 0)), "title": u.get("rank", "")})
        rank_counter += 1
    return leaderboard

# ============== DUNGEONS & LEVELS ENDPOINTS ==============

@app.get("/api/dungeons", tags=["Dungeons"])
async def get_dungeons():
    dungeons = await get_dungeons_from_db()
    return dungeons

@app.get("/api/dungeons/{dungeon_id}", tags=["Dungeons"])
async def get_dungeon(dungeon_id: int):
    d = await get_dungeon_by_id(dungeon_id)
    if not d:
        raise HTTPException(404, "Dungeon not found")
    return d

@app.get("/api/dungeons/{dungeon_id}/levels", tags=["Dungeons"])
async def get_dungeon_levels(dungeon_id: int):
    dungeon = await get_dungeon_by_id(dungeon_id)
    if not dungeon:
        raise HTTPException(404, "Dungeon not found")
    levels_cursor = app.state.db.levels.find({"id": {"$in": dungeon.get("levels", [])}})
    levels = [to_jsonable(l) for l in [l async for l in levels_cursor]]
    # preserve order from dungeon.levels
    id_order = dungeon.get("levels", [])
    levels.sort(key=lambda x: id_order.index(x["id"]) if x["id"] in id_order else 0)
    return levels

@app.get("/api/levels/{level_id}", tags=["Levels"])
async def get_level(level_id: int):
    level = await get_level_by_id(level_id)
    if not level:
        raise HTTPException(404, "Level not found")
    return level

@app.post("/api/levels/{level_id}/submit", tags=["Levels"])
async def submit_level(level_id: int, submission: LevelSubmit):
    level = await get_level_by_id(level_id)
    if not level:
        raise HTTPException(404, "Level not found")

    questions = level.get("quiz", {}).get("questions", [])
    correct = 0
    for i, q in enumerate(questions):
        if i < len(submission.answers) and submission.answers[i] == q.get("answer"):
            correct += 1

    passed = correct == len(questions)
    xp_earned = 0

    if passed and submission.user_id > 0:
        user = await get_user_by_id(submission.user_id)
        if not user:
            raise HTTPException(404, "User not found")

        completed = user.get("completed_levels", []) or []
        if level_id not in completed:
            completed.append(level_id)
            new_xp = int(user.get("xp", 0)) + int(level.get("xp", 0))
            new_quests_completed = int(user.get("quests_completed", 0))
            # award xp and increment if desired
            new_quests_completed += 1
            # level up logic
            level_num = int(user.get("level", 1))
            xp_to_next = int(user.get("xp_to_next", 100))
            while new_xp >= xp_to_next:
                level_num += 1
                xp_to_next = level_num * 500

            await app.state.db.users.update_one(
                {"id": submission.user_id},
                {"$set": {
                    "xp": new_xp,
                    "level": level_num,
                    "xp_to_next": xp_to_next,
                    "quests_completed": new_quests_completed,
                    "completed_levels": completed
                }}
            )
            xp_earned = int(level.get("xp", 0))

    return {"success": passed, "correct": correct, "total": len(questions), "xp_earned": xp_earned, "message": "Level completed!" if passed else "Try again!"}

# ============== HEALTH CHECK ==============

@app.get("/api/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
