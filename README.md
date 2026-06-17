# ALBIS

ALBIS is an AI Operations Manager for families. It helps parents coordinate tasks, schedules, reminders, responsibilities, and family activity in one calm operations hub.

## Stack

- React 19, TypeScript, Redux Toolkit, React Router, Material UI, React Hook Form
- Node.js, Express, MongoDB, Mongoose, JWT authentication
- Docker Compose for MongoDB, API, and web app

## Local Development

1. Install dependencies:

   ```bash
   npm run install:all
   ```

2. Configure the API:

   ```bash
   cp server/.env.example server/.env
   ```

3. Start MongoDB locally or with Docker:

   ```bash
   docker compose up mongo
   ```

4. Seed demo data:

   ```bash
   npm run seed
   ```

5. Run the API and web app in separate terminals:

   ```bash
   npm run dev:server
   npm run dev:client
   ```

Demo login:

- Email: `john@albis.local`
- Password: `password123`

## Docker

```bash
docker compose up --build
```

Web: `http://localhost:5173`

API health: `http://localhost:5000/health`

## Production Notes

- Replace `JWT_SECRET` before deployment.
- Use managed MongoDB or a hardened Mongo deployment.
- Set `VITE_API_URL` to the deployed API URL when building the client.
- The MVP uses mocked AI responses in `server/src/services/ai.service.ts`.

## API Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `GET /api/families/current`
- `POST /api/families`
- `POST /api/families/invite`
- `PUT /api/families/members/:userId/role`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/reminders`
- `GET /api/dashboard/summary`
- `POST /api/assistant/chat`
- `GET /api/notifications`
- `PUT /api/notifications/:id/read`

## Verified

```bash
npm run typecheck
npm run build
npm --prefix server audit
npm --prefix client audit
```
