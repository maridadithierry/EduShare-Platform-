# EduShare Platform

EduShare Platform helps African students and teachers share low-cost learning resources in one place.

## Problem Statement
Many students across African communities rely on fragmented WhatsApp groups, paper notes, or expensive platforms to access study content. This creates unequal access to exam prep materials and slows peer-to-peer learning.

EduShare addresses this by offering a simple, lightweight space where learning resources can be discovered, filtered, and rated by usefulness.

## Target Users
- Secondary school students preparing for national exams
- University students sharing revision content
- Teachers and tutors who want to distribute lesson resources

## Core Features
- Browse learning resources from a shared catalog
- Filter resources by subject and education level
- Mark resources as helpful so the most useful content surfaces first
- Responsive interface for desktop and mobile use
- API-backed resource retrieval for frontend integration

## Technology Stack
- Frontend: React + TypeScript + Vite + React Router
- Backend: Node.js + Express
- Styling: Plain CSS
- Version Control: Git + GitHub (feature branches + pull requests)

## Current Implemented Feature (F1 Scope)
This repository currently includes an initial working vertical slice:
- Backend API endpoint that returns resource items
- Frontend Resources page that fetches and displays data from the API
- Subject and level filters
- Helpful voting action that updates ranking in real time
- Loading, error, and empty states

## Repository Structure
```
.
├── backend
│   ├── package.json
│   └── server.js
├── frontend
│   ├── package.json
│   └── src
└── README.md
```

## How to Run Locally

### 1. Clone and move into the project
```bash
git clone https://github.com/maridadithierry/EduShare-Platform-.git
cd EduShare-Platform-
```

### 2. Install backend dependencies and start API
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:4000`.

### 3. In a second terminal, install frontend dependencies and start app
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` and proxies `/api` requests to backend.

## Collaboration Workflow
- Create branch from latest `main`
- Implement one focused task per branch
- Open pull request to `main`
- Require at least one approval before merge
- Resolve all review comments before merging

## DevOps and Security Baseline for F1
- Comprehensive `.gitignore` to prevent committing secrets and build artifacts
- Team will enforce branch protection on `main` with pull-request-based merges
- GitHub Project board used for backlog, in-progress work, and done items

## License
MIT License.