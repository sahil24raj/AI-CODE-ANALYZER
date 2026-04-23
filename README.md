# 🧠 DeepCode AI - Intelligent Code Analysis Platform

DeepCode AI is an interactive, live code evaluation platform designed to help developers and educators instantly analyze code quality, security vulnerabilities, execution efficiency, and testing coverage.

Powered by a high-speed hybrid engine, DeepCode AI catches syntax flaws instantly while utilizing **Google Gemini 1.5 Flash** for deep contextual vulnerability scanning and algorithmic time-complexity generation.

---

## 🚀 The "WOW" Features

1. **Security Red Team Mode:** Detects insecure code (like hardcoded keys or SQL injection vulnerabilities) and instantly audits the logic, acting as an automated red-teamer.
2. **Big-O Complexity Visualization:** Dynamically calculates your algorithm's Time Complexity (e.g., `O(n^2)` vs `O(1)`) so you know if your code will scale to millions of rows seamlessly.
3. **Auto-Refactoring Engine:** Outputs a pristinely refactored, 100/100 scored version of your code based on PEP-8 and modern efficiency standards.

---

## 💻 Tech Stack

- **Frontend:** React.js, Vite, TailwindCSS v4, Monaco Editor (VS Code core engine).
- **Backend:** Python FastAPI (optimized for asynchronous LLM calls), Uvicorn.
- **AI Layer:** Google Gemini Generative AI SDK (1.5 Flash Model).

---

## ⚙️ Local Setup Instructions

This project is separated into a `frontend` UI and a `backend` API. You will need to run both simultaneously.

### 1. Setup Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```
**API Key Setup:**
Create a `.env` file in the `backend/` directory and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_actual_key_here
```
*(If no API key is provided, the backend falls back to a **Mock Mode** so the frontend UI can still be fully tested without crashing.)*

Run the backend server:
```bash
python main.py
```

### 2. Setup Frontend (React + Vite)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

---

## 📸 Hackathon Submission Story

> *What if getting your code reviewed by a Senior Engineer didn't take days, but exactly 3 seconds?*

We built DeepCode AI to solve the massive feedback loop bottleneck in developer education and hackathons. Instead of just checking if code "passes test cases," our hybrid engine uses FastAPI and Gemini to grade code exactly how an enterprise tech lead would. 

From grading architectural efficiency to executing immediate security audits, DeepCode AI makes writing clean code accessible, fast, and competitive.
