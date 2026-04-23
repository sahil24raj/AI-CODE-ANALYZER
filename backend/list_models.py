import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GENAI_API_KEY:
    print("No API key found in .env")
    exit(1)

genai.configure(api_key=GENAI_API_KEY)

for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)
