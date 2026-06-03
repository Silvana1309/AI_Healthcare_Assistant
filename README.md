# AI-Powered Healthcare Assistant

This project includes:

- Frontend: HTML, CSS, JavaScript
- Backend: Python FastAPI
- LLM: OpenAI-compatible API
- Chatbot: Healthcare assistant chat UI
- Database: SQLite
- API: `/api/chat` and `/api/history`

## How to Run

### 1. Run Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

### 2. Optional LLM Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then add your API key:

```text
OPENAI_API_KEY=your_api_key_here
LLM_MODEL=gpt-4o-mini
```

If no API key is added, the system still works using fallback responses.

### 3. Run Frontend

Open:

```text
frontend/index.html
```

Or use Live Server in VS Code.

## API Endpoints

### POST /api/chat

Request:

```json
{
  "message": "I have fever and headache"
}
```

Response:

```json
{
  "user_message": "I have fever and headache",
  "bot_response": "..."
}
```

### GET /api/history

Returns saved chat history from SQLite database.

## Important Safety Note

This chatbot is for educational purposes only and does not replace professional medical advice.
