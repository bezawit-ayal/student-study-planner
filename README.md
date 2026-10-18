# StudyFlow

StudyFlow is a React and Vite student planner backed by an Express API and MongoDB.

## Requirements

- Node.js
- MongoDB running locally, or a MongoDB connection URI

## Run locally

1. Install frontend dependencies from the project root:

   ```sh
   npm install
   ```

2. Configure the backend environment. Copy `server/.env.example` to
   `server/.env` and set `MONGODB_URI` to your MongoDB connection string.
   The default example uses the local `studyflow` database.

3. Install backend dependencies and start the API:

   ```sh
   npm install --prefix server
   npm run dev --prefix server
   ```

   The API listens on port `5000` by default. Verify it at
   `http://127.0.0.1:5000/api/health`.

4. In a second terminal, start the frontend:

   ```sh
   npm run dev
   ```

   Vite proxies `/api` requests to the backend on port `5000`. For a separately
   hosted API, set `VITE_API_URL` in the frontend environment.

   Run the backend schema tests with `npm run test:server` from the project root.

## API overview

- `GET`, `POST /api/subjects`
- `PATCH`, `DELETE /api/subjects/:id`
- `POST`, `PATCH`, `DELETE /api/subjects/:id/{assignments|exams|study-sessions}`
- `GET`, `POST /api/focus-sessions`
- `GET`, `POST /api/notifications`
- `PATCH`, `DELETE /api/notifications/:id`
- `POST /api/users`, `GET`, `PATCH /api/users/:id`

Responses use a JSON envelope with `success` and `data` or `message` fields.
The user endpoints provide basic profile storage only. Authentication and
per-user data isolation are not implemented, so run the API only in a trusted
development environment. Profile fields are stored in MongoDB; study
preferences are stored in the current browser.

## Development status

- The welcome page uses a verified Unsplash study photograph, a forest-green
  overlay, responsive layout, and direct entry into the workspace.
- Workspace pages cover dashboard, subjects, assignments, exams, study
  planning, focus timing, progress, notifications, and profile settings.
- Subject activities use the existing nested MongoDB documents; focus sessions,
  reminders, and basic profile details use their dedicated API records.
- The application uses the golden-green theme and a fixed desktop/mobile
  sidebar. Backend schema checks run without connecting to or changing data.
- No authentication, email delivery, or scheduled reminder service is claimed
  or implemented.
