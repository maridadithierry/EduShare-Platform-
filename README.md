# EduShare Platform

**Sharing knowledge, empowering African students: a lightweight hub for finding, sharing and rating low-cost learning resources.**

## African Context

Across many African communities, students prepare for national exams and university courses with study material scattered across WhatsApp groups, photocopied notes and expensive commercial platforms. Good revision content exists, but it is hard to find, hard to judge, and often out of reach for students with limited data budgets or no access to paid services. The result is unequal access to exam preparation, and peer-to-peer learning that stays locked inside small groups.

EduShare addresses this by giving students and teachers one simple, low-bandwidth place to discover resources, filter them by subject and education level, and vote for the ones that actually help, so the most useful content rises to the top for everyone.

## Team Members

| Name | Role | Student ID |
|------|------|------------|
| Maridadi Thierry | Team Lead, Backend (API routes & application logic) | [Student ID] |
| Hannah Tuyishimire | Frontend Features & API Integration | [Student ID] |
| Ange Umutoni | Frontend Design & Layout | [Student ID] |
| Joshua Mugisha | Data Management & API Testing | [Student ID] |

## Project Overview

EduShare is a web application where learners can browse a shared catalog of learning resources such as revision packs, quiz sheets and study guides. Each resource is tagged with a subject, an education level (Primary, Secondary, University) and a language, so students can narrow the catalog down to exactly what they need for their exams.

Students can mark a resource as **helpful**. Resources are ranked by their helpful votes, so the community collectively surfaces the best material instead of relying on a single curator. Teachers and tutors can use the same catalog to distribute their lesson materials to a wider audience.

The application is split into a React frontend and a Node.js/Express REST API. This separation keeps the user interface and the business logic independent, so each part can be developed, tested, containerized and deployed on its own as the project evolves towards a service-based architecture in later phases.

## Target Users

- **Secondary school students** preparing for national exams
- **University students** sharing and finding revision content
- **Teachers and tutors** who want to distribute lesson resources beyond their own classroom

## Core Features

- **Feature 1: Browse resources.** View a shared catalog of learning resources loaded from the API.
- **Feature 2: Filter by subject and level.** Narrow results to a specific subject (e.g. Mathematics, Science, ICT) and education level.
- **Feature 3: Helpful voting.** Mark a resource as helpful; the list re-ranks so the most useful content appears first.
- **Feature 4: Responsive interface.** Works on desktop and mobile, with clear loading, error and empty states.

