# MileLog

MileLog is a mileage tracker app scaffold with a Node.js + Express backend and a frontend public entry file.

## Project Structure

- `backend/` - Express API, authentication, and SQLite persistence
- `frontend/public/index.html` - Frontend HTML entry point

## Backend Files

- `backend/server.js` - API server setup and route registration
- `backend/db.js` - SQLite connection and schema initialization
- `backend/middleware/auth.js` - JWT auth middleware
- `backend/routes/auth.js` - Register/login endpoints
- `backend/routes/trips.js` - Protected CRUD endpoints for trips
- `backend/routes/distance.js` - Protected distance estimate endpoint (stub)
- `backend/.env.example` - Environment variable template
- `backend/package.json` - Backend dependencies and scripts

## Quick Start

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   ```

3. Start backend:

   ```bash
   npm run dev
   ```

4. Verify health endpoint:

   - [http://localhost:4000/api/health](http://localhost:4000/api/health)

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Trips (JWT required)

- `GET /api/trips`
- `POST /api/trips`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`

### Distance (JWT required)

- `GET /api/distance/estimate?from=Start&to=End`

> `distance` route currently returns a stub estimate and is intended to be replaced by a real maps provider integration.
