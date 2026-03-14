# ShiftPass

AI-powered onboarding and workforce passport platform for temporary event workers (e.g. Edinburgh Fringe Festival).

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| Backend | FastAPI (Python) |
| Database | Supabase (Postgres + pgvector) |
| AI | OpenAI GPT-4o + text-embedding-3-small |

## Project Structure

```
shiftpass/
├── agents/                  # Agent layer (orchestrator + 5 domain agents)
│   ├── orchestrator.py
│   ├── document_agent.py
│   ├── training_agent.py
│   ├── quiz_agent.py
│   ├── assessment_agent.py
│   └── passport_agent.py
├── routes/                  # FastAPI route handlers
│   ├── documents.py
│   ├── training.py
│   ├── quiz.py
│   └── passport.py
├── services/                # Business logic
│   ├── document_processor.py
│   ├── training_generator.py
│   ├── quiz_evaluator.py
│   └── passport_service.py
├── db/
│   └── schema.sql           # Supabase schema + pgvector RPC
├── main.py                  # FastAPI app entrypoint
├── seed_demo.py             # Demo data seeder
├── requirements.txt
├── .env.example
└── frontend/
    ├── app/
    │   ├── page.tsx                          # Landing
    │   ├── employer/page.tsx                 # Employer dashboard
    │   ├── employer/training/[id]/page.tsx   # Training preview + share
    │   ├── volunteer/page.tsx                # Volunteer entry
    │   ├── volunteer/training/[id]/page.tsx  # Training + quiz flow
    │   ├── volunteer/result/[id]/page.tsx    # Results page
    │   └── passport/[id]/page.tsx            # Public passport
    ├── components/
    │   ├── TrainingSlide.tsx
    │   ├── QuizQuestion.tsx
    │   ├── PassportCard.tsx
    │   ├── VolunteerTable.tsx
    │   └── ReadinessChart.tsx
    └── lib/
        └── api.ts
```

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `db/schema.sql` in the SQL editor — this creates all tables, indexes, and the `similarity_search` vector RPC
3. Copy your project URL and keys

### 2. Backend

```bash
cd shiftpass
cp .env.example .env
# Fill in OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY

pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd shiftpass/frontend
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 4. Seed demo data (optional)

```bash
cd shiftpass
python seed_demo.py
```

Seeds: 1 employer (The Fringe Bar), 1 Bartender training module, 3 volunteers with passports.

---

## Demo Script (3 minutes)

### Employer Flow
1. Go to `http://localhost:3000` → **I'm an Employer**
2. Upload a PDF staff handbook, select role **Bartender**, click **Generate Training**
3. Wait ~15s — AI generates 4 topics and 10 quiz questions
4. On the training preview page, copy the volunteer link

### Volunteer Flow
5. Open the copied link (or go to `/volunteer`, paste the Training ID)
6. Read through the 4 training slides
7. Complete the 10-question quiz
8. View your result: score, XP, readiness breakdown
9. Click **View Your ShiftPass** — see the shareable workforce passport

### Employer View
10. Return to employer dashboard — see the volunteer listed with their score and status

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload-document` | Upload PDF/TXT, chunk + embed |
| POST | `/api/generate-training` | Generate training module + quiz |
| GET | `/api/training/{id}` | Get training module |
| GET | `/api/quiz/{id}` | Get quiz questions (sanitized) |
| GET | `/api/quiz/{id}/full` | Get quiz with answers (employer) |
| POST | `/api/submit-quiz` | Submit answers, get passport |
| GET | `/api/passport/{volunteer_id}` | Get volunteer's passport |
| GET | `/api/result/{passport_id}` | Get result by passport ID |
| GET | `/api/employer/volunteers/{id}` | Get employer's volunteers |
