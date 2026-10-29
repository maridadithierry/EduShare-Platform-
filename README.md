# EduShare Platform

**Sharing Knowledge, Empowering African Students**

EduShare is a simple web platform where students and teachers can find, share and rate affordable learning resources. Users can browse resources, filter them by subject and level, mark the ones that help, and share or flag resources through the API.

---

## Problem Statement

Many students across Africa struggle to access affordable, relevant learning materials. Useful notes, past papers and study guides often stay scattered across personal devices and group chats, where other learners cannot find them. EduShare brings these resources into one searchable place so that knowledge can be shared freely between students and teachers.

## Target Users

- **Students** looking for study materials by subject and level
- **Teachers and tutors** who want to share resources with learners
- **Study groups** that need one place to collect and rate materials

## Features

- Browse all shared learning resources
- Filter resources by subject and level
- Mark a resource as helpful (resources are sorted by helpfulness)
- Responsive layout that works on mobile and desktop
- Through the API: search by keyword, add a new resource, and flag inappropriate resources (resources flagged 3 times are hidden)

Planned next (see the project board): keyword search in the UI ([#8](https://github.com/maridadithierry/EduShare-Platform-/issues/8)), a form to share new resources ([#9](https://github.com/maridadithierry/EduShare-Platform-/issues/9)) and resource detail pages ([#10](https://github.com/maridadithierry/EduShare-Platform-/issues/10)).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Testing | Jest, Supertest, mongodb-memory-server |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Project Structure

```
EduShare-Platform-/
├── .github/workflows/ci.yml   # CI pipeline (lint, test, build, Docker)
├── backend/                   # Express API, MongoDB models, tests
│   ├── .env.example           # Environment variable template (running without Docker)
│   └── tests/                 # API tests (Jest + Supertest)
├── frontend/                  # React + TypeScript app (Vite)
│   ├── .npmrc                 # legacy-peer-deps=true
│   └── src/
│       ├── components/        # Navbar, Footer
│       ├── pages/             # Home, Resources
│       └── services/          # API calls (resourcesApi.ts)
├── .dockerignore              # Files kept out of the Docker image
├── .env.example               # Environment variable template for Docker Compose
├── Dockerfile                 # Multi-stage build: frontend build, then backend runtime
├── docker-compose.yml         # App + MongoDB services
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js **20.19+ or 22.x**
- npm
- MongoDB (local or Atlas) for running the backend outside of Docker and tests
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose) to run the app in containers

### 1. Clone the repository

```bash
git clone https://github.com/maridadithierry/EduShare-Platform-.git
cd EduShare-Platform-
```

### 2. Run with Docker Compose (recommended)

This starts the whole app, the Express API serving the built React frontend, together with a MongoDB database. No Node.js or MongoDB install is needed.

```bash
cp .env.example .env    # then set your own MONGO_PASSWORD
docker compose up --build
```

Open http://localhost:4000 in the browser. The API runs on the same address (for example http://localhost:4000/health). On first start the database is filled with sample resources.

| Command | What it does |
|---------|--------------|
| `docker compose up --build -d` | Build and start in the background |
| `docker compose ps` | Show the containers and whether they are healthy |
| `docker compose logs -f app` | Follow the app logs |
| `docker compose down` | Stop and remove the containers (database data is kept) |
| `docker compose down -v` | Stop and also delete the database volume |

How it is set up:

- **`app`** is built from the `Dockerfile` and waits until **`mongo`** reports healthy before starting
- Both services share a private network; the app reaches the database at the hostname `mongo`, and the database port is not exposed to your machine
- Database files live in the named volume `mongo_data`, so data survives restarts
- Credentials come from the git-ignored `.env` file, never from the repository

> **Note:** Avoid special characters (`@ : / ?`) in `MONGO_PASSWORD`, because it is placed inside the database connection URL.

### 3. Run the backend without Docker

```bash
cd backend
cp .env.example .env    # then fill in your MongoDB connection string
npm ci
npm run dev             # or: npm start
```

To load sample resources into the database:

```bash
npm run seed
```

### 4. Run the frontend without Docker

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173 in the browser. The Vite dev server forwards `/api` requests to the backend on port 4000.

> **Note:** If `npm install` fails with `Cannot read properties of null (reading 'edgesOut')`, run `npm install --legacy-peer-deps`. The `frontend/.npmrc` file already sets this for normal installs.

### 5. Run the tests and linting

```bash
cd backend
npm run lint
npm test

cd ../frontend
npm run lint
npm run build
```

The tests use an in-memory MongoDB, so no database setup is needed. The first run downloads a MongoDB binary and may take longer.

### 6. Build the Docker image on its own

From the repository root:

```bash
docker build -t edushare .
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (used by Docker) |
| GET | `/api/resources` | List resources (supports `?subject=`, `?level=` and `?search=`) |
| POST | `/api/resources` | Create a new resource (`title`, `subject`, `description`, `url` required) |
| POST | `/api/resources/:id/helpful` | Mark a resource as helpful |
| POST | `/api/resources/:id/flag` | Flag a resource as inappropriate |

Resource ids are MongoDB ObjectIds and are returned as strings.

### Security measures

- Query parameters are checked to be plain strings, which blocks NoSQL injection attempts such as `?subject[$ne]=x`
- User search input is escaped before being used in database queries
- Resource ids are validated before querying
- Secrets are kept in `.env` files, which are excluded from version control and from the Docker image; only `.env.example` files with placeholders are committed
- The app container runs as a non-root user, and the database is only reachable from inside the Docker network

### Known limitations

- The helpful and flag endpoints have no user accounts or rate limiting yet, so one person can vote or flag repeatedly.

---

## CI/CD Pipeline

The GitHub Actions workflow ([`ci.yml`](.github/workflows/ci.yml)) runs on every push to a feature branch and on every pull request into `main`. It has three jobs:

1. **Backend (lint and test)**: installs dependencies, runs ESLint, and runs the Jest test suite
2. **Frontend (lint and build)**: installs dependencies, runs ESLint, and builds the production bundle
3. **Docker build**: builds the Docker image, and only runs after both the backend and frontend jobs pass

Pushes directly to `main` do not trigger the workflow, because all code reaches `main` through pull requests that have already passed CI.

## CI/CD Evidence

**Successful workflow runs**

- CI #1: commit `dada099` (Add CI workflow for lint, test, and Docker build): [run](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40936787541), jobs: [Backend (lint and test)](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40936787541/job/123669325520), [Frontend (lint and build)](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40936787541/job/123669325127), [Docker build](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40936787541/job/123669587165)
- CI #2: pull request #26: [run](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40937040390), jobs: [Backend (lint and test)](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40937040390/job/123670213101), [Frontend (lint and build)](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40937040390/job/123670213370), [Docker build](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40937040390/job/123670446326)
- CI #3: pull request #27 (this README update): [run](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40949436773)

**Failed run and fix**

To prove the pipeline catches mistakes, [PR #28](https://github.com/maridadithierry/EduShare-Platform-/pull/28) added an unused variable to `backend/server.js` on purpose.

- Failed: commit `43bf9a7`: [run](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40949530044). ESLint reported `'unusedValue' is assigned a value but never used`, the [Backend job](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40949530044/job/123713656815) failed, and the Docker build was skipped
- Fixed: commit `35822a7` removed the variable: [run](https://github.com/maridadithierry/EduShare-Platform-/actions/runs/40949647591). All three jobs passed

**Pull request with CI checks and review**

- [PR #26: CI pipeline and branch protection](https://github.com/maridadithierry/EduShare-Platform-/pull/26): all checks passed, and the PR was reviewed and approved by two teammates before merging.

Full run history: [Actions → CI](https://github.com/maridadithierry/EduShare-Platform-/actions/workflows/ci.yml)

## Branch Protection

The `main` branch is protected:

- Changes must go through a pull request
- At least one approving review is required, and approvals are dismissed when new commits are pushed
- The CI status checks must pass before merging, and the branch must be up to date with `main`
- Conversations must be resolved before merging
- The rules apply to administrators too

---

## Team

| Member | Role for F1 | Role for F2 |
|--------|-------------|-------------|
| Maridadi Thierry | Team Lead, Backend: API Routes and Application Logic | CI Pipeline and Branch Protection |
| Hannah Tuyishimire | Frontend: Features and API Integration | App Preparation for Docker/CI, Documentation and Evidence |
| Ange Umutoni | Frontend: UI/Design and Layout | Docker Compose |
| Joshua Mugisha | Backend: Data Management and API Testing | Dockerfile |

Project board: [GitHub Projects](https://github.com/users/maridadithierry/projects/15)

## Contributing

1. Pull the latest `main`: `git checkout main && git pull`
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit with clear messages and push the branch
4. Open a pull request into `main`, link the related issue (`Closes #<issue>`), and request a review
5. Merge only after CI passes and the PR is approved

Never commit `node_modules/` or `.env` files.

## License

This project is licensed under the terms in the [LICENSE](LICENSE) file.
