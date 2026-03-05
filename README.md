# CodeDungeon  
Gamified Programming Learning Platform (React + FastAPI + MongoDB)

CodeDungeon is a full-stack web platform that teaches programming and computer science concepts through a structured, game-inspired progression system. Instead of traditional lists of coding problems, users progress through themed “dungeons,” each containing lessons, quizzes, and coding challenges.

The platform combines a narrative progression system with a LeetCode-style coding environment and AI-driven personalized learning.

---

## Overview

CodeDungeon was designed to explore how gamification and adaptive learning can improve engagement in programming education.

The system includes:

- A dungeon-based progression campaign covering core CS topics
- A coding arena with live code execution and automated evaluation
- An XP and level progression system
- AI-generated personalized learning modules
- A production-ready web architecture with separate frontend and backend services

---

## System Architecture

**Frontend**
- React (Vite + TypeScript)
- Monaco Editor for code editing
- Tailwind-based UI
- State-driven dungeon progression

**Backend**
- FastAPI (Python)
- Modular routing and API layer
- Async request handling

**Database**
- MongoDB Atlas
- Stores users, dungeon progress, quizzes, submissions, and generated content

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

```
User Browser
      │
      ▼
React Frontend (Vite)
      │
      ▼
FastAPI Backend
      │
      ▼
MongoDB Atlas
```

---

## Core Features

### 1. Dungeon-Based Learning Campaign

The core learning experience is structured as a sequence of themed dungeons covering programming topics:

Basics → Control Flow → Functions → Data Structures → OOP → Recursion → Algorithms → Advanced Data Structures → Dynamic Programming → Final Challenge

Each dungeon contains multiple levels consisting of:

- Concept explanations
- Quizzes
- XP rewards
- Unlock conditions

This creates a progression system instead of a static problem list.

---

### 2. Coding Arena

A dedicated coding interface allows users to solve programming challenges.

Key capabilities include:

- Monaco code editor
- Code execution with test cases
- Instant feedback
- XP rewards based on difficulty
- Progress tracking tied to dungeon progression

Each challenge includes:

- Problem description
- Example cases
- Hidden evaluation tests
- Completion tracking

---

### 3. AI-Powered Personalized Learning

The platform includes a system for generating personalized learning modules.

Workflow:

1. The system tracks incorrect quiz answers and coding submissions.
2. After a threshold of mistakes is reached, weak concepts are identified.
3. These concepts are summarized and sent to an LLM.
4. The model generates a custom dungeon containing:
   - targeted lessons
   - new quizzes
   - additional exercises
5. The generated dungeon is stored in MongoDB and unlocked for the user.

This creates adaptive learning paths based on individual weaknesses.

---

### 4. Backend Design

The FastAPI backend is structured with:

- Modular route architecture
- JSON schema validation
- Async database operations
- Authentication-ready design
- Separate modules for progression, quizzes, and code execution

The API handles:

- user progress
- challenge evaluation
- dungeon unlocking
- personalized dungeon generation

---

### 5. Deployment

The application is deployed as a full-stack system.

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

Environment variables, API routing, and CORS configuration are managed for production deployment.

---

## Project Goals

CodeDungeon explores how structured progression and gamification can improve the learning experience for programming students.

Instead of presenting isolated problems, the platform introduces:

- narrative progression
- skill-based unlock systems
- adaptive learning paths

The goal is to create a system that keeps learners engaged while still teaching core computer science concepts.

---

## What This Project Demonstrates

This project showcases:

- Full-stack web application development
- API design with FastAPI
- React-based interactive interfaces
- Database design with MongoDB
- Integration of AI for adaptive learning
- End-to-end deployment of a production web platform

---

## Author

Aryan Naithani  
Computer Science (AI & Analytics)  
GLA University