Planned next (see the project board): keyword search ([#8](https://github.com/maridadithierry/EduShare-Platform-/issues/8)), sharing new resources through a form ([#9](https://github.com/maridadithierry/EduShare-Platform-/issues/9)), and resource detail pages ([#10](https://github.com/maridadithierry/EduShare-Platform-/issues/10)).

## Technology Stack

- **Backend:** Node.js + Express (REST API)
- **Frontend:** React + TypeScript, built with Vite, routing with React Router
- **Database:** MongoDB, accessed through Mongoose
- **Testing:** Jest + Supertest, with an in-memory MongoDB (`mongodb-memory-server`) so tests need no database setup
- **Other:** Plain CSS, ESLint (frontend and backend), Git + GitHub (feature branches, pull requests, GitHub Projects)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.19 or later (includes npm); check with `node -v`
- [Git](https://git-scm.com/)
- A MongoDB database: [MongoDB Community](https://www.mongodb.com/try/download/community) running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- Ports `4000` (API) and `5173` (frontend) free on your machine

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/maridadithierry/EduShare-Platform-.git
   cd EduShare-Platform-
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Create the backend environment file and set `MONGODB_URI` to your database
   ```bash
   cp .env.example .env
   ```
   `.env` is ignored by Git, so real connection strings and passwords never get committed.

4. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

### Run the application

Start the API (terminal 1, from the project root):
```bash
cd backend
npm run dev
```
The API runs at `http://localhost:4000`. On first start it fills an empty database with sample resources.

Start the frontend (terminal 2, from the project root):
```bash
cd frontend
npm run dev
```
The app runs at `http://localhost:5173`. The Vite dev server forwards `/api` requests to the backend.

To run the production build from a single server, build the frontend and start the backend. Express then serves both the React app and the API at `http://localhost:4000`:
```bash
cd frontend && npm run build
cd ../backend && npm start
```

### Testing and linting

```bash
cd backend
npm run lint    # ESLint; exits with an error if any rule fails
npm test        # Jest API tests against a temporary in-memory MongoDB

cd ../frontend
npm run lint    # ESLint
npm run build   # type-check and build for production
```
The first `npm test` downloads a MongoDB test binary (about 100 MB), pinned to version 7.0.14 in `backend/package.json`, so it can take a few minutes. Later runs take around 10 seconds.

## Usage

1. Open `http://localhost:5173` and click **Explore Resources**, or go straight to `http://localhost:5173/resources`.
2. Use the **Subject** and **Level** dropdowns to filter the catalog.
3. Click **Helpful** on a resource; its count goes up and the list re-ranks.

The API can also be called directly:

```bash
# Health check
curl http://localhost:4000/health

# List all resources (sorted by helpful votes)
curl http://localhost:4000/api/resources

# Filter by subject and level, or search titles and subjects
curl "http://localhost:4000/api/resources?subject=Mathematics&level=Primary"
curl "http://localhost:4000/api/resources?search=algebra"

# Share a new resource
curl -X POST http://localhost:4000/api/resources \
  -H "Content-Type: application/json" \
  -d '{"title":"WAEC Physics Notes","subject":"Physics","description":"Mechanics and electricity.","url":"https://example.com/physics","level":"Secondary"}'

# Mark a resource as helpful (use an "id" from the list above)
curl -X POST http://localhost:4000/api/resources/<id>/helpful
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/api/resources?subject=&level=&search=` | List resources, optionally filtered or searched |
| POST | `/api/resources` | Share a new resource (`title`, `subject`, `description`, `url` required) |
| POST | `/api/resources/:id/helpful` | Add a helpful vote to a resource |
| POST | `/api/resources/:id/flag` | Flag a resource; it is hidden after 3 flags |

## Project Structure

```
.
├── backend/                  # Express REST API
│   ├── config/               # MongoDB connection
│   ├── controllers/          # Request handling and validation
│   ├── models/               # Mongoose Resource schema
│   ├── repositories/         # Database queries, kept out of controllers
│   ├── routes/               # API route definitions
│   ├── seed/                 # Sample resources for an empty database
│   ├── tests/                # Jest + Supertest API tests
│   ├── .env.example          # Environment variables template
│   ├── eslint.config.js
│   ├── package.json
│   └── server.js             # App setup; serves the API and the built frontend
├── frontend/                 # React + TypeScript client (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/       # Navbar, Footer
│   │   ├── pages/            # Home, Resources
│   │   ├── services/         # resourcesApi.ts: API calls, kept out of UI components
│   │   ├── App.tsx           # Routes
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts        # Dev server and /api proxy
├── .gitignore
├── LICENSE
└── README.md
```

## Collaboration Workflow

1. Pick an issue from the project board and move it to **In progress**.
2. Create a branch from the latest `main` (e.g. `feature/search-resources`).
3. Commit in small, focused steps and push the branch.
4. Open a pull request to `main` with `Closes #<issue>` in the description.
5. At least one teammate reviews and approves; all conversations are resolved.
6. Merge the pull request; the issue closes and moves to **Done**.

## Security & Branch Protection

- **`.gitignore`** excludes dependencies (`node_modules/`), build output, logs, IDE files and all environment/secret files (`.env`, `.env.*`, `config.local.*`), so secrets and generated files never reach the repository.
- **Branch protection on `main`** ([#11](https://github.com/maridadithierry/EduShare-Platform-/issues/11)):

| Rule | Why it matters |
|------|----------------|
| Require a pull request before merging | No one can push directly to `main`; every change is visible and discussable |
| Require 1 approval | Every change gets a second pair of eyes before it ships |
| Dismiss stale approvals on new commits | An approval only counts for the code that was actually reviewed |
| Require status checks to pass | Broken builds or failing tests cannot be merged (CI checks added in F2) |
| Require branches to be up to date | Changes are tested against the latest `main`, avoiding surprise conflicts |
| Require conversation resolution | Review feedback is addressed, not ignored |
| Include administrators | The rules apply to everyone, including the team lead |

## Links

- [Project Board](https://github.com/users/maridadithierry/projects/15)
- [Issues](https://github.com/maridadithierry/EduShare-Platform-/issues)
- [Pull Requests](https://github.com/maridadithierry/EduShare-Platform-/pulls)

## License

This project is licensed under the [MIT License](LICENSE).
