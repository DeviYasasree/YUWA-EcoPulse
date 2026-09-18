# YUWA EcoPulse

Hackathon MVP for the YUWA Ecolympics Digital Scaling & Climate Action problem.

Principle: **Action → Evidence → Verification → Evaluation → Score → Impact**

Only **approved** submissions contribute to the official leaderboard and impact metrics. AI assists review; a human evaluator always decides.

## Phase 1

Student login → dashboard → Clean-up Drive → submit evidence → mock AI analysis → evaluator review → approve → score → live leaderboard.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn-style UI, Lucide, Recharts
- Backend: FastAPI, Pydantic, JWT
- Database: SQLite by default, PostgreSQL via `DATABASE_URL`
- AI: mock provider (Gemini can be added later)

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

Password for all users: `password123`

| Role | Email |
| --- | --- |
| Student | student@yuwa.edu |
| Evaluator | evaluator@yuwa.edu |
| College coordinator | coordinator@yuwa.edu |
| Admin | admin@yuwa.edu |
| CSR / Donor | donor@yuwa.edu |

## Environment

Do not commit secrets. Copy `.env.example` and `backend/.env.example`.

- `SECRET_KEY` — JWT signing key
- `DATABASE_URL` — `sqlite:///./ecopulse.db` or a Postgres URL
- `CORS_ORIGINS` — frontend origin
- `AI_PROVIDER` — `mock`
- `NEXT_PUBLIC_API_URL` — backend origin
