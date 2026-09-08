# FounderOS AI Digital Marketing Agent

An end-to-end, multi-agent autonomous marketing automation system designed for SaaS founders, startups, and marketing teams. The platform automates the entire content lifecycle—from market research and strategic planning to multi-platform copywriting, video generation, human-in-the-loop review, scheduled publishing, and analytics-driven learning.

---

## Key Features

- **9 Specialized AI Agents**:
  1. **Business Analysis Agent**: Analyzes brand identity, target audience, and product features.
  2. **Marketing Strategy Agent**: Builds weekly high-impact campaigns and content themes.
  3. **Content Planner Agent**: Schedules structured 5-day calendars across multiple channels (LinkedIn, Instagram, X/Twitter, Facebook, YouTube Shorts).
  4. **Script Writer Agent**: Crafts high-converting video and post copy using the *Hook → Problem → Solution → CTA* framework.
  5. **Video Generation Agent**: Creates multi-scene storyboards and triggers programmatic video rendering via Remotion.
  6. **Approval Agent**: Enforces a Human-in-the-Loop (HITL) review process for edits, approvals, and rejections.
  7. **Publishing Agent**: Manages and simulates automated distribution to social platforms.
  8. **Analytics Agent**: Fetches performance engagement data (views, CTR, watch time, shares).
  9. **Learning Agent**: Continuously optimizes future strategy by identifying winning formats and angles.

- **Content Memory System**: Remembers past campaign topics to prevent repetition and preserve brand voice.
- **Remotion Video Rendering**: Automated programmatic video generation with stock assets (Pexels, Unsplash) and text overlays.
- **Modern Dashboard UI**: Next.js (App Router) interface with dedicated views for Strategy, Calendar, Approvals, Studio, Memory, and Analytics.

---

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Strawberry GraphQL, Celery, Redis, Pydantic
- **Frontend**: Next.js 14 / React, TypeScript, Remotion, Tailwind CSS
- **Databases**: SQLite (local) / PostgreSQL (production)
- **Deployment**: Docker & Docker Compose

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### 1. Quick Start (Windows)
Double-click or run:
```bat
run_app.bat
```
This will set up the Python virtual environment, install dependencies, launch the FastAPI server (`http://localhost:8000`), and start the Next.js frontend (`http://localhost:3000`).

### 2. Manual Setup

#### Backend:
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # Add your API keys if available

uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 3. Docker Compose
```bash
docker-compose up --build
```

---

## Service Endpoints

- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI REST API**: `http://localhost:8000`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **GraphQL Playground**: `http://localhost:8000/graphql`

---

## License

MIT License.
