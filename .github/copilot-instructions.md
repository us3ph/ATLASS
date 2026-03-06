# GitHub Copilot Instructions — ATLASS

## 🌍 Project Overview
ATLASS is an AI-powered web platform that connects Moroccan and African software engineers
with global tech companies, remote jobs, and open-source projects.

## 🎯 Goal
Match African developer profiles to global opportunities using AI (OpenRouter / OpenAI-compatible API).

---

## 🗂️ Project Structure
```
atlass/
├── frontend/        → React.js + TypeScript
├── backend/         → Node.js + Express + TypeScript
├── database/        → PostgreSQL schemas and migrations
├── secrets/         → Credentials (git-ignored, never committed)
└── docker-compose.yml
```

---

## ⚙️ Tech Stack — Always use these
- **Frontend**: React.js, TypeScript, TailwindCSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (use raw SQL or Prisma ORM)
- **AI**: OpenRouter API (OpenAI-compatible, model configurable via `AI_MODEL` env var)
- **Auth**: JWT tokens + bcrypt for password hashing
- **DevOps**: Docker, Docker Compose

---

## 📐 Code Rules — Always follow these

### General
- Always use **TypeScript** — never plain JavaScript
- Always use **async/await** — never .then() chains
- Always handle errors with **try/catch**
- Use **meaningful variable names** — no x, y, temp, data

### Backend
- All routes go in `/backend/src/routes/`
- All business logic goes in `/backend/src/services/`
- All database queries go in `/backend/src/repositories/`
- Validate all request inputs before processing
- Return consistent JSON responses:
```ts
// Success
{ success: true, data: {...} }

// Error
{ success: false, message: "..." }
```

### Frontend
- All pages go in `/frontend/src/pages/`
- All reusable components go in `/frontend/src/components/`
- All API calls go in `/frontend/src/services/api.ts`
- Use TailwindCSS for all styling — no inline styles
- Use React hooks only (no class components)

### Database
- All table names are **snake_case** and **plural** (e.g. `developer_profiles`)
- Always use **UUID** as primary key
- Always add `created_at` and `updated_at` columns

---

## 🤖 AI Matching Logic
When writing the AI matching feature:
- Send developer skills + job requirements to AI via OpenRouter (OpenAI-compatible SDK)
- Ask it to return a match score (0–100) and a reason
- Use model from `config.aiModel` (default: `nvidia/nemotron-nano-9b-v2:free`)
- Always parse the response as JSON
- Example prompt structure:
```
Given this developer profile: {skills, experience, bio}
And this job: {title, required_skills, description}
Return a JSON: { score: number, reason: string }
```

---

## 🔐 Auth & Secrets Rules
- Passwords must be hashed with bcrypt (saltRounds: 12)
- JWT secret is read from `secrets/jwt_secret` file (or env var `JWT_SECRET` as fallback)
- AI API key is read from `secrets/openrouter_api_key` file (or env var `OPENROUTER_API_KEY`)
- DB password is read from `secrets/db_password` file
- NEVER hardcode secrets in `.env`, `docker-compose.yml`, or source code
- JWT expires in 7 days
- Protected routes use `authenticateToken` middleware

---

## 🌐 API Endpoints Convention
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/profile/:id
PUT    /api/profile/update
GET    /api/jobs
GET    /api/jobs/:id
POST   /api/jobs/match        ← AI matching endpoint
GET    /api/dashboard/stats
```