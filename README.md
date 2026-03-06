# ⚡ ATLASS

> AI-powered platform connecting Moroccan and African software engineers with global tech companies, remote jobs, and open-source projects.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

---

## 🎯 What is ATLASS?

ATLASS uses **AI-powered matching** (via OpenRouter / OpenAI-compatible API) to match developer profiles against job requirements, providing:
- A **match score (0–100)** showing how well a developer fits a role
- A **detailed AI explanation** of why the match is strong or weak
- A **one-click application system** with automatic AI scoring
- A **recruiter dashboard** to review, accept, or reject applicants
- A **developer applications tracker** to monitor application statuses
- A **dashboard** with platform-wide statistics

---

## ✨ Key Features

### For Developers
- **AI Match Check** — See your fit score for any job before applying
- **One-Click Apply** — Submit applications with optional cover letter; AI scores automatically
- **Application Tracker** — Monitor all your applications and their statuses (pending → accepted/rejected)
- **Profile Management** — Skills, experience, bio, GitHub/LinkedIn links
- **Smart Dashboard** — Personal matches, stats, and quick actions

### For Companies / Recruiters
- **Job Posting** — Create and manage job listings with required skills
- **AI-Scored Applicants** — Every application includes an AI match score and explanation
- **Application Management** — Review, accept, or reject applicants with notes
- **Filtered Views** — Filter applications by status (pending, reviewed, accepted, rejected)
- **Per-Job Analytics** — See applicant counts and match distributions per job

---

## 🏗️ Project Structure

```
ATLASS/
├── frontend/                → React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── components/      → Reusable UI (Navbar, Footer, MatchCard, etc.)
│   │   ├── pages/           → Route-level pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── JobsPage.tsx / JobDetailPage.tsx
│   │   │   ├── MyApplicationsPage.tsx    ← Developer's application tracker
│   │   │   ├── RecruiterApplicationsPage.tsx ← Company applicant manager
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── LoginPage.tsx / RegisterPage.tsx
│   │   ├── services/        → API client (api.ts)
│   │   ├── context/         → Auth context provider
│   │   └── types/           → Shared TypeScript types
│   ├── Dockerfile
│   └── package.json
│
├── backend/                 → Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/          → Environment + secrets config
│   │   ├── database/        → Prisma client
│   │   ├── middleware/       → Auth & error handling
│   │   ├── repositories/    → Database query layer
│   │   │   ├── applicationRepository.ts  ← Job applications CRUD
│   │   │   ├── matchRepository.ts
│   │   │   ├── jobRepository.ts
│   │   │   ├── profileRepository.ts
│   │   │   └── userRepository.ts
│   │   ├── routes/          → Express route handlers
│   │   │   ├── applicationRoutes.ts      ← Apply, review, accept/reject
│   │   │   ├── authRoutes.ts
│   │   │   ├── jobRoutes.ts
│   │   │   ├── profileRoutes.ts
│   │   │   └── dashboardRoutes.ts
│   │   ├── services/        → Business logic layer
│   │   │   ├── applicationService.ts     ← Apply + auto AI scoring
│   │   │   ├── matchService.ts           ← OpenRouter AI integration
│   │   │   └── ...
│   │   ├── types/           → Shared TypeScript types
│   │   ├── validators/      → Zod input validation
│   │   └── server.ts        → Entry point
│   ├── prisma/
│   │   └── schema.prisma    → Database schema
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_job_applications.sql      ← Applications table + indexes
│   └── seeds/               → Seed data
│
├── secrets/                 → Credentials (git-ignored)
│   ├── openrouter_api_key
│   ├── jwt_secret
│   ├── db_password
│   └── README.md
│
├── docker-compose.yml       → Full stack orchestration
├── .env.example             → Environment template
└── README.md
```

---

## ⚙️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, TypeScript, TailwindCSS, Vite |
| Backend    | Node.js, Express, TypeScript        |
| Database   | PostgreSQL 16, Prisma ORM           |
| AI         | OpenRouter (OpenAI-compatible API)   |
| Auth       | JWT + bcrypt (saltRounds: 12)       |
| Validation | Zod                                 |
| DevOps     | Docker, Docker Compose              |

---

