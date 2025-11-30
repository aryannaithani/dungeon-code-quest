# CodeDungeon

CodeDungeon is a gamified, dungeon-themed coding education platform designed to make learning algorithms, data structures, and programming fundamentals feel like an adventure. Instead of traditional topic lists or question banks, users progress through visually rich “dungeons,” each containing structured levels, quizzes, and coding challenges.

The platform blends:
• A progressive learning campaign (10 themed dungeons)
• A fully functioning coding arena with real code execution
• An XP system, ranks, level-ups, and unlockable challenges
• Personalized learning powered by AI-generated dungeons
• A clean UI and immersive dungeon aesthetic

It is deployed as a complete, production-ready web application with a separate backend, frontend, and cloud-hosted database.

---

## 🔥 Key Features

### 🎮 1. Gamified Learning Path (The Arena)
Users explore a sequence of 10 handcrafted dungeons:
Basics → Control Flow → Functions → Data Structures → OOP → Recursion → Algorithms → Advanced DS → Dynamic Programming → Final Boss

Each dungeon contains 10 custom-designed levels with:
• Lessons  
• Quizzes  
• XP rewards  
• Unlock logic  
• Visual progression on a winding dungeon map  

This delivers a narrative-driven progression instead of flat tutorial pages.

---

### ⚔️ 2. Coding Arena (LeetCode-Style)
A separate question board includes:
• Monaco code editor  
• Test run & submission  
• XP rewards  
• Automatic quest locking based on dungeon progress  
• Protected execution sandbox  
• Instant feedback  

Each question supports:
• Dynamic testcases  
• Examples  
• XP scaling by difficulty  
• Automatic completion tracking  

---

### 🔮 3. AI-Powered Personalized Learning
A dedicated “Personalized Learning” tab analyzes:
• Failed dungeon quizzes  
• Incorrect coding submissions  

After every 5 logged mistakes, the system:
1. Summarizes the user’s weak areas  
2. Sends them to an LLM  
3. Generates a new personalized dungeon with custom lessons + quizzes  
4. Stores it separately in MongoDB  
5. Unlocks it instantly for the user  

The personalized dungeons mirror the core campaign but are tailored in real time.

---

### 🧱 4. Clean Architecture
Backend: FastAPI (Python)  
Frontend: React (Vite + TypeScript)  
Database: MongoDB Atlas  

The system uses:
• JWT-ready auth structure  
• Modularized routing  
• Strict JSON schemas  
• Async database operations  
• Container-ready code isolation  
• Structured UX with Toast notifications, protected routes, unlock logic  

---

### 🌍 5. Deployed & Production-Ready
The project is fully deployed using:
• Vercel – Frontend  
• Render – Backend  
• MongoDB Atlas – Cloud database  

Environment variables, CORS controls, API routing, and build optimization are all handled.

---

## 🎯 Project Vision

CodeDungeon aims to transform coding education into an engaging, story-driven experience.  
Instead of repetitive question grinding, it creates a sense of progression and narrative that motivates learners to continue.

It is ideal for:
• Students  
• Coding bootcamps  
• Schools  
• Self-learners  
• Anyone bored of traditional platforms  

With the addition of AI personalization, every user’s journey adapts to their strengths and weaknesses.

---

## 🏆 About This Project

This project was built as a complete, fully functional, production-level academic + portfolio project, showcasing:
• Full-stack development  
• Real-time code execution  
• Gamification design  
• FastAPI + MongoDB backend engineering  
• AI integration  
• UI/UX polish  
• Deployment  
• Database migration & cloud infrastructure  

It demonstrates the ability to design, build, and deploy a complex real-world web platform end-to-end.

---

## 📬 Contact

For feedback, collaboration, or showcasing this project:
**Developer:** Aryan Naithani  
**Project:** CodeDungeon  

