from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="DeepCode AI", description="AI Code Analysis Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

class CodeSubmission(BaseModel):
    code: str
    language: str

class AnalysisResult(BaseModel):
    quality_score: int
    security_score: int
    efficiency_score: int
    testing_score: int
    feedback: str
    visual_complexity: str  # e.g., "O(n^2)"
    refactored_code: str

@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_code(submission: CodeSubmission):
    if not GENAI_API_KEY:
        # Fallback to Mock Response if API key is not configured yet
        return {
            "quality_score": 85,
            "security_score": 40,
            "efficiency_score": 75,
            "testing_score": 60,
            "feedback": "⚠️ **Mock Mode Active:** (Add GEMINI_API_KEY in backend/.env to use real AI)\n\nSecurity Audit Failed: Potential memory leak or unoptimized recursive call detected.\n\nEfficiency: The operation is somewhat brute-forced and could scale poorly with large data inputs.",
            "visual_complexity": "O(n^2)",
            "refactored_code": 'def add(a, b):\n    """\n    Type-hinted and safely handled.\n    """\n    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):\n        raise ValueError("Invalid parameters")\n    return a + b'
        }
        
    prompt = f"""
    You are an expert Senior Software Engineer and Security Auditor. Process the following {submission.language} code.
    
    You must output a strictly valid JSON object without any Markdown formatting (no ```json). 
    The JSON object must have exactly these keys and data types:
    - "quality_score": (int from 0 to 100)
    - "security_score": (int from 0 to 100)
    - "efficiency_score": (int from 0 to 100)
    - "testing_score": (int from 0 to 100)
    - "feedback": (string, detailed breakdown of issues found and suggested fixes)
    - "visual_complexity": (string, the Big-O time complexity, e.g., 'O(n)')
    - "refactored_code": (string, the pristine, refactored 100/100 version of the code)
    
    Here is the code to analyze:
    ```
    {submission.code}
    ```
    """
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash", generation_config={"response_mime_type": "application/json"})
        response = model.generate_content(prompt)
        data = json.loads(response.text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