## 🚀 Quick Start

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js 20+](https://nodejs.org/) (for local development)
- An [OpenRouter API Key](https://openrouter.ai/keys) (free tier available)

### 1. Clone & Configure

```bash
git clone https://github.com/your-username/atlass.git
cd atlass

# Copy env template
cp .env.example .env

# Set up secrets (API key, JWT secret, DB password)
mkdir -p secrets
echo "your-openrouter-api-key" > secrets/openrouter_api_key
echo "your-random-jwt-secret" > secrets/jwt_secret
echo "atlass_password" > secrets/db_password
```

### 2. Run with Docker (Recommended)

```bash
docker-compose up --build
```

This starts:
- **PostgreSQL** on port `5432`
- **Backend API** on port `4000`
- **Frontend** on port `5173`

### 3. Run Locally (Without Docker)

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

### 4. Seed Database (Optional)

```bash
# Connect to PostgreSQL and run seed
psql -h localhost -U atlass_user -d atlass_db -f database/seeds/seed.sql
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint               | Auth | Description                |
|--------|------------------------|------|----------------------------|
| POST   | `/api/auth/register`   | No   | Register new user          |
| POST   | `/api/auth/login`      | No   | Login & get JWT            |

### Developer Profile
| Method | Endpoint               | Auth | Description                |
|--------|------------------------|------|----------------------------|
| GET    | `/api/profile/:id`     | Yes  | Get developer profile      |
| PUT    | `/api/profile/update`  | Yes  | Update developer profile   |

### Jobs
| Method | Endpoint               | Auth | Description                |
|--------|------------------------|------|----------------------------|
| GET    | `/api/jobs`            | No   | List all open jobs         |
| GET    | `/api/jobs/:id`        | No   | Get job details            |
| POST   | `/api/jobs`            | Yes  | Create job (company only)  |
| POST   | `/api/jobs/match`      | Yes  | AI match developer to job  |
| GET    | `/api/jobs/matches/me` | Yes  | Get developer's AI matches |

### Applications (NEW)
| Method | Endpoint                         | Auth       | Description                          |
|--------|----------------------------------|------------|--------------------------------------|
| POST   | `/api/applications/apply`        | Developer  | Apply to a job (auto AI scoring)     |
| GET    | `/api/applications/me`           | Developer  | List my applications & statuses      |
| GET    | `/api/applications/company`      | Company    | List all applications to my jobs     |
| GET    | `/api/applications/job/:jobId`   | Company    | List applications for a specific job |
| PUT    | `/api/applications/:id/status`   | Company    | Accept / reject an application       |

### Dashboard & Health
| Method | Endpoint               | Auth | Description                |
|--------|------------------------|------|----------------------------|
| GET    | `/api/dashboard/stats` | Yes  | Platform statistics        |
| GET    | `/api/health`          | No   | Health check               |

---

## 🤖 AI Matching

The `/api/jobs/match` endpoint:
1. Takes the authenticated developer's **profile** (skills, experience, bio)
2. Takes the **job requirements** (title, required skills, description)
3. Sends both to the **configured AI model** (via OpenRouter) with a structured prompt
4. Returns a **score (0–100)** and **reason** explaining the match
5. Saves the result in the database for the dashboard

---

## 📋 Job Application System

### Developer Workflow
On any job detail page, developers have **two options**:
- **Check Match** — Preview their AI match score without applying
- **Apply Now** — Submit an application with optional cover letter; AI scoring runs automatically

### Recruiter Workflow
Companies can review all applications from a **dedicated management page**:
- Applications grouped by job with developer details, skills, and cover letters
- **AI match scores and reasons** displayed for each applicant
- **Accept / Reject** buttons with optional reviewer notes
- Filter by status: All, Pending, Reviewed, Accepted, Rejected

### Application Statuses
| Status     | Description                              |
|------------|------------------------------------------|
| `pending`  | Submitted, awaiting recruiter review     |
| `reviewed` | Recruiter has seen the application       |
| `accepted` | Applicant accepted for the position      |
| `rejected` | Application declined                     |

---

## 📐 Code Conventions

- **TypeScript everywhere** — no plain JS
- **async/await** — no `.then()` chains
- **try/catch** for all error handling
- **Meaningful variable names** — no `x`, `y`, `temp`
- **Consistent API responses**: `{ success: true, data: {...} }` or `{ success: false, message: "..." }`
- **snake_case** for database tables, **camelCase** for TypeScript

---

## 🔐 Security

- **Secrets stored in files** — never hardcoded in env or docker-compose
- Docker secrets mounted at `/run/secrets/` in containers
- Passwords hashed with **bcrypt** (saltRounds: 12)
- JWT tokens expire in **7 days**
- **Helmet** for HTTP security headers
- **Rate limiting** (100 requests per 15 minutes)
- **CORS** configured for frontend origin
- **Zod validation** on all request inputs
- Role-based access control on protected routes
- `.gitignore` excludes `secrets/` and `.env` files

---

## 📄 License

MIT — Built with ❤️ from Morocco for Africa and the world.
