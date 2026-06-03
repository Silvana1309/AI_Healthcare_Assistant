import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

from database import init_db, save_chat, get_history

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-1.5-flash")

print("GEMINI KEY:", "AVAILABLE" if GEMINI_API_KEY else "NOT FOUND")
print("LLM MODEL:", LLM_MODEL)

app = FastAPI(title="AI Healthcare Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class ChatRequest(BaseModel):
    message: str


class SymptomRequest(BaseModel):
    age: int
    symptoms: str


class MedicationRequest(BaseModel):
    medicine: str


def fallback_response(message: str):
    text = message.lower()

    if "fever" in text:
        return "For fever, drink enough water, rest, and monitor your temperature. If the fever is high or lasts more than 3 days, please consult a healthcare professional."
    elif "headache" in text:
        return "For headache, try resting, drinking water, and avoiding bright screens. Seek medical help if the headache is severe, sudden, or happens repeatedly."
    elif "medicine" in text or "medication" in text:
        return "Always follow medication instructions from a doctor or pharmacist. Do not take unknown medication without proper medical guidance."
    else:
        return "I can provide general health information. Please describe your symptoms clearly. For an accurate diagnosis, consult a healthcare professional."


def ask_llm(message: str):
    try:
        model = genai.GenerativeModel(LLM_MODEL)

        prompt = f"""
You are an AI Healthcare Assistant.

Rules:
- Always answer in English.
- Provide general health education only.
- Do not give a definite medical diagnosis.
- Do not prescribe medication.
- Recommend consulting a healthcare professional for serious, worsening, or persistent symptoms.

User question:
{message}
"""

        response = model.generate_content(prompt)
        print("RAW GEMINI:", response)

        return response.text

    except Exception as e:
        print("GEMINI ERROR:", e)
        return f"GEMINI ERROR: {e}"


@app.get("/")
def home():
    return {"message": "AI Healthcare Assistant API is running"}


@app.post("/api/chat")
def chat(request: ChatRequest):
    bot_response = ask_llm(request.message)
    save_chat(request.message, bot_response)

    return {
        "user_message": request.message,
        "bot_response": bot_response
    }


@app.post("/api/symptom-guidance")
def symptom_guidance(request: SymptomRequest):
    prompt = f"""
User age: {request.age}
Symptoms: {request.symptoms}

Provide general symptom guidance based on the user's age.
Do not give a definite diagnosis.
Do not prescribe medication.
Recommend seeing a healthcare professional if symptoms are serious, worsening, or persistent.
"""

    result = ask_llm(prompt)

    return {
        "feature": "Symptom-based Guidance",
        "result": result
    }


@app.get("/api/health-tips")
def health_tips():
    prompt = """
Provide 5 daily health tips.
Make them short, clear, and easy to understand.
"""

    result = ask_llm(prompt)

    return {
        "feature": "AI-generated Health Tips",
        "result": result
    }


@app.post("/api/medication-info")
def medication_info(request: MedicationRequest):
    prompt = f"""
Provide general information about this medication:
{request.medicine}

Explain:
1. General purpose
2. General usage guidance
3. Common side effects
4. Important warnings

Do not prescribe medication.
Recommend consulting a doctor or pharmacist.
"""

    result = ask_llm(prompt)

    return {
        "feature": "Medication Information",
        "result": result
    }


@app.get("/api/preventive-care")
def preventive_care():
    prompt = """
Provide preventive care suggestions for maintaining good health.
Include nutrition, sleep, exercise, hygiene, and routine health check-ups.
"""

    result = ask_llm(prompt)

    return {
        "feature": "Preventive Care Suggestions",
        "result": result
    }


@app.get("/api/history")
def history():
    rows = get_history()
    return {
        "history": [
            {
                "user_message": row[0],
                "bot_response": row[1],
                "created_at": row[2]
            }
            for row in rows
        ]
    }