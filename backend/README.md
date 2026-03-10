# Mental Wellness App - Backend

Node.js / Express / MongoDB backend API for the Mental Wellness App frontend.

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- dotenv
- cors

## Setup

1. Navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the `backend` folder based on `.env.example`:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## API Routes

### Health

- `GET /api/health` - Service health check

### Auth (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current logged-in user (protected)

### Journal (`/api/journal`)

- `POST /create` - Create a new journal entry (protected)
- `GET /user` - Get logged-in user's journals (protected)
- `PUT /update/:id` - Update a journal entry (protected)
- `DELETE /delete/:id` - Delete a journal entry (protected)

### Mood (`/api/mood`)

- `POST /add` - Add a mood entry (protected)
- `GET /user` - Get logged-in user's mood history (protected)
